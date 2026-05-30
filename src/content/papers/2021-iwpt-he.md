---
title: Levi Graph AMR Parser using Heterogeneous Attention
authors:
  - Han He
  - Jinho D. Choi
venue: International Conference on Parsing Technologies (IWPT)
year: 2021
published: '2021-08-06'
publicationType: conference
venueUrl: 'https://iwpt21.sigparse.org/'
paperUrl: 'https://aclanthology.org/2021.iwpt-1.5/'
resourceUrl: 'https://github.com/emorynlp/levi-graph-amr-parser'
abstract: >-
  Coupled with biaffine decoders, transformers have been effectively adapted to text-to-graph
  transduction and achieved state-of-the-art performance on AMR parsing. Many prior works,
  however, rely on the biaffine decoder for either or both arc and label predictions although
  most features used by the decoder may be learned by the transformer already. This paper
  presents a novel approach to AMR parsing by combining heterogeneous data (tokens, concepts,
  labels) as one input to a transformer to learn attention, and use only attention matrices
  from the transformer to predict all elements in AMR graphs (concepts, arcs, labels).
  Although our models use significantly fewer parameters than the previous state-of-the-art
  graph parser, they show similar or better accuracy on AMR 2.0 and 3.0.
---
