---
title: Speaker Diarization
date: 2024-10-18
term: Fall 2024
time: '3:00 - 4:00 PM'
speakers:
  - Mutian Li
location: White Hall 100
abstract: 'This work presents my motivation and exploration of speaker diarization problems. The speaker diarization answers "who speaks when" problem within a dialogue. The motivation of exploring speaker diarization is to process our interview recordings used for training trauma chatbot. I first explore a text-based speaker diarization method, which predicts whether speaker change exists between two adjacent sentences, then aggregate to the final speaker diarization result. This method suffers from error accumulation and has a poor behavior over long conversations, so I continue to explore audio-based methods. Audio based methods can be generally divided into end-to-end neural diarization and pipeline systems. Here, I introduce a specific pipeline system based method, which is based on pyannote pipeline and applied powerset classification method to predict local speaker diarization result. Then, I introduce the post-processing method for speaker diarization result, including generating transcriptions with speaker ids, and error fixing with chatgpt. Finally, I propose my method of multi-modal speaker diarization, which is still in progress.'
slidesUrl: 'https://drive.google.com/file/d/16GVOS6P26N1WMw2T_0hpsFjnOxQ0UlSf/view?usp=sharing'
---
