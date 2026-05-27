---
title: Robust Dialogue State Tracking via Diverse Data Generation
date: 2023-10-20
term: Fall 2023
time: '3:30 - 4:30 PM'
speakers:
  - James Finch
location: MSC E306
abstract: 'This proposal investigates improving domain adaptability in Dialogue State Tracking (DST), a crucial task in dialogue systems development. My prior work presented in this proposal demonstrates the potential of structured dialogue state representations to customize dialogue system behaviors and mitigate common errors. However, obtaining DST models that achieve high performance and can adapt to new dialogue domains is an ongoing research challenge. The proposed work aims to improve the accuracy and cost-effectiveness of DST by vastly increasing the diversity of training resources for few- and zero-shot DST. Synthetic DST training resources are generated using a Dialogue State Generation (DSG) model that I developed in prior work. The DSG model is capable of inferring both slot types and their values from a dialogue on unseen domains, without any predefined slot schema. The proposed approach leverages the DSG model to automatically annotate a massively diverse set of dialogues with silver dialogue state labels, producing few- and zero-shot DST training data on 1,000 different domains. To address the challenges of slot schema inconsistency and noise in DSG model outputs, the proposed approach also includes a schema induction step to ensure sliver labels follow a consistent schema within each domain. By evaluating few- and zero-shot DST models trained on this domain-diverse synthetic DST data, two main research questions are addressed: (1) whether a schema induction step can improve the quality of DST training resources produced by a DSG model, and (2) the extent to which training on data with greater domain coverage improves DST domain adaptability.'
slidesUrl: 'https://drive.google.com/file/d/1Lp84i7zYX-rwSkLLeKgBRla2ALvuTjZH/view?usp=share_link'
---
