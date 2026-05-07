---
title: "Stress Testing Instruction Following in Large Language Models"
author: "Noah Reicin"
degree: "BA"
abstract: |
  Large Language Models (LLMs) are increasingly deployed in complex, multi-step workflows, yet their ability to maintain ordered execution across many steps remains underexplored. This thesis develops and extends RIFT (Reordered InstructionFollowing Testbed), an evaluation framework that disentangles prompt structure from task content using rephrased Jeopardy! question–answer pairs, assessing instruction following under linear (sequential) and jumping (non-sequential) prompt structures.
  
  Phase 1 established across 10,000 evaluations spanning six open-source LLMs that accuracy drops by up to 72% under jumping conditions relative to baseline, with median accuracy near zero on many runs. Error analysis showed that approximately 33 to 60% of failures stem from instruction-order violations rather than knowledge errors.
  
  Phase 2 extends this work by testing whether prompt-tuning interventions can restore execution control under the jumping condition at scales up to 300 questions per prompt. Four prompt families are evaluated: current (baseline), plan-first, explicit-path, and generate-path. A key finding is the divergence between coverage, whether the model attempts all required steps, and accuracy, whether it executes them correctly. Structured prompts raise coverage from ∼21% to ∼90%, largely solving the completion problem, while accuracy improves only from ∼2% to ∼22%, revealing that order failure and completion failure are largely independent. A further finding, the path representation effect, shows that model-generated traversal paths outperform algorithmically supplied paths of identical format by ∼17%, suggesting execution fidelity depends on the process by which structural representations are produced.
term: "Spring 2026"
department: "Computer Science"
committee:
  - "Jinho D. Choi, Computer Science, Emory University (Chair)"
  - "John Lysaker, Philosophy, Emory University"
  - "Nosayba El-Sayed, School of Nursing, Emory University"
honorsLevel: "Highest Honor"
photo: "/theses/honors-thesis-2026-noah-reicin.webp"
sourceUrl: "https://www.emorynlp.org/theses-dissertations/honors-thesis-2026-noah-reicin?c=2026-2030"
slidesUrl: "https://drive.google.com/file/d/1kwBQP1PYKMIk4kNsLm-h6AmP4fuU76Ak/view?usp=drive_link"
---
