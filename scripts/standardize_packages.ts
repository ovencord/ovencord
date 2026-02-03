import { join } from "node:path";
import { readdir, readFile, writeFile } from "node:fs/promises";

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = join(ROOT_DIR, "packages");

async function standardize() {
  const packages = await readdir(PACKAGES_DIR);

  for (const pkg of packages) {
    const pkgJsonPath = join(PACKAGES_DIR, pkg, "package.json");
    try {
      const content = await readFile(pkgJsonPath, "utf-8");
      const pkgJson = JSON.parse(content);

      // Update URLs
      if (pkgJson.repository) {
        if (typeof pkgJson.repository === "string") {
          pkgJson.repository = "https://github.com/ovencord/ovencord.git";
        } else {
          pkgJson.repository.url = "https://github.com/ovencord/ovencord.git";
          pkgJson.repository.directory = `packages/${pkg}`;
        }
      }

      if (pkgJson.bugs) {
        pkgJson.bugs.url = "https://github.com/ovencord/ovencord/issues";
      }

      pkgJson.homepage = "https://ovencord.dev";

      // Standardize Contributors
      pkgJson.contributors = ["Ovencord Contributors"];

      await writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, "\t") + "\n");
      console.log(`✅ Standardized ${pkg}`);
    } catch (err) {
      // Skip if not a package directory
    }
  }
}

standardize();
