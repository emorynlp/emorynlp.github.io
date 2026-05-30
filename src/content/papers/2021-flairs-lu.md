---
title: Evaluation of Unsupervised Entity and Event Salience Estimation
authors:
  - Jiaying Lu
  - Jinho D. Choi
venue: International Florida Artificial Intelligence Research Society Conference (FLAIRS)
year: 2021
published: '2021-05-01'
publicationType: conference
venueUrl: 'https://www.flairs-34.info/'
paperUrl: 'https://journals.flvc.org/FLAIRS/article/view/128482'
resourceUrl: 'https://github.com/emorynlp/bert-2019'
abstract: >-
  Salience Estimation aims to predict term importance in documents. Due to few existing human-
  annotated datasets and the subjective notion of salience, previous studies typically
  generate pseudo-ground truth for evaluation. However, our investigation reveals that the
  evaluation protocol proposed by prior work is difficult to replicate, thus leading to few
  follow-up studies existing. Moreover, the evaluation process is problematic: the entity
  linking tool used for entity matching is very noisy, while the ignorance of event argument
  for event evaluation leads to boosted performance. In this work, we propose a light yet
  practical entity and event salience estimation evaluation protocol, which incorporates the
  more reliable syntactic dependency parser. Furthermore, we conduct a comprehensive analysis
  among popular entity and event definition standards, and present our own definition for the
  Salience Estimation task to reduce noise during the pseudo-ground truth generation process.
  Furthermore, we construct dependency-based heterogeneous graphs to capture the interactions
  of entities and events. The empirical results show that both baseline methods and the novel
  GNN method utilizing the heterogeneous graph consistently outperform the previous SOTA model
  in all proposed metrics.
---
