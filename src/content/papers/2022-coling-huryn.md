---
title: Automatic Generation of Large-scale Multi-turn Dialogues from Reddit
authors:
  - Daniil Huryn
  - William M. Hutsell
  - Jinho D. Choi
venue: International Conference on Computational Linguistics
year: 2022
published: '2022-10-12'
publicationType: conference
venueUrl: 'https://coling2022.org'
paperUrl: 'https://aclanthology.org/2022.coling-1.297/'
resourceUrl: 'http://github.com/emorynlp/reddit-to-dialogue'
abstract: >-
  This paper presents novel methods to automatically convert posts and their comments from
  discussion forums such as Reddit into multi-turn dialogues. Our methods are generalizable to
  any forums; thus, they allow us to generate a massive amount of dialogues for diverse topics
  that can be used to pretrain language models. Four methods are introduced, Greedy Baseline,
  Greedy Advanced, Beam Search, and Threading, which are applied to posts from 10 subreddits
  and assessed. Each method makes a noticeable improvement over its predecessor such that the
  best method shows an improvement of 36.3% over the baseline. Our best method is applied to
  posts from the 10 subreddits to create a corpus consisting of 10K dialogues (3.3M tokens),
  570 of which are blindly compared against dialogues in 3 other datasets, Blended Skill Talk,
  Daily Dialogue, and Topical Chat. In general, our dialogues are found to be more engaging
  but slightly less natural than ones in the other datasets, while it costs a fraction of
  human labor and money to create our corpus compared to the others. To the best of our
  knowledge, it is the first work to create a large multi-turn dialogue corpus from discussion
  forums that can advance neural-based dialogue systems.
---
