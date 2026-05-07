---
title: "Building Task-Oriented Dialogue Systems via Instruction Guidance without Annotated Data"
author: "Henry Gao"
degree: "BS"
abstract: |
  Task-oriented dialogue (TOD) systems traditionally rely on supervised fine-tuning with large amounts of annotated data, which is costly and often unavailable in many domains. In this work, we investigate whether large language models (LLMs) can construct effective TOD systems without any annotated data, relying solely on prompting and unstructured conversational logs.
  
  We propose a two-stage framework in which an LLM first induces structured, text-based procedural instructions from raw multi-turn dialogues, and then leverages these instructions to guide the generation of new, goal-oriented interactions. To improve instruction quality, we incorporate an iterative refinement process where the model evaluates generated dialogues and updates the instructions accordingly. This approach enables the system to progressively capture task-specific behaviors while maintaining interpretability through explicit natural language representations.
  
  To address the limitations of existing evaluation metrics, we further introduce an interactive evaluation framework based on user simulation. By allowing the dialogue system to interact with a simulator that has access to the ground-truth user goals, our method evaluates task success in a flexible manner that is independent of rigid dialogue trajectories.
  
  Experimental results demonstrate that the proposed framework can generate coherent and effective task-oriented dialogues without relying on annotated data, highlighting the potential of instruction-driven approaches for building scalable and data-efficient dialogue systems. Using a 27b gemma3 model, the system achieves 86.3% F1 Score on dialogue states, outperforming models which we have access to the responses, GALAXY TOD (84.3%) and MARS TOD (84.6%).
term: "Spring 2026"
department: "Computer Science"
committee:
  - "Jinho D. Choi, Computer Science, Emory University (Chair)"
  - "Steven La Fleur, Computer Science, Emory University"
  - "Kai Shu, Computer Science, Emory University"
honorsLevel: "Highest Honor"
photo: "/theses/honors-thesis-2026-henry-gao.webp"
sourceUrl: "https://www.emorynlp.org/theses-dissertations/honors-thesis-2026-henry-gao?c=2026-2030"
slidesUrl: "https://drive.google.com/file/d/1SeXLL98QeaYaaoaQIA9QcAJbXGSTY9u_/view?usp=drive_link"
---
