import { gsap, prefersReducedMotion } from './gsap.js';

const CELL = 48; // grid spacing, CSS px
const STEP = 16; // segment length along each line
const ALPHA = 0.035; // line opacity — barely there
const WAVE = 8; // ambient sway, px
const RIPPLE = 22; // max push around the cursor, px
const RADIUS = 160; // cursor influence radius, px

/**
 * Faint grid on a <canvas>, swaying slowly; it bulges and ripples around the
 * moving cursor, then settles. Canvas 2D on the shared gsap.ticker: a few
 * thousand points per frame, far cheaper than an animated SVG filter.
 * Returns a cleanup function, or undefined when the page has no grid.
 */
export function initLiquidGrid() {
	const canvas = document.querySelector('[data-liquid-grid]');
	if (!canvas) return;

	const ctx = canvas.getContext('2d');
	const still = prefersReducedMotion();
	const controller = new AbortController();
	const mouse = { x: -1e4, y: -1e4, energy: 0 };
	let width = 0;
	let height = 0;

	function resize() {
		const dpr = Math.min(devicePixelRatio || 1, 2);
		width = innerWidth;
		height = innerHeight;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.strokeStyle = getComputedStyle(canvas).color;
		ctx.globalAlpha = ALPHA;
		ctx.lineWidth = 1;
		draw(0);
	}

	// Offset of grid point (x, y) at time t (seconds).
	function offset(x, y, t) {
		let dx = WAVE * Math.sin(y * 0.006 + t * 0.4);
		let dy = WAVE * Math.sin(x * 0.005 + t * 0.3);

		if (mouse.energy > 0.01) {
			const mx = x - mouse.x;
			const my = y - mouse.y;
			const d = Math.hypot(mx, my) || 1;
			if (d < RADIUS * 2) {
				const falloff = Math.exp(-(d * d) / (RADIUS * RADIUS));
				const push = RIPPLE * mouse.energy * falloff * (0.6 + 0.4 * Math.sin(d * 0.06 - t * 4));
				dx += (mx / d) * push;
				dy += (my / d) * push;
			}
		}
		return [dx, dy];
	}

	function draw(t) {
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		for (let x = 0; x <= width + CELL; x += CELL) {
			for (let y = -STEP; y <= height + STEP; y += STEP) {
				const [dx, dy] = offset(x, y, t);
				y === -STEP ? ctx.moveTo(x + dx, y + dy) : ctx.lineTo(x + dx, y + dy);
			}
		}
		for (let y = 0; y <= height + CELL; y += CELL) {
			for (let x = -STEP; x <= width + STEP; x += STEP) {
				const [dx, dy] = offset(x, y, t);
				x === -STEP ? ctx.moveTo(x + dx, y + dy) : ctx.lineTo(x + dx, y + dy);
			}
		}
		ctx.stroke();
	}

	function tick(time) {
		mouse.energy *= 0.96; // ripple fades once the cursor stops
		draw(time);
	}

	addEventListener('resize', resize, { signal: controller.signal });
	resize();

	if (still) return () => controller.abort();

	addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType !== 'mouse') return;
			mouse.x = event.clientX;
			mouse.y = event.clientY;
			mouse.energy = Math.min(1, mouse.energy + 0.15);
		},
		{ passive: true, signal: controller.signal },
	);
	gsap.ticker.add(tick);

	return () => {
		controller.abort();
		gsap.ticker.remove(tick);
	};
}
