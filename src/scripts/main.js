import { initPageTransitions, playEnter } from './transitions.js';
import { initAnimations } from './animations.js';
import { initProjectFilter } from './project-filter.js';
import { initCursor } from './cursor.js';
import { initGalleryScroll } from './gallery-scroll.js';
import { initEmbeds } from './embeds.js';
import { initLiquidGrid } from './liquid-grid.js';

/*
 * With <ClientRouter />, bundled module scripts run once per session, so
 * per-page work hangs off Astro's lifecycle events instead of top-level code.
 */
initPageTransitions();
initCursor();

let cleanups = [];

document.addEventListener('astro:page-load', () => {
	const isTransitioning = playEnter();
	// Filter first so animations measure the final layout.
	cleanups = [
		initProjectFilter(),
		initGalleryScroll(),
		initEmbeds(),
		initLiquidGrid(),
		initAnimations({ delay: isTransitioning ? 0.45 : 0.1 }),
	];
});

// The overlay hides the old page at this point, so reverting is invisible.
document.addEventListener('astro:before-swap', () => {
	for (const cleanup of cleanups) cleanup?.();
	cleanups = [];
});
