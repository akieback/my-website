/* ==========================================================================
   HOME PAGE CONTENT
   "now"  : what you're working on right now (shown as live cards)
   "log"  : milestones, newest first. "href" is optional.
   ========================================================================== */

window.SITE = {
  now: [
    {
      title: "Speech-based prediction of depressive episodes in bipolar youth",
      text: "Building an end-to-end pipeline for longitudinal interview speech, then comparing LSTM, Transformer and JEPA-inspired encoders for early detection of mood-state transitions.",
      with: "with Baylor College of Medicine · advisor Aaron Elkins"
    },
    {
      title: "Environmental & geographic risk factors for lung cancer",
      text: "Mixed-effects, generalized additive and geospatial models for finding what beyond smoking is associated with lung cancer incidence.",
      with: "with SHARP · advisor Aaron Elkins"
    }
  ],

  log: [
    // TODO: add the date and a one-line description for WM@Booth.
    { when: "2026", what: "WM@Booth", note: "Attended WM@Booth.", where: "" },
    { when: "Jan 2026", what: "GMM-Anchored JEPA on arXiv", note: "Self-supervised speech with Yann LeCun, Ravid Shwartz-Ziv and team.", where: "arXiv", href: "paper.html?id=gmm-anchored-jepa" },
    { when: "Dec 2025", what: "Presented DAWZY at NeurIPS", note: "AI for Music workshop: voice-first music co-creation.", where: "San Diego, CA", href: "paper.html?id=dawzy" },
    { when: "Aug 2024", what: "Density Adaptive Attention on arXiv", note: "Explainable depression detection from speech.", where: "arXiv", href: "paper.html?id=density-adaptive-attention" },
    { when: "Sep 2023", what: "Joined the Brown Center for AI", note: "Machine Learning Researcher, speech & audio.", where: "San Diego, CA" }
  ]
};
