---
title: Developing a Context-Sensitive Customer Service Chatbot in the Medical Domain
date: 2023-03-31
term: Spring 2023
time: '4:00 - 5:00 PM'
speakers:
  - Benjamin Ascoli
location: MSC W301
abstract: This paper presents the development of a natural language processing (NLP) chatbot for Kaiser Permanente, a leading healthcare and coverage provider. The project’s objective is to create a chatbot that emulates natural customer service and thereby enhancing the personalized experience for Kaiser Permanente’s clients. We first explored intent classification using two transformer architectures, BERT and RoBERTa, trained on a dataset of 11,500 manually labeled text utterances provided by Kaiser Permanente. The best-performing model, the RoBERTa joint classifier, achieved 90.232% accuracy on intent and 87.623% accuracy on routing classification. To create a more natural conversation flow, we switched to a sequence-to-sequence model using the BART transformer, which we trained on 1.4 million cleaned data points from anonymized client conversations. Preliminary training results show promise, with the model generating coherent responses to input text. The deployment of our chatbot in Kaiser Permanente’s online chat service has the potential to improve customer experiences and streamline communication with healthcare professionals.
slidesUrl: 'https://drive.google.com/file/d/1WY0Ky6wqdvsKs7GLl1EiochXNo97GyG0/view?usp=share_link'
---
