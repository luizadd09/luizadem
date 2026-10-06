import { gsap, ScrollTrigger } from './gsap.js';
import { retype } from './retype.js';

const MOTION = '(prefers-reduced-motion: no-preference)';

/**
 * Declarative entrance animations driven by `data-animate="…"` attributes.
 * Elements start hidden via CSS (see global.css) and are revealed here.
 *
 * Returns a cleanup function that reverts every tween and ScrollTrigger
 * created for the current page — call it before Astro swaps pages.
 */
export function initAnimations({ delay = 0 } = {}) {
	const mm = gsap.matchMedia();

	// Page-level animations run once per page.
	mm.add(MOTION, () => animate(document.querySelectorAll('[data-animate]:not([data-scroller] [data-animate])'), delay));

	/*
	 * Elements inside a [data-scroller] (the project gallery) reveal as that area scrolls —
	 * but it's only its own scroll area above a breakpoint (data-scroller-media). Rebuild
	 * their animations whenever that changes, e.g. resizing the window or rotating a tablet.
	 */
	for (const scroller of document.querySelectorAll('[data-scroller]')) {
		const targets = scroller.querySelectorAll('[data-animate]');
		let firstRun = true;

		mm.add({ motion: MOTION, scrolls: scroller.dataset.scrollerMedia ?? 'all' }, ({ conditions }) => {
			if (!conditions.motion) return;
			const cleanup = animate(targets, firstRun ? delay : 0);
			firstRun = false;
			return cleanup;
		});
	}

	// Web fonts change layout metrics; recalculate trigger positions once they land.
	document.fonts.ready.then(() => ScrollTrigger.refresh());

	return () => mm.revert();
}

/** Sets up the animation for each element; returns cleanup for anything GSAP can't revert itself. */
function animate(elements, delay) {
	// Elements inside an area that actually scrolls reveal as *that* area scrolls, not the page.
	const scrollerOf = (el) => {
		const scroller = el.closest('[data-scroller]');
		return scroller && getComputedStyle(scroller).overflowY !== 'visible' ? scroller : undefined;
	};

	const isAboveFold = (el) => {
		const scroller = scrollerOf(el);
		const bottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight;
		return el.getBoundingClientRect().top < bottom;
	};

	// Elements visible on load wait for the page transition; the rest play on scroll.
	const enter = (el, offset = 0) =>
		isAboveFold(el)
			? { delay: delay + offset }
			: { scrollTrigger: { trigger: el, scroller: scrollerOf(el), start: 'top 88%', once: true } };

	const show = (el) => gsap.set(el, { autoAlpha: 1 });
	const undo = []; // things GSAP can't revert itself

	const animators = {
		'fade-up'(el) {
			gsap.from(el, { y: 32, autoAlpha: 0, ...enter(el) });
		},

		stagger(el) {
			show(el);
			gsap.from(el.children, { y: 18, autoAlpha: 0, stagger: 0.08, ...enter(el, 0.25) });
		},

		rule(el) {
			show(el);
			gsap.from(el, { scaleX: 0, duration: 1.4, ease: 'expo.inOut', ...enter(el) });
		},

		clip(el) {
			show(el);
			gsap.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', ...enter(el) });
			gsap.from(el.querySelector('img'), { scale: 1.3, duration: 1.8, ...enter(el) });
		},

		// Each row of cards rises in as it scrolls into view.
		cards(el) {
			let firstDelay = isAboveFold(el) ? delay : 0;
			show(el);
			const cards = el.querySelectorAll('li');
			gsap.set(cards, { yPercent: 12, autoAlpha: 0 });

			ScrollTrigger.batch(cards, {
				start: 'top 90%',
				once: true,
				onEnter(batch) {
					gsap.to(batch, { yPercent: 0, autoAlpha: 1, duration: 1.2, stagger: 0.1, delay: firstDelay });
					firstDelay = 0;
				},
			});
		},

		reveal(el) {
			show(el);
			gsap.from(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.3, ease: 'expo.inOut', ...enter(el) });
			gsap.from(el.querySelector('img, video'), { scale: 1.25, duration: 1.8, ...enter(el) });
		},

		retype(el) {
			const text = el.textContent;
			retype(el, { from: el.dataset.from, to: text, ...enter(el, 0.15) });
			show(el);
			undo.push(() => (el.textContent = text));
		},

		// The image appears block by block, in random order, drawn onto a canvas over it.
		pixels(el) {
			show(el);
			const img = el.querySelector('img');
			const width = +img.getAttribute('width');
			const height = +img.getAttribute('height');
			const BLOCK = 4; // source pixels per block side
			const cols = Math.ceil(width / BLOCK);
			const order = shuffle([...Array(cols * Math.ceil(height / BLOCK)).keys()]);

			const canvas = Object.assign(document.createElement('canvas'), { width, height });
			canvas.setAttribute('aria-hidden', 'true');
			canvas.style.cssText = 'position:absolute;inset:0;inline-size:100%;block-size:100%';
			const ctx = canvas.getContext('2d');
			el.append(canvas);
			img.style.visibility = 'hidden';

			const done = () => {
				canvas.remove();
				img.style.visibility = '';
			};
			const state = { progress: 0 };
			let drawn = 0;

			gsap.to(state, {
				progress: 1,
				duration: 1.6,
				ease: 'power2.inOut',
				...enter(el, 0.2),
				onUpdate() {
					if (!img.complete) return;
					// Only draw the blocks revealed since the last frame.
					for (const target = Math.floor(state.progress * order.length); drawn < target; drawn++) {
						const x = (order[drawn] % cols) * BLOCK;
						const y = Math.floor(order[drawn] / cols) * BLOCK;
						const w = Math.min(BLOCK, width - x);
						const h = Math.min(BLOCK, height - y);
						ctx.drawImage(img, x, y, w, h, x, y, w, h);
					}
				},
				onComplete: done,
			});
			undo.push(done);
		},
	};

	for (const el of elements) {
		animators[el.dataset.animate]?.(el);
	}

	return () => undo.forEach((fn) => fn());
}

/** Fisher–Yates, in place. */
function shuffle(items) {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
	return items;
}
