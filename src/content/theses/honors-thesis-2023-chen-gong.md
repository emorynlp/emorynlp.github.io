---
title: "Evaluating Speaker Diarization in Transcripts: A Text-based Approach with the TDER Metric and the TranscribeView System"
author: "Chen Gong"
degree: "BS"
abstract: |
  Speaker Diarization (SD), the task of attributing speaker labels to dialogue segments, has traditionally been performed and evaluated at the audio level. The diarization error rate (DER) metric for SD systems measures errors in time but does not account for the impact of automatic speech recognition (ASR) systems on transcript-based performance. Word error rate (WER), the evaluation metric for ASR, only considers errors in word insertion, deletion, and substitution, disregarding SD quality. To better evaluate SD performance at the text level, this paper proposes Text-based Diarization Error Rate (TDER) and diarization F1-score, which jointly assess SD and ASR performance. To address inconsistencies in token counts between hypothesis and reference transcripts, we introduce a multiple sequence alignment tool that accurately maps words between reference and hypothesis transcripts. Our alignment method achieves 99% accuracy on a simulated corpus generated based on common SD and ASR errors. Comparisons with DER, WER, and WDER on 10 transcripts from the CallHome dataset demonstrate that TDER and diarization F1-score provide a more reliable evaluation of speaker diarization at the text level. To enable a comprehensive evaluation of transcript quality, we present TranscribeView, a web-based platform for assessing and visualizing errors in speech recognition and speaker diarization. To the best of our knowledge, TranscribeView is the first comprehensive platform that en- ables researchers to align multi-sequence transcripts and assess and visualize speaker diarization errors, contributing significantly to the advancement of data-driven conversational AI research.
term: "Spring 2023"
department: "Computer Science"
slidesUrl: "https://drive.google.com/file/d/1ugoLR0ESYWs1cCML6OFJUvNYrmlQ-RzA/view?usp=share_link"
paperUrl: "https://etd.library.emory.edu/concern/etds/7h149r37p"
committee:
  - "Jinho D. Choi, Computer Science, Emory University (Chair)"
  - "Emily Wall, Computer Science, Emory University"
  - "Roberto Franzosi, Computer Science, Emory University"
honorsLevel: "Highest Honor"
photo: "/theses/honors-thesis-2023-chen-gong.webp"
sourceUrl: "https://www.emorynlp.org/theses-dissertations/honors-thesis-2023-chen-gong?c=2021-2025"
---
