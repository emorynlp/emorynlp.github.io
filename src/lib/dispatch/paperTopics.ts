export type PaperTopicTone = 'core' | 'code' | 'apps' | 'seminar' | 'neutral';

/** Structured `topics` slot — drives Dispatch pill color on issue pages. */
export type TopicSlot = 'researchField' | 'applicationDomain' | 'task';

export type ResolvedPaperTopic = {
	label: string;
	tone: PaperTopicTone;
	/** Set for explicit structured topics; inferred thesis topics omit this. */
	slot?: TopicSlot;
};

type RawPaperTopic =
	| string
	| {
			label: string;
			tone?: PaperTopicTone;
	  };

/**
 * Named `topics` slots in frontmatter.
 * Display order: researchField → applicationDomain → task.
 */
export type StructuredTopics = {
	researchField?: RawPaperTopic;
	applicationDomain: RawPaperTopic;
	task: RawPaperTopic;
};

/** Flatten named topic slots to pill order for rendering. */
export function flattenStructuredTopics(
	raw: StructuredTopics | undefined,
): RawPaperTopic[] {
	if (!raw) return [];
	const items: RawPaperTopic[] = [];
	if (raw.researchField !== undefined) items.push(raw.researchField);
	items.push(raw.applicationDomain, raw.task);
	return items;
}

function resolveRawTopic(item: RawPaperTopic, slot: TopicSlot): ResolvedPaperTopic {
	const label = typeof item === 'string' ? item : item.label;
	return {
		label,
		slot,
		tone: typeof item === 'object' && item.tone ? item.tone : inferTopicTone(label),
	};
}

export function resolveStructuredTopics(
	raw: StructuredTopics | undefined,
): ResolvedPaperTopic[] {
	if (!raw) return [];
	const items: ResolvedPaperTopic[] = [];
	if (raw.researchField !== undefined) {
		items.push(resolveRawTopic(raw.researchField, 'researchField'));
	}
	items.push(
		resolveRawTopic(raw.applicationDomain, 'applicationDomain'),
		resolveRawTopic(raw.task, 'task'),
	);
	return items;
}

const TONE_RULES: { pattern: RegExp; tone: PaperTopicTone }[] = [
	{ pattern: /dialogue|schema|task-oriented|semantics|parsing|generation/i, tone: 'core' },
	{ pattern: /code|resource|model training|simulation/i, tone: 'code' },
	{
		pattern: /mental|health|clinical|caregiv|social media|benchmark|loneliness|evaluation/i,
		tone: 'apps',
	},
	{ pattern: /seminar|workshop/i, tone: 'seminar' },
];

function inferTopicTone(label: string): PaperTopicTone {
	for (const { pattern, tone } of TONE_RULES) {
		if (pattern.test(label)) return tone;
	}
	return 'neutral';
}

export function resolvePaperTopics(raw: RawPaperTopic[] | undefined): ResolvedPaperTopic[] {
	return (raw ?? []).map((item) => {
		if (typeof item === 'string') {
			return { label: item, tone: inferTopicTone(item) };
		}
		return {
			label: item.label,
			tone: item.tone ?? inferTopicTone(item.label),
		};
	});
}

const MASTHEAD_INFERENCE_RULES: { pattern: RegExp; label: string }[] = [
	{ pattern: /task-oriented|tod system|dialogue state/i, label: 'Task-oriented Dialogue' },
	{ pattern: /schema induction|slot schema|dialogue task schema/i, label: 'Schema Induction' },
	{ pattern: /dialogue memory|long-term memory|long-horizon|multi-party conversation/i, label: 'Dialogue Memory' },
	{ pattern: /event extraction|relation extraction|utterance-level event/i, label: 'Information Extraction' },
	{ pattern: /personality profiling|big five/i, label: 'Personality Profiling' },
	{ pattern: /instruction following|instruction guidance|reordered instruction|\brift\b/i, label: 'Instruction Following' },
	{ pattern: /mental health|clinical|crisis|caregiv|psychiatr|cradle/i, label: 'Healthcare NLP' },
	{ pattern: /emotion recognition|emotion evaluation|\bvad\b|iemocap|valence|arousal/i, label: 'Emotion Recognition' },
	{ pattern: /multimodal/i, label: 'Multimodal NLP' },
	{ pattern: /large language model|\bllm/i, label: 'Large Language Models' },
	{ pattern: /user simulation|simulated interaction/i, label: 'Simulation' },
	{ pattern: /benchmark|evaluation framework|stress test/i, label: 'Evaluation' },
	{ pattern: /social media|loneliness/i, label: 'Social Media NLP' },
	{ pattern: /parsing|semantics|discourse/i, label: 'Semantics' },
	{ pattern: /generative|text generation/i, label: 'Text Generation' },
];

/** Infer 2–4 Dispatch topic labels from thesis/dissertation title and abstract. */
export function inferTopics(title: string, abstract?: string): string[] {
	const text = `${title}\n${abstract ?? ''}`;
	const labels: string[] = [];
	for (const { pattern, label } of MASTHEAD_INFERENCE_RULES) {
		if (pattern.test(text) && !labels.includes(label)) labels.push(label);
		if (labels.length >= 4) break;
	}
	return labels;
}

/** Resolve explicit structured `topics` or infer from title/abstract (theses). */
export function resolveThesisTopics(
	raw: StructuredTopics | undefined,
	inferFrom?: { title: string; abstract?: string },
): ResolvedPaperTopic[] {
	if (raw) return resolveStructuredTopics(raw);
	const inferred = inferFrom
		? inferTopics(inferFrom.title, inferFrom.abstract)
		: [];
	return resolvePaperTopics(inferred);
}
