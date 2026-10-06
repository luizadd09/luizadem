import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryIds } from './data/categories.js';
import { softwareIds } from './data/software.js';

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			/** Ukrainian title — the page heading retypes from this into `title`. */
			titleNative: z.string(),
			/** A year (2023) or text for ongoing work ("2021+"). Quote text in frontmatter. */
			year: z.union([z.number().int(), z.string()]),
			order: z.number().default(0),
			/** Filter categories — see src/data/categories.js. */
			categories: z.array(z.enum(categoryIds)).min(1),
			/** Software icons on the project page — see src/data/software.js. */
			software: z.array(z.enum(softwareIds)).default([]),
			summary: z.string(),
			cover: image(),
			coverAlt: z.string(),
			/**
			 * Images, plus optional videos and 3D embeds.
			 * - Videos live in /public (Astro doesn't process video) and need a poster image.
			 * - Embeds (e.g. a Sketchfab viewer URL) show the poster until clicked, then
			 *   load the viewer in place; `link` is the fallback without JavaScript.
			 */
			gallery: z
				.array(
					z.union([
						z.object({
							src: image(),
							alt: z.string(),
						}),
						z.object({
							video: z.string(),
							poster: image(),
							alt: z.string(),
						}),
						z.object({
							embed: z.string().url(),
							link: z.string().url(),
							poster: image(),
							alt: z.string(),
						}),
					]),
				)
				.default([]),
		}),
});

export const collections = { projects };
