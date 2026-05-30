export type HeroVisual = 'radar' | 'graph' | 'tree';

export function pickHeroVisual(seed: string, preferred?: HeroVisual): HeroVisual {
	if (preferred) return preferred;
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
	const kinds: HeroVisual[] = ['radar', 'graph', 'tree'];
	return kinds[Math.abs(h) % kinds.length]!;
}

export function heroDiagramSvg(kind: HeroVisual, className = 'dispatch-hero-diagram'): string {
	const common = `class="${className}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="0.75" aria-hidden="true"`;
	if (kind === 'radar') {
		return `<svg ${common}>
  <circle cx="100" cy="100" r="72" opacity="0.35"/>
  <circle cx="100" cy="100" r="48" opacity="0.35"/>
  <circle cx="100" cy="100" r="24" opacity="0.35"/>
  <line x1="100" y1="28" x2="100" y2="172" opacity="0.4"/>
  <line x1="28" y1="100" x2="172" y2="100" opacity="0.4"/>
  <line x1="49" y1="49" x2="151" y2="151" opacity="0.25"/>
  <line x1="151" y1="49" x2="49" y2="151" opacity="0.25"/>
  <polygon points="100,40 140,85 125,150 75,150 60,85" opacity="0.55" fill="currentColor" fill-opacity="0.08"/>
</svg>`;
	}
	if (kind === 'graph') {
		return `<svg ${common}>
  <circle cx="50" cy="60" r="6" fill="currentColor" fill-opacity="0.2"/>
  <circle cx="150" cy="55" r="6" fill="currentColor" fill-opacity="0.2"/>
  <circle cx="100" cy="140" r="6" fill="currentColor" fill-opacity="0.2"/>
  <circle cx="165" cy="130" r="5" fill="currentColor" fill-opacity="0.15"/>
  <circle cx="35" cy="135" r="5" fill="currentColor" fill-opacity="0.15"/>
  <path d="M50 60 L100 140 L150 55" opacity="0.5"/>
  <path d="M50 60 L35 135" opacity="0.35"/>
  <path d="M150 55 L165 130 L100 140" opacity="0.35"/>
</svg>`;
	}
	return `<svg ${common}>
  <path d="M40 160 L70 90 L100 120 L130 70 L160 160" opacity="0.45"/>
  <path d="M70 90 L70 160 M100 120 L100 160 M130 70 L130 160" opacity="0.3"/>
  <line x1="40" y1="160" x2="160" y2="160" opacity="0.4"/>
</svg>`;
}
