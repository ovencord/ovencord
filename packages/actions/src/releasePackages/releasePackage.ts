import { info, warning } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import type { PackageJSON } from '@npm/types';
import { $, file, write } from 'bun';
import type { ReleaseEntry } from './generateReleaseTree.js';

let octokit: ReturnType<typeof getOctokit> | undefined;

if (process.env.GITHUB_TOKEN) {
	octokit = getOctokit(process.env.GITHUB_TOKEN);
}

async function checkRegistry(release: ReleaseEntry) {
	const res = await fetch(`https://registry.npmjs.org/${release.name}/${release.version}`);
	return res.ok;
}

async function gitTagAndRelease(release: ReleaseEntry, dry: boolean) {
	const tagName = `${release.name === 'discord.js' ? `` : `${release.name}@`}${release.version}`;

	if (dry) {
		info(`[DRY] Release would be "${tagName}", skipping release creation.`);
		return;
	}

	const commitHash = (await $`git rev-parse HEAD`.text()).trim();

	try {
		await octokit?.rest.repos.createRelease({
			...context.repo,
			tag_name: tagName,
			target_commitish: commitHash,
			name: tagName,
			body: release.changelog ?? '',
			generate_release_notes: release.changelog === undefined,
			make_latest: release.name === 'discord.js' ? 'true' : 'false',
		});
	} catch (error) {
		warning(`Failed to create github release: ${error}`);
	}
}

export async function releasePackage(
	release: ReleaseEntry,
	dry: boolean,
	versionMap: Map<string, string>,
	devTag?: string,
	doGitRelease = !devTag,
) {
	// Sanity check against the registry first
	if (await checkRegistry(release)) {
		info(`${release.name}@${release.version} already published, skipping.`);
		return false;
	}

	const pkgJsonPath = `${release.path}/package.json`;
	const pkgJsonContent = await file(pkgJsonPath).text();
	const pkgJson = JSON.parse(pkgJsonContent) as PackageJSON;

	// Transform dependencies
	const transformDeps = (deps?: Record<string, string>) => {
		if (!deps) return;
		for (const [name, version] of Object.entries(deps)) {
			if (version.startsWith('workspace:')) {
				const realVersion = versionMap.get(name);
				if (realVersion) {
					deps[name] = version.replace('workspace:', '').replace(/[\^~*]/, '') + realVersion;
					// Standardize to ^Version if it was workspace:^
					if (version.includes('^')) deps[name] = `^${realVersion}`;
					else if (version.includes('~')) deps[name] = `~${realVersion}`;
					else deps[name] = realVersion;
				}
			}
		}
	};

	transformDeps(pkgJson.dependencies);
	transformDeps(pkgJson.devDependencies);
	transformDeps(pkgJson.peerDependencies);

	if (dry) {
		info(`[DRY] Releasing ${release.name}@${release.version}`);
		info(`[DRY] Dependencies transformed: ${JSON.stringify(pkgJson.dependencies)}`);
	} else {
		// Temporary write transformed package.json
		await write(pkgJsonPath, JSON.stringify(pkgJson, null, '\t') + '\n');
		try {
			await $`npm publish --access public ${devTag ? `--tag ${devTag}` : ''}`.cwd(release.path);
		} finally {
			// Restore original package.json
			await write(pkgJsonPath, pkgJsonContent);
		}
	}

	// && !devTag just to be sure
	if (doGitRelease && !devTag) await gitTagAndRelease(release, dry);

	if (dry) return true;

	const before = performance.now();

	// Poll registry to ensure next publishes won't fail
	await new Promise<void>((resolve, reject) => {
		const interval = setInterval(async () => {
			if (await checkRegistry(release)) {
				clearInterval(interval);
				resolve();
				return;
			}

			if (performance.now() > before + 5 * 60 * 1_000) {
				clearInterval(interval);
				reject(new Error(`Release for ${release.name} failed.`));
			}
		}, 15_000);
	});

	if (devTag) {
		// Send and forget, deprecations are less important than releasing other dev versions and can be done manually
		void $`bunx npm-deprecate --name "*${devTag}*" --message "This version is deprecated. Please use a newer version." --package ${release.name}`
			.nothrow()
			// eslint-disable-next-line
			.then(() => {});
	}

	return true;
}
