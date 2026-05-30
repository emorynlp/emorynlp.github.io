---
title: "Dependency Analysis of Abstract Universal Structures in Korean and English"
author: "Jayeol Chun"
degree: "BS"
abstract: |
  This thesis gives two contributions in the form of lexical resources to (1) dependency parsing in Korean and (2) semantic parsing in English. First, we describe our methodology for building three dependency treebanks in Korean derived from existing treebanks and pseudo-annotated according to the latest guidelines from the Universal Dependencies (UD). The original Google Korean UD Treebank is re-tokenized to ensure morpheme-level annotation consistency with other corpora while maintaining linguistic validity of the revised tokens. Phrase structure trees in the Penn Korean Treebank and the Kaist Treebank are automatically converted into UD dependency trees by applying head-percolation rules and linguistically motivated heuristics. A total of 38K+ dependency trees are generated. To the best of our knowledge, this is the first time that the three Korean treebanks are converted into UD dependency treebanks following the latest annotation guidelines. Second, we introduce an on-going project for constructing a new corpus of Deep Dependency Graphs (DDG) which are converted from the phrase structure trees in the OntoNotes corpus with additional semantic information found in the Proposition Bank (PropBank) and Abstract Meaning Representation (AMR). This new dataset plays a pivotal role in our proposed novel AMR parsing scheme in which the data helps train a dependency parser, which is subsequently trained on a new AMR parsing task through transfer learning. Since AMR inherits the core semantic roles in PropBank, we speculate that the first training phase that exposes the parsing model to semantic role labeling task will greatly help the model perform AMR parsing. In this thesis, we address the preliminary step of integrating PropBank labels for predicate argument relations during the constituent-to-dependency conversion of the OntoNotes. It is our hope that the new corpus, with its ­rich syntactic information stored in DDG as well as semantic role information provided by PropBank that fully describes the predicate argument structure, will serve as a useful resource for semantic role labeling.
term: "Spring 2018"
department: "Computer Science"
paperUrl: "https://etd.library.emory.edu/concern/etds/sj1391960"
committee:
  - "Jinho D. Choi, Computer Science, Emory University (Chair)"
  - "Phillip Wolff, Psychology, Emory University"
  - "Jeremy Jacobson, Quantitative Theory & Methods, Emory University"
honorsLevel: "Highest Honor"
sourceUrl: "https://www.emorynlp.org/theses-dissertations/2018-honors-jayeol-chun?c=2015-2020"
---
