---
title: >-
  Advancing Conversational Text-to-SQL: Current Landscape and Future Directions with Large
  Language Models
authors:
  - Benjamin G. Ascoli
  - Jinho D. Choi
venue: 'Future Internet: Big Data and Augmented Intelligence'
year: 2025
publicationType: journal
published: '2025-11-18'
venueUrl: 'https://www.mdpi.com/journal/futureinternet'
paperUrl: 'https://www.mdpi.com/1999-5903/17/11/527'
resourceUrl: 'https://github.com/emorynlp/CoSQL-LLM/'
abstract: >-
  Conversational text-to-SQL extends the traditional single-turn SQL generation paradigm to
  multi-turn, dialogue-based scenarios, enabling users to pose and refine database queries
  interactively, and requiring models to track dialogue context over multiple user queries and
  system responses. Despite extensive progress in single-turn benchmarks such as Spider and
  BIRD, and the recent rise of large language models, conversational datasets continue to pose
  challenges. In this paper, we spotlight model merging as a key strategy for boosting ESM
  performance on CoSQL and SParC. We present a new state-of-the-art system on the CoSQL
  benchmark, achieved by fine-tuning CodeS-7b under two paradigms for handling conversational
  history: (1) full history concatenation, and (2) question rewriting via GPT-based
  summarization. While each paradigm alone obtains competitive results, we observe that
  averaging the weights of these fine-tuned models can outperform both individual variants. Our
  findings highlight the promise of LLM-driven multi-turn SQL generation, offering a
  lightweight yet powerful avenue for improving conversational text-to-SQL.
---
