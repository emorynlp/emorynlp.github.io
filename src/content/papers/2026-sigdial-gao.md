---
title: 'Building Task-Oriented Dialogue Systems via Instruction Guidance without Annotated Data'
authors:
  - Henry Gao
  - Jinho D. Choi
venue: 'Annual Meeting of the Special Interest Group on Discourse and Dialogue (SIGDIAL)'
year: 2026
published: '2026-08-04'
publicationType: conference
presenter: 'Henry Gao'
topics:
  researchField: Conversational AI
  applicationDomain: Task-oriented Dialogue
  task: Prompt Induction
venueUrl: 'https://2026.sigdial.org/'
abstract: >-
  Task-oriented dialogue (TOD) systems conventionally rely on supervised fine-tuning over large
  datasets, an approach that is both resource-intensive and difficult to generalize across
  domains. We investigate whether large language models (LLMs) can serve as effective TOD agents
  without any fine-tuning, relying solely on in-context prompting and unstructured conversational
  logs. To this end, we propose a two-stage framework in which an LLM first induces structured
  procedural instructions from raw multi-turn dialogues, then leverages these instructions to
  generate goal-oriented interactions. An iterative refinement loop further improves instruction
  quality by evaluating intermediate dialogue outputs and propagating feedback to update the
  instructions.

  To address limitations inherent in existing evaluation protocols, we introduce an interactive
  evaluation framework centered on a constrained user simulator with access to ground-truth task
  goals. This design enables flexible assessment of task success beyond fixed dialogue trajectories,
  more faithfully reflecting the conditions of real-world deployment. Experiments demonstrate that
  the proposed approach produces coherent and task-effective dialogues without any annotated data.
  Using Gemma-3-27b-it as the backbone, our system achieves a dialogue state F1 of 86.3%,
  outperforming GALAXY (84.3%) and MARS (84.6%).
---
