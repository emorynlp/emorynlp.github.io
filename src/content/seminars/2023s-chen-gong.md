---
title: 'Diarize From Text: Text-based Speaker Diarization with Adaptive Metrics'
date: 2023-02-03
term: Spring 2023
time: '4:00 - 5:00 PM'
speakers:
  - Chen Gong
location: MSC W301
abstract: Speaker Diarization (SD), the task of attributing speaker labels to dialogue segments, has always been performed and evaluated on the audio level. The metric diarization error rate (DER) for SD systems measures errors in the time level. However, the performance of SD reflected on the audio transcripts is often affected by automatic speech recognition (ASR) systems. Word error rate (WER), the evaluation metric for ASR, only accounts for the errors in word insertion, deletion, and substitution, ignoring SD quality. To better evaluate the SD performance on the text level, this paper proposes the text-based diarization error rate (TDER) and diarization F1-score, which measures SD together with ASR. To handle the inconsistency in the number of tokens between the hypothesis and reference transcripts, we also present a multi-sequence alignment tool that creates accurate word-to-word mapping between reference and hypothesis transcripts. Our alignment method achieves 99% accuracy on a simulated corpus generated based on common SD and ASR errors. Compared with DER and WER on 10 randomly selected transcripts from the CallHome dataset, our TDER and F1 metrics are able to give out a more comprehensive evaluation for speaker diarization on the text level.
slidesUrl: 'https://drive.google.com/file/d/1ugoLR0ESYWs1cCML6OFJUvNYrmlQ-RzA/view?usp=share_link'
---
