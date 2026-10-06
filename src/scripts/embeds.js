/**
 * Click-to-load 3D embeds (Sketchfab) in project galleries.
 *
 * The page ships only a poster image and a "View in 3D" link to the model's page.
 * Clicking it swaps the poster for the live viewer in place, so the heavy WebGL
 * viewer — and Sketchfab's own scripts — only load for people who ask for it.
 *
 * Returns a cleanup function, or undefined when the page has no embeds.
 */
export function initEmbeds() {
	const embeds = document.querySelectorAll('[data-embed]');
	if (embeds.length === 0) return;

	const controller = new AbortController();

	for (const embed of embeds) {
		embed.querySelector('[data-embed-load]')?.addEventListener(
			'click',
			(event) => {
				event.preventDefault();

				const url = new URL(embed.dataset.embed);
				url.searchParams.set('autostart', '1');
				url.searchParams.set('dnt', '1'); // Sketchfab "do not track"

				const iframe = document.createElement('iframe');
				iframe.src = url.href;
				iframe.title = embed.dataset.embedTitle;
				iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
				iframe.allowFullscreen = true;

				embed.replaceChildren(iframe);
				iframe.focus();
			},
			{ signal: controller.signal },
		);
	}

	return () => controller.abort();
}
