---
title: 'Secure Multifaceted-RAG: Hybrid Knowledge Retrieval with Security Filtering'
authors:
  - Grace Byun
  - Shinsun Lee
  - Nayoung Choi
  - Jinho D. Choi
venue: 'Information: Advanced Retrieval-Augmented Generation Systems Based on Large Language Models'
year: 2025
published: '2025-09-12'
publicationType: journal

venueUrl: 'https://www.mdpi.com/journal/information'
paperUrl: 'https://doi.org/10.3390/info16090804'
resourceUrl: 'https://github.com/emorynlp/TRUST'
abstract: >-
  Existing Retrieval-Augmented Generation (RAG) systems face challenges in enterprise settings
  due to limited retrieval scope and data security risks. When relevant internal documents are
  unavailable, the system struggles to generate accurate and complete responses. Additionally,
  using closed-source Large Language Models (LLMs) raises concerns about exposing proprietary
  information. To address these issues, we propose the Secure Multifaceted-RAG (SecMulti-RAG)
  framework, which retrieves not only from internal documents but also from two supplementary
  sources: pre-generated expert knowledge for anticipated queries and on-demand external LLM-
  generated knowledge. To mitigate security risks, we adopt a local open-source generator and
  selectively utilize external LLMs only when prompts are deemed safe by a filtering
  mechanism. This approach enhances completeness, prevents data leakage, and reduces costs. In
  our evaluation on a report generation task in automotive industry, SecMulti-RAG
  significantly outperforms traditional RAG—achieving 79.3–91.9% win rates across correctness,
  richness, and helpfulness in LLM-based evaluation, and 56.3–70.4% in human evaluation. This
  highlights SecMulti-RAG as a practical and secure solution for enterprise RAG.
---
