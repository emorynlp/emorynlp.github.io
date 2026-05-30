---
title: "Hierarchical Entity Extraction and Ranking with Unsupervised Graph Convolutions"
author: "Zhexiong Liu"
degree: "MS"
abstract: |
  Entity extraction problems have been extensively studied in terms of investigating the capability of extracting entities from text using natural language processing (NLP). Most research involves training learnable models on a large amount of corpus to ex- tract entities and determine their salience. Typically, these systems aim to retrieve an array of ranked entities from a set of documents while giving queries, which mainly measure the relevance between queries and entities. However, this thesis leverages semantic and syntactic information within the documents to perform entities extraction as well as entity ranking. In particular, given document corpus, constituency parsing trees are constructed to extract entity mentions (phrases) for each article. Meanwhile, dependency parsing trees and entity coreference clusters are employed to build a relation graph, of which nodes denote entity mentions and edges denote mention relations. Moreover, graph convolution is performed on the relation graph to normalize the mention representation with respect to mention embeddings. Hierarchical density-based clustering and ranking mechanism are applied to compute entity priors. To evaluate this work, three models are proposed and evaluated on 60 annotated articles. Preliminary results illustrate that the usage of parsing trees, along with entity coreference relations improves the effectiveness of entity extraction and ranking. The interesting hierarchical trees for entity extraction, the principles for graph construction, as well as the system architecture serve as main contributions of this thesis .
term: "Spring 2020"
department: "Computer Science"
slidesUrl: "https://drive.google.com/file/d/1Kla2DIXRphNrRVr-PXkKMzlL-XHD9qUU/view?usp=sharing"
paperUrl: "https://etd.library.emory.edu/concern/etds/b8515p57p"
committee:
  - "Jinho D. Choi, Computer Science, Emory University (Chair)"
  - "Shun Yan Cheung, Computer Science, Emory University"
  - "Michelangelo Grigni, Computer Science, Emory University"
photo: "/theses/2020-ms-zhexiong-liu.webp"
sourceUrl: "https://www.emorynlp.org/theses-dissertations/2020-ms-zhexiong-liu?c=2015-2020"
---
