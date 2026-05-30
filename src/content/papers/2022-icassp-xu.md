---
title: 'RescoreBERT: Discriminative Speech Recognition Rescoring with Bert'
authors:
  - Liyan Xu
  - Yile Gu
  - Jari Kolehmainen
  - Haidar Khan
  - Ankur Gandhe
  - Ariya Rastrow
  - Andreas Stolcke
  - Ivan Bulyko
venue: IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP)
year: 2022
published: '2022-05-22'
publicationType: journal
venueUrl: 'https://2022.ieeeicassp.org'
paperUrl: 'https://doi.org/10.1109/ICASSP43922.2022.9747118'
abstract: >-
  Second-pass rescoring is an important component in automatic speech recognition (ASR)
  systems that is used to improve the outputs from a first-pass decoder by implementing a
  lattice rescoring or n-best re-ranking. While pretraining with a masked language model (MLM)
  objective has received great success in various natural language understanding (NLU) tasks,
  it has not gained traction as a rescoring model for ASR. Specifically, training a
  bidirectional model like BERT on a discriminative objective such as minimum WER (MWER) has
  not been explored. Here we where show how to train a BERT-based rescoring model with MWER
  loss, to incorporate the improvements of a discriminative loss into fine-tuning of deep
  bidirectional pretrained models for ASR. We propose a fusion strategy that incorporates the
  MLM into the discriminative training process to effectively distill the knowledge from a
  pretrained model. We further propose an alternative discriminative loss. We name this
  approach RescoreBERT, and evaluate it on the LibriSpeech corpus, and it reduces WER by
  6.6%/3.4% relative on clean/other test sets over a BERT baseline without discriminative
  objective. We also evaluate our method on an internal dataset from a conversational agent
  and find that it reduces both latency and WER (by 3-8% relative) over an LSTM rescoring
  model.
---
