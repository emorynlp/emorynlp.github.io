---
title: Revealing the Myth of Higher-Order Inference in Coreference Resolution
authors:
  - Liyan Xu
  - Jinho D. Choi
venue: Conference on Empirical Methods in Natural Language Processing (EMNLP)
year: 2020
published: '2020-11-16'
publicationType: conference
venueUrl: 'https://2020.emnlp.org/'
paperUrl: 'https://aclanthology.org/2020.emnlp-main.686/'
resourceUrl: 'https://github.com/emorynlp/coref-hoi'
abstract: >-
  This paper analyzes the impact of higher-order inference (HOI) on the task of coreference
  resolution. HOI has been adapted by almost all recent coreference resolution models without
  taking much investigation on its true effectiveness over representation learning. To make a
  comprehensive analysis, we implement an end-to-end coreference system as well as four HOI
  approaches, attended antecedent, entity equalization, span clustering, and cluster merging,
  where the latter two are our original methods. We find that given a high-performing encoder
  such as SpanBERT, the impact of HOI is negative to marginal, providing a new perspective of
  HOI to this task. Our best model using cluster merging shows the Avg-F1 of 80.2 on the CoNLL
  2012 shared task dataset in English.
---
