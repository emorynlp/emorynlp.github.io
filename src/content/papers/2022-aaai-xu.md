---
title: Zero-Shot Cross-Lingual Machine Reading Comprehension via Inter-Sentence Dependency Graph
authors:
  - Liyan Xu
  - Xuchao Zhang
  - Bo Zong
  - Yanchi Liu
  - Wei Cheng
  - Jingchao Ni
  - Haifeng Chen
  - Zhao Liang
  - Jinho D. Choi
venue: AAAI Conference on Artificial Intelligence (AAAI)
year: 2022
published: '2022-02-22'
publicationType: conference
venueUrl: 'https://aaai.org/Conferences/AAAI-22/'
paperUrl: 'https://doi.org/10.1609/aaai.v36i10.21407'
abstract: >-
  We target the task of cross-lingual Machine Reading Comprehension (MRC) in the direct zero-
  shot setting, by incorporating syntactic features from Universal Dependencies (UD), and the
  key features we use are the syntactic relations within each sentence. While previous work
  has demonstrated effective syntax-guided MRC models, we propose to adopt the inter-sentence
  syntactic relations, in addition to the rudimentary intra-sentence relations, to further
  utilize the syntactic dependencies in the multi-sentence input of the MRC task. In our
  approach, we build the Inter-Sentence Dependency Graph (ISDG) connecting dependency trees to
  form global syntactic relations across sentences. We then propose the ISDG encoder that
  encodes the global dependency graph, addressing the inter-sentence relations via both one-
  hop and multi-hop dependency paths explicitly. Experiments on three multilingual MRC
  datasets (XQuAD, MLQA, TyDiQA-GoldP) show that our encoder that is only trained on English
  is able to improve the zero-shot performance on all 14 test sets covering 8 languages, with
  up to 3.8 F1 / 5.2 EM improvement on-average, and 5.2 F1 / 11.2 EM on certain languages.
  Further analysis shows the improvement can be attributed to the attention on the cross-
  linguistically consistent syntactic path.
---
