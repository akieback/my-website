/* ==========================================================================
   PAPERS
   Each entry becomes a card on research.html and a full page at
   paper.html?id=<id>. Newest first. To add a paper, copy an entry.

   Fields
     id        url slug (letters, numbers, dashes)
     authors   list in paper order; "Adrian Kieback" is highlighted
     equal     names that share equal contribution (shown with *)
     status    short label shown as a highlighted chip
     links     { label, url } — PDFs live in /files
     video     YouTube id (optional)
     photos    { src, caption } — put images in images/papers/<id>/
     body      HTML string, the plain-language story of the paper
   ========================================================================== */

window.PAPERS = [
  {
    id: "gmm-anchored-jepa",
    short: "GMM-Anchored JEPA",
    title: "Soft Clustering Anchors for Self-Supervised Speech Representation Learning in Joint Embedding Prediction Architectures",
    year: 2026,
    date: "January 2026",
    venue: "arXiv",
    status: "Preprint",
    authors: ["Georgios Ioannides", "Adrian Kieback", "Judah Goldfeder", "Linsey Pang", "Aman Chadha", "Aaron Elkins", "Yann LeCun", "Ravid Shwartz-Ziv"],
    equal: ["Adrian Kieback", "Judah Goldfeder"],
    tags: ["self-supervised learning", "speech", "JEPA", "representation learning"],
    tldr: "Fit a Gaussian Mixture Model once on raw spectrograms, use its soft assignments as a fading anchor, and a JEPA speech model learns better representations without ever re-clustering.",
    results: [
      { label: "ASR word error rate", value: "28.68%", baseline: "vs 33.22% WavLM-style", pct: 28.68, base: 33.22, lowerIsBetter: true },
      { label: "Emotion recognition", value: "67.76%", baseline: "vs 65.46% accuracy", pct: 67.76, base: 65.46 },
      { label: "Slot filling F1", value: "64.7", baseline: "vs 59.1 F1", pct: 64.7, base: 59.1 },
      { label: "Cluster entropy", value: "98%", baseline: "vs 31% WavLM-style", pct: 98, base: 31 }
    ],
    links: [
      { label: "arXiv:2602.09040", url: "https://arxiv.org/abs/2602.09040" },
      { label: "PDF", url: "files/JEPA_GMM_2026.pdf" },
      { label: "Code", url: "https://github.com/gioannides/clustering-anchored-jepa" }
    ],
    photos: [],
    body: `
      <h2>The problem</h2>
      <p>Joint Embedding Predictive Architectures (JEPA) learn by hiding part of the input and predicting what the hidden part looks like <em>in representation space</em>, instead of reconstructing raw audio. That makes them efficient and focused on meaning rather than noise. The catch is <strong>representation collapse</strong>: with nothing grounding it, the network can learn to output the same thing for every input. That trivially solves the prediction task and learns nothing useful.</p>
      <p>HuBERT and WavLM avoid this by predicting discrete cluster labels, but they need to re-cluster their own features over and over during training. It works, but it's expensive and brittle.</p>

      <h2>The idea</h2>
      <p>We fit a <strong>Gaussian Mixture Model once</strong> on log-mel spectrograms before training starts, then freeze it. For every frame, the GMM gives a <em>soft</em> probability over clusters rather than a hard label. Those soft posteriors become an auxiliary target for the JEPA encoder.</p>
      <ul>
        <li><strong>Anchor early, let go later.</strong> A decaying supervision schedule lets the GMM signal dominate at the start of training, when collapse is most likely, then gradually hands control to the JEPA objective.</li>
        <li><strong>Cluster once, not iteratively.</strong> Unlike HuBERT or WavLM, there is no re-clustering loop. The anchor is computed on input features a single time.</li>
        <li><strong>Soft, not hard.</strong> Soft assignments keep the uncertainty between acoustically similar sounds instead of forcing a single label.</li>
      </ul>
      <blockquote>It works a lot like a first bolt on a climb. It holds you while you're finding your feet, and once you're moving well you hardly use it.</blockquote>

      <h2>What we found</h2>
      <p>Trained on roughly <strong>50,000 hours of speech</strong> and compared against a WavLM-style baseline with matched compute, GMM anchoring improved speech recognition, emotion recognition, and slot filling. The learned representations also use their cluster space far more evenly: up to 98% entropy versus 31% for the baseline.</p>

      <h2>My part</h2>
      <p>I'm an equal-contribution author. I worked on developing the architecture and on training and evaluating it at scale on a DGX B200 cluster (8 GPUs, 1.4&nbsp;TB VRAM).</p>
    `,
    bibtex: `@misc{ioannides2026softclustering,
  title  = {Soft Clustering Anchors for Self-Supervised Speech Representation Learning in Joint Embedding Prediction Architectures},
  author = {Ioannides, Georgios and Kieback, Adrian and Goldfeder, Judah and Pang, Linsey and Chadha, Aman and Elkins, Aaron and LeCun, Yann and Shwartz-Ziv, Ravid},
  year   = {2026},
  eprint = {2602.09040},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "dawzy",
    short: "DAWZY",
    title: "DAWZY: A New Addition to AI-Powered “Human in the Loop” Music Co-creation",
    year: 2025,
    date: "December 2025",
    venue: "NeurIPS 2025 · AI for Music Workshop",
    status: "NeurIPS 2025 Workshop",
    authors: ["Aaron C. Elkins", "Sanchit Singh", "Adrian Kieback", "Sawyer Blankenship", "Uyiosa Philip Amadasun", "Aman Chadha"],
    equal: [],
    tags: ["LLM agents", "music", "human-computer interaction", "MCP"],
    tldr: "An open-source, voice-first assistant that turns requests like “warm up the vocals” (typed, spoken, or hummed) into safe, reversible edits inside a real music production tool.",
    results: [],
    video: "RQmCuYLkEDk",
    links: [
      { label: "arXiv:2512.03289", url: "https://arxiv.org/abs/2512.03289" },
      { label: "Published paper", url: "files/DAWZY_new.pdf" },
      { label: "Demo paper (2 pages)", url: "files/NeurIPS Dawzy 2 Page.pdf" },
      { label: "Conference poster", url: "files/NeurIPS Poster.pdf" },
      { label: "Pre-print", url: "files/DAWZY_old.pdf" },
      { label: "Demo video", url: "https://www.youtube.com/watch?v=RQmCuYLkEDk" }
    ],
    photos: [
      // { src: "images/papers/dawzy/poster-session.jpg", caption: "Poster session, NeurIPS 2025, San Diego" }
    ],
    body: `
      <h2>The problem</h2>
      <p>Digital Audio Workstations (DAWs) give producers precise control, but there is a big gap between what you <em>mean</em> (“make the vocals warmer”) and the dozens of low-level clicks it takes to get there. That gap breaks creative flow. Most AI music generators go the other way: they produce a finished track in one shot and leave little room for the human to shape it.</p>

      <h2>What DAWZY does</h2>
      <p>DAWZY keeps the DAW (REAPER) as the creative hub and adds a minimal, voice-first assistant on top of it. You can ask in three ways:</p>
      <ul>
        <li><strong>Text:</strong> type a request into a simple chat box.</li>
        <li><strong>Speech:</strong> say it out loud. Whisper transcribes it hands-free.</li>
        <li><strong>Humming:</strong> hum a melody and Spotify's BasicPitch turns it into a MIDI track.</li>
      </ul>
      <p>An LLM interprets the request and writes ReaScript code. Three Model Context Protocol (MCP) tools keep it grounded: one queries the live session state, one converts human units like dB and ms into the DAW's internal parameter ranges, and one generates beats locally with MusicGen.</p>

      <h2>Why it's safe to use</h2>
      <p>The assistant refreshes the session state before every change, runs edits as atomic scripts, and every action can be undone. It also explains each edit in plain language, so you learn the tool while you use it.</p>

      <h2>What we found</h2>
      <p>DAWZY handled common production tasks reliably, and users rated it positively across usability, control, learning, collaboration, and enjoyment. We presented it at the NeurIPS 2025 AI for Music workshop in San Diego.</p>
    `,
    bibtex: `@misc{elkins2025dawzy,
  title  = {DAWZY: A New Addition to AI powered "Human in the Loop" Music Co-creation},
  author = {Elkins, Aaron C. and Singh, Sanchit and Kieback, Adrian and Blankenship, Sawyer and Amadasun, Uyiosa Philip and Chadha, Aman},
  year   = {2025},
  eprint = {2512.03289},
  archivePrefix = {arXiv},
  note   = {NeurIPS 2025 Workshop on AI for Music}
}`
  },

  {
    id: "density-adaptive-attention",
    short: "Density Adaptive Attention",
    title: "Density Adaptive Attention-based Speech Network: Enhancing Feature Understanding for Mental Health Disorders",
    year: 2024,
    date: "August 2024",
    venue: "arXiv",
    status: "Preprint",
    authors: ["Georgios Ioannides", "Adrian Kieback", "Aman Chadha", "Aaron Elkins"],
    equal: [],
    tags: ["speech", "mental health", "attention", "explainability"],
    tldr: "Two small, explainable speech models that detect depression from voice recordings using an attention mechanism that learns which moments of speech actually matter.",
    results: [
      { label: "F1 macro · Transformer", value: "0.72", baseline: "DAAMAudioTransformer, DAIC-WOZ", pct: 72 },
      { label: "F1 macro · CNN-LSTM", value: "0.702", baseline: "DAAMAudioCNNLSTM, DAIC-WOZ", pct: 70.2 }
    ],
    links: [
      { label: "arXiv:2409.00391", url: "https://arxiv.org/abs/2409.00391" }
    ],
    photos: [],
    body: `
      <h2>The problem</h2>
      <p>Depression shows up in the voice: in pacing, energy, and prosody. But it shows up differently in every person, and clinical speech datasets are small. Models that need lots of data or hand-made side information (like vowel positions or speaker identity) are hard to trust and hard to deploy.</p>

      <h2>The idea</h2>
      <p>We built two models, <strong>DAAMAudioCNNLSTM</strong> and <strong>DAAMAudioTransformer</strong>, around a multi-head <strong>Density Adaptive Attention Mechanism (DAAM)</strong>. Instead of attending uniformly, DAAM learns to concentrate on the speech segments that carry the most information, and it does so in a way you can inspect afterwards.</p>
      <ul>
        <li><strong>Parameter-efficient:</strong> small enough to be practical.</li>
        <li><strong>Explainable:</strong> the attention shows <em>where</em> in the recording the model found evidence.</li>
        <li><strong>No side information:</strong> no vowel positions or speaker labels during training or validation.</li>
      </ul>

      <h2>What we found</h2>
      <p>On the DAIC-WOZ benchmark, the models reached state-of-the-art F1 macro scores of 0.702 (CNN-LSTM) and 0.72 (Transformer). The code is publicly available to support further research on speech and mental health.</p>
    `,
    bibtex: `@misc{ioannides2024daam,
  title  = {Density Adaptive Attention-based Speech Network: Enhancing Feature Understanding for Mental Health Disorders},
  author = {Ioannides, Georgios and Kieback, Adrian and Chadha, Aman and Elkins, Aaron},
  year   = {2024},
  eprint = {2409.00391},
  archivePrefix = {arXiv}
}`
  }
];
