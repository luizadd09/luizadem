import { gsap } from './gsap.js';

const GLYPHS = 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЮЯабвгґдеєжзиіїйклмнопрстуфхцчшщюяABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Retypes `el` from `from` to `to`, left to right, like someone overtyping it.
 * A short run of flickering glyphs travels ahead of the finished letters,
 * and characters past it keep showing the original text.
 *
 * Returns the GSAP tween, so it accepts ScrollTrigger, delay, etc. via `vars`.
 */
export function retype(el, { from, to, flicker = 3, speed = 0.08, ...vars }) {
	const from_ = [...from];
	const to_ = [...to];
	const length = Math.max(from_.length, to_.length);
	const state = { cursor: 0 };
	const glyphs = [];
	let lastSwap = -1;

	el.textContent = from;

	return gsap.to(state, {
		cursor: length + flicker,
		duration: (length + flicker) * speed,
		ease: 'none',
		onUpdate() {
			// Swap the flickering glyphs ~20×/s instead of every frame so they stay legible.
			const swap = Math.floor(this.time() * 20);
			const shouldSwap = swap !== lastSwap;
			lastSwap = swap;

			const head = Math.floor(state.cursor);
			let text = '';

			for (let i = 0; i < length; i++) {
				if (i < head - flicker) {
					text += to_[i] ?? '';
				} else if (i < head) {
					if (shouldSwap || !glyphs[i]) glyphs[i] = randomGlyph();
					text += to_[i] === ' ' ? ' ' : glyphs[i];
				} else {
					text += from_[i] ?? '';
				}
			}

			el.textContent = text;
		},
		onComplete() {
			el.textContent = to;
		},
		...vars,
	});
}
