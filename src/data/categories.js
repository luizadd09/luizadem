/**
 * Project categories used by the filter on the home page.
 * `id` goes in a project's frontmatter (`categories: [branding]`),
 * `label` is shown as a hashtag, `description` is the full name for screen readers.
 */
export const categories = [
	{ id: 'graphic', label: 'GraphicDesign', description: 'Illustration and graphic design' },
	{ id: 'branding', label: 'Branding', description: 'Branding and social media' },
	{ id: 'web', label: 'WebDesign', description: 'Web design' },
	{ id: 'gamedev', label: 'GameDev', description: 'Game development' },
];

export const categoryIds = /** @type {[string, ...string[]]} */ (categories.map((c) => c.id));
