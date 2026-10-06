import { gsap, prefersReducedMotion } from './gsap.js';

/**
 * Page transitions on top of Astro's <ClientRouter />.
 *
 * Lifecycle:
 *  1. astro:before-preparation → wrap Astro's loader so the overlay wipes in
 *     while the next page is fetched (both run in parallel).
 *  2. Astro swaps the DOM underneath the persisted overlay.
 *  3. astro:page-load → `playEnter()` wipes the overlay away.
 */

const COVER = 'inset(100% 0% 0% 0%)';
const FULL = 'inset(0% 0% 0% 0%)';
const GONE = 'inset(0% 0% 100% 0%)';

let isCovered = false;
let timeline;
let defaultLabel;

const getOverlay = () => document.querySelector('[data-transition-overlay]');

function coverScreen(labelText) {
	const overlay = getOverlay();
	if (!overlay || prefersReducedMotion()) return Promise.resolve();

	const label = overlay.querySelector('[data-transition-label]');
	defaultLabel ??= label.textContent;
	label.textContent = labelText ?? defaultLabel;

	timeline?.kill();
	isCovered = true;

	timeline = gsap
		.timeline()
		.set(overlay, { clipPath: COVER })
		.to(overlay, { clipPath: FULL, duration: 0.8, ease: 'expo.inOut' })
		.fromTo(label, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6 }, '-=0.35');

	return timeline.then();
}

/** Reveals the new page. Returns true when an exit animation was playing. */
export function playEnter() {
	if (!isCovered) return false;
	isCovered = false;

	const overlay = getOverlay();
	const label = overlay.querySelector('[data-transition-label]');

	timeline?.kill();
	timeline = gsap
		.timeline()
		.to(label, { yPercent: -60, autoAlpha: 0, duration: 0.4, ease: 'power3.in' })
		.to(overlay, { clipPath: GONE, duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
		.set(overlay, { clipPath: COVER });

	return true;
}

export function initPageTransitions() {
	document.addEventListener('astro:before-preparation', (event) => {
		const trigger = event.sourceElement?.closest('[data-transition-title]');
		const loadPage = event.loader;

		event.loader = async () => {
			await Promise.all([coverScreen(trigger?.dataset.transitionTitle), loadPage()]);
		};
	});

	// Jumps to #anchors on the new page should happen instantly under the overlay,
	// not as a visible smooth scroll. Smooth scrolling comes back once the page is in.
	document.addEventListener('astro:before-swap', (event) => {
		event.newDocument.documentElement.style.scrollBehavior = 'auto';
	});

	document.addEventListener('astro:page-load', () => {
		document.documentElement.style.removeProperty('scroll-behavior');
	});
}
