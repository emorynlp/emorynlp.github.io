---
title: Modeling Explicit Task Interactions in Document-Level Joint Entity and Relation Extraction
authors:
  - Liyan Xu
  - Jinho D. Choi
venue: Proceedings of the Annual Conference of the North American Chapter of the Association for Computational Linguistics
year: 2022
published: '2022-07-10'
publicationType: conference
presenter: 'Liyan Xu'
venueUrl: 'https://2022.naacl.org'
paperUrl: 'https://aclanthology.org/2022.naacl-main.395'
abstract: >-
  We target on the document-level relation extraction in an end-to-end setting, where the
  model needs to jointly perform mention extraction, coreference resolution (COREF) and
  relation extraction (RE) at once, and gets evaluated in an entity-centric way. Especially,
  we address the two-way interaction between COREF and RE that has not been the focus by
  previous work, and propose to introduce explicit interaction namely Graph Compatibility (GC)
  that is specifically designed to leverage task characteristics, bridging decisions of two
  tasks for direct task interference. Our experiments are conducted on DocRED and DWIE; in
  addition to GC, we implement and compare different multi-task settings commonly adopted in
  previous work, including pipeline, shared encoders, graph propagation, to examine the
  effectiveness of different interactions. The result shows that GC achieves the best
  performance by up to 2.3/5.1 F1 improvement over the baseline.
---
