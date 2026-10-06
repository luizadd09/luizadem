/**
 * Software shown as icons on project pages.
 * `id` goes in a project's frontmatter (`software: [photoshop, figma]`).
 * `abbr` is shown on the placeholder icon until a real icon is added —
 * drop an SVG named after the id into src/assets/software/ (e.g. photoshop.svg)
 * and it replaces the placeholder automatically.
 */
export const software = [
	{ id: 'photoshop', name: 'Adobe Photoshop', abbr: 'Ps' },
	{ id: 'illustrator', name: 'Adobe Illustrator', abbr: 'Ai' },
	{ id: 'indesign', name: 'Adobe InDesign', abbr: 'Id' },
	{ id: 'after-effects', name: 'Adobe After Effects', abbr: 'Ae' },
	{ id: 'premiere', name: 'Adobe Premiere Pro', abbr: 'Pr' },
	{ id: 'lightroom', name: 'Adobe Lightroom', abbr: 'Lr' },
	{ id: 'figma', name: 'Figma', abbr: 'Fg' },
	{ id: 'procreate', name: 'Procreate', abbr: 'Pc' },
	{ id: 'blender', name: 'Blender', abbr: 'Bl' },
	{ id: 'maya', name: 'Autodesk Maya', abbr: 'Ma' },
	{ id: 'unity', name: 'Unity', abbr: 'Un' },
	{ id: 'webflow', name: 'Webflow', abbr: 'Wf' },
];

export const softwareIds = /** @type {[string, ...string[]]} */ (software.map((s) => s.id));

export const getSoftware = (id) => software.find((s) => s.id === id);
