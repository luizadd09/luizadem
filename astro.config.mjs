// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Production URL (GitHub Pages). The site lives in the /luizadem/ sub-folder, so every
	// internal link goes through url() in src/data/site.js. With a custom domain, drop `base`.
	site: 'https://luizadd09.github.io',
	base: '/luizadem',

	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'hover',
	},

	fonts: [
		{
			// Steps Mono UA — Latin by Velvetyne, Ukrainian Cyrillic by LevType (SIL OFL 1.1).
			provider: fontProviders.local(),
			name: 'Steps Mono UA',
			cssVariable: '--font-display',
			fallbacks: ['monospace'],
			options: {
				variants: [
					{ src: ['./src/assets/fonts/steps-mono-ua/StepsMonoUA-Regular.woff2'], weight: 400, style: 'normal' },
					{ src: ['./src/assets/fonts/steps-mono-ua/StepsMonoUA-Thin.woff2'], weight: 100, style: 'normal' },
				],
			},
		},
		{
			provider: fontProviders.fontsource(),
			name: 'Inter',
			cssVariable: '--font-body',
			weights: ['300 700'],
			subsets: ['latin', 'cyrillic'],
			fallbacks: ['sans-serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			weights: [400, 500],
			subsets: ['latin', 'cyrillic'],
			fallbacks: ['monospace'],
		},
	],
});
