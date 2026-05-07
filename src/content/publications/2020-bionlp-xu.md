---
title: 'Noise Pollution in Hospital Readmission Prediction: Long Document Classification with Reinforcement Learning'
authors:
  - Liyan Xu
  - Julien Hogan
  - Rachel E. Patzer
  - Jinho D. Choi
venue: ACL Workshop on Biomedical Natural Language Processing (BioNLP)
year: 2020
published: '2020-07-03'
publicationType: workshop
venueUrl: 'https://aclweb.org/aclwiki/BioNLP_Workshop'
paperUrl: 'https://aclanthology.org/2020.bionlp-1.10/'
abstract: >-
  This paper presents a reinforcement learning approach to extract noise in long clinical
  documents for the task of readmission prediction after kidney transplant. We face the
  challenges of developing robust models on a small dataset where each document may consist of
  over 10K tokens with full of noise including tabular text and task-irrelevant sentences. We
  first experiment four types of encoders to empirically decide the best document
  representation, and then apply reinforcement learning to remove noisy text from the long
  documents, which models the noise extraction process as a sequential decision problem. Our
  results show that the old bag-of-words encoder outperforms deep learning-based encoders on
  this task, and reinforcement learning is able to improve upon baseline while pruning out 25%
  text segments. Our analysis depicts that reinforcement learning is able to identify both
  typical noisy tokens and task-specific noisy text.
---
