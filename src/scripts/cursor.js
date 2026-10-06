import { gsap, prefersReducedMotion } from './gsap.js';

/**
 * Pixel-art circle cursor that inverts the colours beneath it (`mix-blend-mode:
 * difference` in Cursor.astro). It follows the pointer with a short glide, grows
 * over interactive elements and shrinks a little while pressed.
 */

const INTERACTIVE = 'a, button, [role="button"], label, summary, [data-cursor-hover]';

const BOX = 56; // element size in px (Cursor.astro) — the largest circle fits it
const PIXEL = 4; // size of one "pixel" of the bitmap circle
const SIZE = { idle: 16, hover: 56, press: 0.7 };

export function initCursor() {
	const cursor = document.querySelector('[data-cursor]');
	if (!cursor || !window.matchMedia('(pointer: fine)').matches) return;

	const glide = prefersReducedMotion() ? 0 : 0.18;
	// Whole-pixel positions keep the bitmap edges sharp instead of anti-aliased.
	const snap = { modifiers: { x: gsap.utils.unitize(Math.round), y: gsap.utils.unitize(Math.round) } };
	const moveX = gsap.quickTo(cursor, 'x', { duration: glide, ease: 'power3.out', ...snap });
	const moveY = gsap.quickTo(cursor, 'y', { duration: glide, ease: 'power3.out', ...snap });
	gsap.set(cursor, { xPercent: -50, yPercent: -50 });

	let hovering = false;
	let pressed = false;
	const circle = { size: SIZE.idle };
	const draw = () => (cursor.style.clipPath = pixelCircle(circle.size));
	draw();

	const resize = () =>
		gsap.to(circle, {
			size: (hovering ? SIZE.hover : SIZE.idle) * (pressed ? SIZE.press : 1),
			duration: prefersReducedMotion() ? 0 : 0.35,
			ease: 'power3.out',
			overwrite: 'auto',
			onUpdate: draw,
		});

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType !== 'mouse') return;

			// First movement: jump into place, then take over from the system cursor.
			if (!cursor.hasAttribute('data-active')) {
				gsap.set(cursor, { x: event.clientX, y: event.clientY });
				cursor.setAttribute('data-active', '');
			}
			cursor.setAttribute('data-visible', '');
			moveX(event.clientX);
			moveY(event.clientY);
		},
		{ passive: true },
	);

	document.addEventListener('pointerover', (event) => {
		// Inside an iframe (e.g. the 3D viewer) the page stops getting mouse moves,
		// so hide the circle rather than leave it stuck at the edge.
		if (event.target.tagName === 'IFRAME') {
			cursor.removeAttribute('data-visible');
			return;
		}

		const next = Boolean(event.target.closest?.(INTERACTIVE));
		if (next !== hovering) {
			hovering = next;
			resize();
		}
	});

	window.addEventListener('pointerdown', () => {
		pressed = true;
		resize();
	});

	window.addEventListener('pointerup', () => {
		pressed = false;
		resize();
	});

	// Hide when the pointer leaves the window; it reappears on the next move.
	document.documentElement.addEventListener('pointerleave', () => cursor.removeAttribute('data-visible'));

	// After a page swap the element under the pointer is new, so reset the hover state.
	document.addEventListener('astro:after-swap', () => {
		hovering = false;
		pressed = false;
		resize();
	});
}

/**
 * clip-path outline of a pixel-art circle about `size` px wide, centred in the
 * BOX: an even number of PIXEL-sized rows, each as wide as the circle at its middle.
 */
function pixelCircle(size) {
	const cells = 2 * Math.max(1, Math.round(size / (2 * PIXEL)));
	const r = cells / 2;
	const offset = (BOX - cells * PIXEL) / 2;
	const right = [];
	const left = [];

	for (let row = 0; row < cells; row++) {
		const dy = row + 0.5 - r;
		const half = Math.round(Math.sqrt(r * r - dy * dy));
		const top = offset + row * PIXEL;
		const bottom = top + PIXEL;
		const xr = offset + (r + half) * PIXEL;
		const xl = offset + (r - half) * PIXEL;
		right.push(`${xr}px ${top}px`, `${xr}px ${bottom}px`);
		left.unshift(`${xl}px ${bottom}px`, `${xl}px ${top}px`);
	}
	return `polygon(${[...right, ...left].join(',')})`;
}
