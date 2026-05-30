/** Map news label or legacy dispatch `kind` to activity list icon key. */
export function activityIconKey(
	labels: string[],
	kind?: string,
): 'award' | 'media' | 'service' | 'travel' | 'welcome' | 'other' {
	const primary = labels[0] ?? kind;
	switch (primary) {
		case 'achievements':
		case 'award':
			return 'award';
		case 'media':
			return 'media';
		case 'service':
			return 'service';
		case 'travel':
		case 'seminars':
		case 'conferences':
		case 'visit':
			return 'travel';
		case 'welcome':
		case 'social':
			return 'welcome';
		default:
			return 'other';
	}
}
