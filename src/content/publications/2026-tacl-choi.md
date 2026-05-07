---
title: 'DyCP: Dynamic Context Pruning for Long-Form Dialogue with LLMs'
authors:
  - Nayoung Choi
  - Jonathan Zhang
  - Jinho D. Choi
venue: 'Transactions of the Association for Computational Linguistics (TACL)'
year: 2026
forthcoming: true
publicationType: journal
venueUrl: 'https://transacl.org'
paperUrl: 'https://arxiv.org/abs/2601.07994'
abstract: >-
  Large Language Models (LLMs) often exhibit increased response latency and degraded answer quality as dialogue length grows, making effective context management essential. However, existing methods rely on extra LLM calls to build memory or perform offline memory construction without considering the current user utterance, which can introduce inefficiencies or disrupt conversational continuity. We introduce DyCP, a lightweight context management method that dynamically segment and retrieve relevant memory at query time. It preserves the sequential structure of dialogue without predefined topic boundaries and supports efficient, adaptive context retrieval. Across three long-form dialogue benchmarks—LoCoMo, MT-Bench+, and SCM4LLMs—and multiple LLMs, DyCP consistently improves answer quality while reducing response latency. We also examine the gap between modern LLMs' expanded context windows and their actual long-context processing capacity, highlighting the continued importance of effective context management.
---
