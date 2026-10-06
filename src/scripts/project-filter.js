import { gsap, Flip, ScrollTrigger, prefersReducedMotion } from './gsap.js';

const PARAM = 'filter';

/**
 * Category filter for the projects grid.
 *
 * Visible cards are re-packed into rows of `data-per-row` (rows matter for the
 * hover-to-widen effect), filtered-out cards get [hidden], and GSAP Flip
 * animates every card from its old spot to its new one.
 * The active filter is mirrored in the URL (?filter=branding) so it can be shared.
 *
 * Returns a cleanup function, or undefined when the page has no filter.
 */
export function initProjectFilter() {
	const section = document.querySelector('[data-project-filter]');
	if (!section) return;

	const buttons = [...section.querySelectorAll('[data-filter]')];
	const track = section.querySelector('[data-track]');
	const status = section.querySelector('[data-filter-status]');
	const cards = [...track.querySelectorAll('[data-categories]')];
	const perRow = Number(track.dataset.perRow);
	const rowTemplate = track.querySelector('ul').cloneNode(false);
	const controller = new AbortController();
	let flip;

	const matches = (card, filter) => filter === 'all' || card.dataset.categories.split(' ').includes(filter);

	function render(filter, { animate }) {
		const visible = cards.filter((card) => matches(card, filter));
		const hidden = cards.filter((card) => !visible.includes(card));
		// Measure before touching anything. getState() also finishes any flip still running.
		const startHeight = track.offsetHeight;
		const state = animate ? Flip.getState(cards) : null;
		gsap.set(track, { clearProps: 'height' });

		// Re-pack visible cards into full rows; hidden ones park at the end of the last row.
		const rowCount = Math.max(1, Math.ceil(visible.length / perRow));
		const rows = Array.from({ length: rowCount }, (_, i) => {
			const row = track.children[i] ?? rowTemplate.cloneNode(false);
			row.replaceChildren(...visible.slice(i * perRow, (i + 1) * perRow));
			return row;
		});
		rows.at(-1).append(...hidden);
		track.replaceChildren(...rows);

		for (const card of cards) card.hidden = !visible.includes(card);
		for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));

		const label = buttons.find((button) => button.dataset.filter === filter)?.title ?? 'All projects';
		status.textContent = `${label}: showing ${visible.length} ${visible.length === 1 ? 'project' : 'projects'}`;

		if (state) {
			const endHeight = track.offsetHeight;

			flip = Flip.from(state, {
				duration: 0.8,
				ease: 'expo.inOut',
				absolute: true,
				stagger: 0.03,
				onEnter: (els) =>
					gsap.fromTo(
						els,
						{ autoAlpha: 0, yPercent: 10 },
						{ autoAlpha: 1, yPercent: 0, duration: 0.7, delay: 0.25, overwrite: true },
					),
				onLeave: (els) => gsap.to(els, { autoAlpha: 0, yPercent: -6, duration: 0.4, ease: 'power2.in', overwrite: true }),
				// Release the height only once every card (incl. the staggered last one) is back in flow.
				onComplete: () => {
					gsap.set(track, { clearProps: 'height' });
					ScrollTrigger.refresh();
				},
			});

			// `absolute: true` lifts the cards out of the layout while they move, which would
			// collapse the grid and make the footer jump. Hold the old height and glide to the new one.
			flip.fromTo(track, { height: startHeight }, { height: endHeight, duration: 0.8, ease: 'expo.inOut' }, 0);
		} else {
			ScrollTrigger.refresh();
		}
	}

	function setFilter(filter, options) {
		render(filter, options);

		const url = new URL(location.href);
		if (filter === 'all') url.searchParams.delete(PARAM);
		else url.searchParams.set(PARAM, filter);
		// Keep Astro's router state so back/forward still work.
		history.replaceState(history.state, '', url);
	}

	section.addEventListener(
		'click',
		(event) => {
			const button = event.target.closest('[data-filter]');
			if (!button || button.getAttribute('aria-pressed') === 'true') return;
			setFilter(button.dataset.filter, { animate: !prefersReducedMotion() });
		},
		{ signal: controller.signal },
	);

	// Restore a shared/bookmarked filter without animating.
	const initial = new URL(location.href).searchParams.get(PARAM);
	if (initial && buttons.some((button) => button.dataset.filter === initial)) {
		render(initial, { animate: false });
	}

	return () => {
		controller.abort();
		flip?.kill();
	};
}
