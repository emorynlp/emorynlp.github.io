---
title: "Framework for Automatic Generation of Large-scale Dialogue Data from Online Forums"
author: "Daniil Huryn"
degree: "BS"
abstract: |
  Unsupervised Machine Learning models have taken the Natural Language Processing world by storm. Transformers, the currently most popular unsupervised models, utilize vast amounts of data and deliver performance far beyond what could have been achieved only a few years ago. As good as these models are, they have one major requirement - a lot of data. One of the first transformers, BERT, was trained on 3.3 Billion words of data, and later models have used even more data (GPT-3). This presents unsupervised dialogue models with a bit of a problem: there's not that much high quality dialogue data out there, certainly not on the scale required. Because Dialogue is far harder to encounter online then posts, articles, etc., High Quality datasets are usually very limited in size (Switchboard, Daily Dialog), while high quantity datasets (Opensubtitles, Reddit Corpus) are either low quality or of a very specific type, for instance movie subtitles. One of the main mitigations of this issue has been to first train models on large amounts of low quality data, and then fine-tune on low amounts of high quality data. In this paper, we propose to create a high quantity, medium quality, multi-turn dataset, that will allow for far better model training. To do this, we intend to utilize a more computational approach to dialogue creation, where we create it from a set of Reddit posts and their respective comments, blending it in a way that creates a new conversation out of a disjointed online forum post. By utilizing the nature of Reddit threads and a variety of Natural Language Processing metrics, we intend to first construct and then thoroughly filter conversations to automatically create a large dataset of high quality dialogues.
term: "Spring 2022"
department: "Computer Science"
slidesUrl: "https://drive.google.com/file/d/17YXZC6ay214RUukhcvP1N4Da8ech6QZz/view?usp=sharing"
paperUrl: "https://etd.library.emory.edu/concern/etds/3n204054m"
committee:
  - "Jinho D. Choi, Computer Science, Emory University (Chair)"
  - "Ting Li, Computer Science, Oxford College of Emory University"
  - "Jonathan Hulgan, Mathematics, Oxford College of Emory University"
honorsLevel: "Highest Honor"
photo: "/theses/honors-thesis-2022-daniil-huryn.webp"
sourceUrl: "https://www.emorynlp.org/theses-dissertations/honors-thesis-2022-daniil-huryn?c=2021-2025"
---
