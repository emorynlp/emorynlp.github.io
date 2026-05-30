export type ActivityLabelTone = 'media' | 'social' | 'seminars' | 'achievements' | 'neutral';

/** Magazine pill tone for a news `labels` entry on Dispatch activity cards. */
export function activityLabelTone(label: string): ActivityLabelTone {
	switch (label.trim().toLowerCase()) {
		case 'media':
			return 'media';
		case 'social':
			return 'social';
		case 'seminars':
		case 'conferences':
		case 'visit':
			return 'seminars';
		case 'achievements':
			return 'achievements';
		default:
			return 'neutral';
	}
}
