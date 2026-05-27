---
title: 'Beyond Text: LLM-Based Dimensional Emotion Evaluation in Multimodal Dialogue'
date: 2026-02-27
term: Spring 2026
time: '3:00 - 4:00 PM'
speakers:
  - Yutong Hu
location: White Hall 100
abstract: >-
  Emotion recognition in conversation (ERC) has been widely studied, yet the application of
  Large Language Models (LLMs) to continuous dimensional emotion evaluation in multimodal
  dialogue remains largely unexplored. This thesis proposes a multimodal LLM-based framework
  that performs two independent tasks on the IEMOCAP dataset: discrete emotion recognition
  across six categories, and dimensional emotion evaluation along the Valence–Arousal–Dominance
  (VAD) continuum. Following the SpeechCueLLM approach, acoustic information is incorporated
  as natural language descriptions of pitch, volume, and speaking rate, enabling LLMs to access
  non-lexical cues without architectural modification. We evaluate five models spanning the
  LLaMA and GPT families under zero-shot prompting, few-shot prompting, and LoRA
  parameter-efficient fine-tuning. Results show that LoRA fine-tuned LLaMA models substantially
  outperform prompt-engineered GPT models on both tasks, which is somewhat counterintuitive
  given the larger scale of GPT models, and we attribute this performance gap to domain
  adaptation rather than model capacity. Our best model achieves a Valence Concordance
  Correlation Coefficient (CCC) of 0.7822, establishing a new state-of-the-art on IEMOCAP for
  this dimension. The error analysis reveals that GPT models have specifically high confusion
  rates for certain emotions, showing its lack of adaptation to this domain. Meanwhile, the
  performance asymmetry across VAD dimensions is explained by the annotator agreement on
  those three dimensions: the reliability hierarchy in IEMOCAP annotations is mirrored
  directly in the models' performance on VAD dimensions.
slidesUrl: 'https://drive.google.com/file/d/1fDVUOhW5pYVpImLbZ8bLeUgBc4-gEaGQ/view?usp=share_link'
---
