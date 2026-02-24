import type { Child } from 'hono/jsx';

export interface IAlert {
	readonly title?: string | undefined;
	readonly type: 'danger' | 'info' | 'success' | 'warning';
	readonly children?: Child;
}

function resolveType(type: IAlert['type']) {
	switch (type) {
		case 'danger': {
			return {
				text: 'text-red-500',
				border: 'border-red-500',
				icon: (
					<svg
						stroke="currentColor"
						fill="currentColor"
						stroke-width="0"
						viewBox="0 0 16 16"
						height="20"
						width="20"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="Danger icon"
					>
						<title>Danger icon</title>
						<path d="M7.568 2.34L1.248 12.91C1.038 13.26 1.298 13.7 1.708 13.7H14.288C14.698 13.7 14.958 13.26 14.748 12.91L8.428 2.34C8.228 1.99 7.768 1.99 7.568 2.34ZM8 12H7V11H8V12ZM8 10H7V6.5H8V10Z" />
					</svg>
				),
			};
		}

		case 'info': {
			return {
				text: 'text-blue-500',
				border: 'border-blue-500',
				icon: (
					<svg
						stroke="currentColor"
						fill="currentColor"
						stroke-width="0"
						viewBox="0 0 16 16"
						height="20"
						width="20"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="Info icon"
					>
						<title>Info icon</title>
						<path d="M8 9H9V13H8V9ZM8 7H9V8H8V7ZM8 15C4.134 15 1 11.866 1 8C1 4.134 4.134 1 8 1C11.866 1 15 4.134 15 8C15 11.866 11.866 15 8 15ZM8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.314 14 14 11.314 14 8C14 4.686 11.314 2 8 2Z" />
					</svg>
				),
			};
		}

		case 'success': {
			return {
				text: 'text-green-500',
				border: 'border-green-500',
				icon: (
					<svg
						stroke="currentColor"
						fill="currentColor"
						stroke-width="0"
						viewBox="0 0 16 16"
						height="20"
						width="20"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="Success icon"
					>
						<title>Success icon</title>
						<path d="M8 1c0 0-2 2-2 4.5S7.5 9 8 9s2-1.5 2-3.5S8 1 8 1zM4.5 13.5c0 0 .5-3 2-4.5S9 7 9 7s.5 2 1.5 3 2 4.5 2 4.5.5-1.5-.5-3-2.5-3.5-2.5-3.5 1.5.5 1.5 2.5-1.5 4.5-5.5 4.5z" />
					</svg>
				),
			};
		}

		case 'warning': {
			return {
				text: 'text-yellow-500',
				border: 'border-yellow-500',
				icon: (
					<svg
						stroke="currentColor"
						fill="currentColor"
						stroke-width="0"
						viewBox="0 0 16 16"
						height="20"
						width="20"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="Danger icon"
					>
						<title>Danger icon</title>
						<path d="M7.568 2.34L1.248 12.91C1.038 13.26 1.298 13.7 1.708 13.7H14.288C14.698 13.7 14.958 13.26 14.748 12.91L8.428 2.34C8.228 1.99 7.768 1.99 7.568 2.34ZM8 12H7V11H8V12ZM8 10H7V6.5H8V10Z" />
					</svg>
				),
			};
		}
	}
}

export function Alert({ title, type, children }: IAlert) {
	const { text, border, icon } = resolveType(type);

	return (
		<div class="mb-4 mt-6">
			<div class="relative flex">
				<div class="p-4">{children}</div>
				<div class="pointer-events-none absolute h-full w-full flex">
					<div class={`w-4 shrink-0 border-b-2 border-l-2 border-t-2 rounded-bl-1.5 rounded-tl-1.5 ${border}`} />
					<div class={`relative border-b-2 ${border}`}>
						<div class={`pointer-events-auto flex place-items-center gap-2 px-2 -translate-y-50% ${text}`}>
							{icon}
							{title ? <span class={`font-semibold ${text}`}>{title}</span> : null}
						</div>
					</div>
					<div class={`flex-1 border-b-2 border-r-2 border-t-2 rounded-br-1.5 rounded-tr-1.5 ${border}`} />
				</div>
			</div>
		</div>
	);
}
