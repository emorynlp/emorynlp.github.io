---
title: Advancing Conversational Text-to-SQL with Weight Averaging
date: 2025-03-28
term: Spring 2025
time: '2:00 - 3:00 PM'
speakers:
  - Benjamin Ascoli
location: White Hall 100
abstract: 'Conversational text-to-SQL extends the traditional single-turn SQL generation paradigm to multi-turn, dialogue-based scenarios, enabling users to pose and refine database queries interactively, and requiring models to track dialogue context over multiple user queries and system responses. Despite extensive progress in single-turn benchmarks such as Spider and BIRD, and the recent rise of large language models, conversational datasets continue to pose challenges. In this paper, we spotlight model merging as a key strategy for boosting ESM performance on CoSQL and SParC. We present a new state-of-the-art system on the CoSQL benchmark, achieved by fine-tuning CodeS-7b under two paradigms for handling conversational history: (1) full history concatenation, and (2) question rewriting via GPT-based summarization. While each paradigm alone obtains competitive results, we observe that averaging the weights of these fine-tuned models can outperform both individual variants. Our findings highlight the promise of LLM-driven multi-turn SQL generation, offering a lightweight yet powerful avenue for improving conversational text-to-SQL.'
---
