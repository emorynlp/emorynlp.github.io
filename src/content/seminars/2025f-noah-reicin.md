---
title: Evaluating Instruction Following In Multistep Prompt Structures
date: 2025-10-17
term: Fall 2025
time: '3:00 - 4:00 PM'
speakers:
  - Noah Reicin
location: White Hall 100
abstract: Instruction following is central to large language models (LLMs), yet their reliability under non-linear or structurally disrupted prompts remains poorly understood. We introduce a controlled evaluation framework that isolates prompt topology, independent of content complexity, as a variable in instruction adherence. Using rephrased Jeopardy!1 question–answer pairs held constant across conditions, we compare performance on linear prompts, which follow sequential order, and jumping prompts, which require non-sequential traversal through explicit directional cues. Across 600 evaluations spanning seven state-of-the-art open-source models, accuracy dropped by up to 83% under jumping conditions, revealing a strong dependence on positional continuity. Error analysis shows that most failures stem from instruction-order violations and semantic drift, indicating that current architectures internalize instruction following as a sequential pattern rather than an abstract reasoning skill. These results highlight structural sensitivity as a fundamental limitation in LLM alignment and reasoning, establishing a reproducible benchmark for testing robustness to discontinuous procedural execution.
slidesUrl: 'https://drive.google.com/file/d/1okEBltNvfV8LW65rPmkwDwFnipcGp9lc/view?usp=share_link'
---
