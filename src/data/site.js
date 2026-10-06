/** Internal link → path including the deploy sub-folder (astro.config `base`): url('/files/cv.pdf'). */
export const url = (path) => import.meta.env.BASE_URL.replace(/\/$/, '') + path;

/**
 * Site-wide content. Edit this file to update your personal details —
 * components read from here so nothing is hard-coded in markup.
 */
export const site = {
	name: 'Luiza Demianchuk',
	nameNative: 'Луїза Дем’янчук',
	role: 'Graphic & digital designer',
	description:
		'Portfolio of Luiza Demianchuk — Ukrainian graphic and digital designer working across branding, web design, digital content and creative production.',
	email: 'luizademianchuk@gmail.com',

	bio: [
		'Hi! I’m a Ukrainian graphic and digital designer with a strong interest in visual communication and creative problem-solving.',
		'My background spans branding, web design, digital content, and creative production, allowing me to approach projects from both a visual and technical perspective.',
		'I care about the details, but always keep the bigger picture in mind creating work that looks good, communicates clearly, and has a purpose.',
	],

	// Drop the matching PDFs into /public/files/.
	documents: [
		{ label: 'CV_eng', href: url('/files/cv-en.pdf'), lang: 'en' },
		{ label: 'CV_nl', href: url('/files/cv-nl.pdf'), lang: 'nl' },
		{ label: 'Portfolio_PDF', href: url('/files/portfolio.pdf'), wide: true },
	],

	socials: [
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/' },
		{ label: 'Behance', href: 'https://www.behance.net/' },
		{ label: 'Instagram', href: 'https://www.instagram.com/' },
	],
};
