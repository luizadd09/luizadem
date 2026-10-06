import { prefersReducedMotion } from './gsap.js';

/**
 * "Scroll ↓" cue under the project gallery.
 * - Visible only while the gallery is its own scroll area *and* has more to show.
 * - Click scrolls the gallery down by most of its height.
 * - Fades out once the last image is reached.
 *
 * Returns a cleanup function, or undefined when the page has no gallery cue.
 */
export function initGalleryScroll() {
	const cue = document.querySelector('[data-gallery-cue]');
	const gallery = cue && document.getElementById(cue.getAttribute('aria-controls'));
	if (!gallery) return;

	const controller = new AbortController();
	const { signal } = controller;

	function update() {
		const max = gallery.scrollHeight - gallery.clientHeight;
		const scrollable = getComputedStyle(gallery).overflowY !== 'visible' && max > 4;
		cue.hidden = !scrollable;
		cue.toggleAttribute('data-done', gallery.scrollTop >= max - 4);
	}

	cue.addEventListener(
		'click',
		() => {
			gallery.scrollBy({
				top: gallery.clientHeight * 0.85,
				behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			});
		},
		{ signal },
	);
	gallery.addEventListener('scroll', update, { passive: true, signal });

	// Images loading or the window resizing both change whether there's anything to scroll.
	const resizeObserver = new ResizeObserver(update);
	resizeObserver.observe(gallery);
	for (const figure of gallery.children) resizeObserver.observe(figure);

	update();

	return () => {
		controller.abort();
		resizeObserver.disconnect();
	};
}
