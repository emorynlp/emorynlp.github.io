---
title: "Contextual Embedding Representations for Retrieval-Based and Generation-Based Dialogue Systems"
author: "Zihao Wang"
degree: "PhD"
abstract: |
  Context is a crucial element for conversational agents to conduct natural and engaging conversations with human users. By being aware of the context, a conversational agent can capture, understand, and utilize relevant information, such as named entity mentions, topics of interest, user intents, and emotional semantics. However, incorporating contextual information into dialogue systems is a challenging task due to the various forms it can take, the need to decide which information is most relevant, and how to organize and integrate it.
  
  To address these challenges, this dissertation proposes exploring and experimenting with different contextual information in the embedding space across different models and tasks. Furthermore, the dissertation develops models that overcome the limitations of state-of-the-art language models in terms of the maximum number of tokens they can encode and their incapacity to fuse arbitrary forms of contextual information. Additionally, diarization methods are explored to resolve speaker ID errors in the transcriptions, which is crucial for training dialogue data.
  
  The proposed models address the challenges of context integration into retrieval-based and generation-based dialogue systems. In retrieval-based systems, a response is selected and returned by ranking all responses from different components. A contextualized conversational ranking model is proposed and evaluated on the MSDialog benchmark conversational corpus, where three types of contextual information are leveraged and incorporated into the ranking model: previous conversation utterances from both speakers, semantically similar response candidates, and domain information associated with each candidate response. The performance of the contextual response ranking model exceeded state-of-the-art models in previous research, show- ing the potential to incorporate various forms of context into modeling.
  
  In generation-based systems, a generative model generates a response to be returned to the conversing party. A generative model is built on top of the Blenderbot model, overcoming its limitations to integrate two types of contextual information: previous conversation utterances from both conversing parties and heuristically identified stacked questions that tackle repetition and provide topical diversity in dialogue generations. The models are trained on an interview dataset and evaluated on an annotated test set by professional interviewers and students in real conversations. The average satisfaction score from professional interviewers and students is 3.5 out of 5, showing promising future applications.
  
  Additionally, to better understand topics of interest, topical clustering and diversity are investigated by grouping topics and analyzing the topic flow in the interview conversations. Frequent occurrences of some clusters of topics give a clear presentation of what scopes of topics an interview would touch on while maintaining a great selection of unique topics for individuals. Based on the observation, further discussions on the potential incorporation of such characteristics to improve conversational dialogue models are conducted.
term: "Spring 2023"
department: "Computer Science and Informatics"
slidesUrl: "https://drive.google.com/file/d/1R-LmOzLfLVjB4QfpHb6w3QR8WqOrnFGI/view?usp=share_link"
paperUrl: "https://etd.library.emory.edu/concern/etds/dz010r397"
committee:
  - "Jinho D. Choi, Computer Science, Emory University (Chair)"
  - "Joyce Ho, Computer Science, Emory University"
  - "Davide Fossati, Computer Science, Emory University"
  - "Shamin Nemati, Medicine, University of California San Diego"
photo: "/theses/phd-dissertation-2023-zihao-wang.webp"
sourceUrl: "https://www.emorynlp.org/theses-dissertations/phd-dissertation-2023-zihao-wang?c=2021-2025"
---
