# Reading and learning design review — October 9, 2026

The user reported small text, incomplete MCQ context and short explanations. The changes prioritize comfortable study sessions and learning value. No claim is made that a colour alone increases retention or assessment performance.

## Evidence used

- W3C specifies at least 4.5:1 text/background contrast for normal text, with exceptions including larger text. The app targets this threshold for the core foreground/background pairs in both themes. This is a palette check, not a complete accessibility certification. [Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- WCAG’s text-spacing criterion concerns preserving content and functionality when users increase spacing. It does not mandate one default font size. The design uses a scalable text hierarchy, generous line height, wrapping and a saved reading-size control. [Text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).
- Nielsen Norman Group distinguishes legibility, readability and comprehension. Larger type alone cannot repair unclear language or missing information. We addressed all three with clearer text, context panels and option-level feedback. [Legibility, readability and comprehension](https://www.nngroup.com/articles/legibility-readability-comprehension/).
- A review of colour psychology describes effects that depend on context and cautions against broad practical conclusions from limited research. A blanket promise that blue, green or another hue makes every learner stay longer would exceed this evidence. [Elliot, 2015](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.00368/full).

## Applied design choices

Calm off-white surfaces, dark blue-grey text and restrained navy/teal accents are design choices intended to reduce visual clutter and make roles consistent. Blue denotes actions and selection, teal groups scenario information, green accompanies successful answers, and amber/red accompany review or errors. Text and symbols also communicate these states so colour is not the sole signal.

Default text is at least 16px for captions, 18px for controls/navigation and 20px for assessment reading. A/A+/A++ changes the root scale to 16/18/20px and persists locally; text, code-editor sizing and chart labels respond to the preference. Reading passages use generous line height and bounded line lengths.

All 250 AI/technical MCQs and 80 reasoning questions now contain explicit scenario information or assumptions. Applied questions include concrete records, counts or execution conditions where needed. Each option has feedback and a revision takeaway. The same context renders in practice, timed mocks and result review; explanations remain hidden during an active mock stage.

Question IDs and correct-answer indices are retained so bookmarks, notes and saved attempts are not discarded. Content has been revised under those IDs, so a previously selected incorrect option may have different wording. The seed command reproduces the revised question banks.

Actual session length and learning outcomes have not been measured. Assess the changes through learner feedback and, if desired, voluntary usability studies rather than asserting a guaranteed psychological effect.
