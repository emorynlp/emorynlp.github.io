---
title: What is Your Favorite Gender, MLM? Gender Bias Evaluation in Multilingual Masked Language Models
authors:
  - Jeongrok Yu
  - Seong Ug Kim
  - Jacob Choi
  - Jinho D. Choi
venue: 'Information: Feature Papers in Artificial Intelligence 2024'
year: 2024
published: '2024-09-03'
publicationType: journal
venueUrl: 'https://www.mdpi.com/journal/information/special_issues/246N3XOTBH'
paperUrl: 'https://doi.org/10.3390/info15090549'
resourceUrl: 'https://github.com/emorynlp/GenderBiasMLM'
abstract: >-
  Bias is a disproportionate prejudice in favor of one side against another. Due to the
  success of transformer-based Masked Language Models (MLMs) and their impact on many NLP
  tasks, a systematic evaluation of bias in these models is needed more than ever. While many
  studies have evaluated gender bias in English MLMs, only a few works have been conducted for
  the task in other languages. This paper proposes a multilingual approach to estimate gender
  bias in MLMs from 5 languages: Chinese, English, German, Portuguese, and Spanish. Unlike
  previous work, our approach does not depend on parallel corpora coupled with English to
  detect gender bias in other languages using multilingual lexicons. Moreover, a novel model-
  based method is presented to generate sentence pairs for a more robust analysis of gender
  bias, compared to the traditional lexicon-based method. For each language, both the lexicon-
  based and model-based methods are applied to create two datasets respectively, which are
  used to evaluate gender bias in an MLM specifically trained for that language using one
  existing and 3 new scoring metrics. Our results show that the previous approach is data-
  sensitive and not stable as it does not remove contextual dependencies irrelevant to gender.
  In fact, the results often flip when different scoring metrics are used on the same dataset,
  suggesting that gender bias should be studied on a large dataset using multiple evaluation
  metrics for best practice.
---
