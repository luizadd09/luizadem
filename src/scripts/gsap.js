/**
 * Single place to register GSAP plugins so every module shares one instance.
 * All GSAP plugins (incl. Flip) are free since v3.13.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(ScrollTrigger, Flip);

gsap.defaults({ ease: 'expo.out', duration: 1 });

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, Flip };
