---
title: "Controllable Clinical Conversations: A Dialogue Act Framework for Trauma-Focused Interview Automation"
author: "Tung Dinh"
degree: "BS"
abstract: |
  Access to timely and structured mental health evaluations remains a challenge, especiallyfor individuals affected by trauma. While large language models (LLMs) offer potential forautomating clinical support, most existing systems lack the structured flow and empatheticengagement required in trauma-focused diagnostic interviews. This thesis presents a noveltwo-stage framework for automating these interviews using dialogue act (DA) classificationto improve both the coherence and clinical relevance of AI-generated responses. Our methodfirst labels clinician utterances using a trauma-specific DA taxonomy—including categoriessuch as Empathy (EMP), Clarification Questions (CQ), and Validation (VAL)—and thengenerates the next utterance based on the predicted DA tag.
  
  We fine-tune the open-source LLaMA 3 model using Low-Rank Adaptation (LoRA) andcompare its performance to GPT-4o through prompt chaining. Experiments on real-worldclinical interview data demonstrate that incorporating DA tags enhances the consistency ofnext-utterance generation and preserves the structured flow typical of human-led assessments.Additionally, we find that limiting the model’s context window improves DA classificationaccuracy without sacrificing response quality.
  
  Key contributions include (1) the development of a refined DA taxonomy tailored totrauma-focused interviews, (2) a two-step generation pipeline that enables controllable andclinically aligned dialogue, and (3) evaluation on real clinical transcripts as part of the broaderTraumaNLP initiative. Our findings suggest that integrating structured dialogue controlinto generative AI systems is a promising direction for scaling trauma assessment tools whilemaintaining empathy and clinical rigor.
term: "Spring 2025"
department: "Computer Science"
slidesUrl: "https://drive.google.com/file/d/1eHaLptGph-1tDIZzTcnHfo_J0tCfxzMI/view?usp=share_link"
paperUrl: "https://etd.library.emory.edu/concern/etds/c247dt52p?locale=en"
committee:
  - "Jinho D. Choi, Computer Science, Emory University (Chair)"
  - "Xiao Hu, School of Nursing, Emory University"
  - "Jiaying Lu, School of Nursing, Emory University"
honorsLevel: "High Honor"
photo: "/theses/honors-thesis-2025-tung-dinh.webp"
sourceUrl: "https://www.emorynlp.org/theses-dissertations/honors-thesis-2025-tung-dinh?c=2021-2025"
---
