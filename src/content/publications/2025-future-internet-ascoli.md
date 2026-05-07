---
title: 'ETM: Modern Insights into Perspective on Text-to-SQL Evaluation in the Age of Large Language Models'
authors:
  - Benjamin G. Ascoli
  - Yasoda Sai Ram Kandikonda
  - Jinho D. Choi
venue: 'Future Internet: Artificial Intelligence and Natural Language Processing'
year: 2025
publicationType: journal
published: '2025-07-23'
venueUrl: 'https://www.mdpi.com/journal/futureinternet'
paperUrl: 'https://www.mdpi.com/1999-5903/17/8/325'
resourceUrl: 'http://github.com/emorynlp/ETM'
abstract: >-
  The task of Text-to-SQL enables anyone to retrieve information from SQL databases using
  natural language. While this task has made substantial progress, the two primary evaluation
  metrics -- Execution Accuracy (EXE) and Exact Set Matching Accuracy (ESM) -- suffer from
  inherent limitations that can misrepresent performance. Specifically, ESM's rigid matching
  overlooks semantically correct but stylistically different queries, whereas EXE can
  overestimate correctness by ignoring structural errors that yield correct outputs. These
  shortcomings become especially problematic when assessing outputs from large language model
  (LLM)-based approaches without fine-tuning, which vary more in style and structure compared
  to their fine-tuned counterparts. Thus, we introduce a new metric, Enhanced Tree Matching
  (ETM), which mitigates these issues by comparing queries using both syntactic and semantic
  elements. Through evaluating nine LLM-based models, we show that EXE and ESM can produce
  false positive and negative rates as high as 23.0% and 28.9%, while ETM reduces these rates
  to 0.3% and 2.7%, respectively. We release our ETM script as open source, offering the
  community a more robust and reliable approach to evaluating Text-to-SQL.
---
