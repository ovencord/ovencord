import type { Child } from 'hono/jsx';

export interface SectionOptions {
	readonly background?: boolean | undefined;
	readonly buttonClassName?: string;
	readonly className?: string;
	readonly defaultClosed?: boolean | undefined;
	readonly gutter?: boolean | undefined;
	readonly icon?: Child | undefined;
	readonly padded?: boolean | undefined;
	readonly title: string;
	readonly children?: Child;
}

export function Section({
	title,
	icon,
	padded = false,
	defaultClosed = false,
	background = false,
	gutter = false,
	children,
	className = '',
	buttonClassName = '',
}: SectionOptions) {
	return (
		<div class={`flex flex-col ${className}`}>
			<details class="group" open={!defaultClosed}>
				<summary
					class={
						buttonClassName
							? buttonClassName
							: 'hover:bg-light-800 active:bg-light-900 dark:bg-dark-400 dark:hover:bg-dark-300 dark:active:bg-dark-200 focus:ring-width-2 focus:ring-blurple rounded bg-white p-3 outline-none focus:ring list-none cursor-pointer'
					}
				>
					<div class="flex flex-row place-content-between place-items-center">
						<div class="flex flex-row place-items-center gap-3">
							{icon ?? null}
							<span class="font-semibold">{title}</span>
						</div>
						<svg
							class={`transform transition duration-150 ease-in-out group-open:rotate-180 rotate-0`}
							stroke="currentColor"
							fill="currentColor"
							stroke-width="0"
							viewBox="0 0 16 16"
							height="20"
							width="20"
							xmlns="http://www.w3.org/2000/svg"
							role="img"
							aria-label="Chevron icon"
						>
							<title>Chevron icon</title>
							<path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
						</svg>
					</div>
				</summary>
				<div class={`${background ? 'bg-light-700 dark:bg-dark-500 rounded' : ''}  ${gutter ? 'mt-2' : ''}`}>
					{padded ? <div class="mx-2 px-0 py-5 md:mx-6.5 md:px-4.5">{children}</div> : children}
				</div>
			</details>
		</div>
	);
}
