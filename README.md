# Ariya's Study HQ

A revision app for the Year 7 Autumn Assessments (16–25 November 2026). It runs in Safari on the iPad and works offline once it has been opened.

**Live app:** https://patelt79-eng.github.io/ariya-study-hq/

## Add it to the iPad home screen

1. Open the link above in **Safari** (not Chrome).
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open it from the new "Study HQ" icon. It now opens full screen and works without Wi-Fi.

Progress is saved on the iPad itself. Every so often, use **Settings → Export progress** to save a backup file (for example to iCloud Drive). **Import progress** restores it.

## Fix or change a fact

All the revision content lives in the `src/content/` folder, one file per subject:

| File | Subject |
|---|---|
| `maths.ts` | Maths |
| `science.ts` | Science |
| `english.ts` | English |
| `re.ts` | RE |
| `geography.ts` | Geography |
| `history.ts` | History |
| `timetable.ts` | Exam dates for every class |
| `english.extras.ts` | English practice extracts and SPaG drills |
| `geography.extras.ts` | Geography exam questions, model answers and case studies |
| `history.extras.ts` | Timeline events, Showdown facts, 1066 claimants, Silk Road stops |
| `re.ts` (top of file) | RE key word definitions (used by flashcards and the Key Word Bank) |

To edit on the GitHub website:

1. Go to https://github.com/patelt79-eng/ariya-study-hq/tree/main/src/content and click the file.
2. Click the ✏️ pencil icon ("Edit this file").
3. Find the text (Ctrl/Cmd + F) and change only the words **inside the quotes**. Keep the quotes, commas and brackets as they are.
   - Flashcard: `fc(T.tri, 'Angles in a triangle add up to…', '180°'),` (front, then back)
   - Multiple choice: `mcq(topic, 'Question?', ['A', 'B', 'C', 'D'], 1, 'Explanation')`. The number is the position of the right answer, **counting from 0** (so 1 means the second option).
   - Number answer: `num(topic, 'Question?', 55, 'Explanation')`
   - True/false: `tf(topic, 'Statement.', true, 'Explanation')`
4. If your text needs an apostrophe, write it as `’` (a curly apostrophe) or put `\` before it: `it\'s`.
5. Click **Commit changes**. The site rebuilds itself in about 2 minutes.

`CONTENT_CHECK.md` lists every fact that was written from the national curriculum rather than copied from the booklet. Please check these against her exercise books.

## Redeploy

Every change pushed to the `main` branch rebuilds and redeploys the site automatically (see the **Actions** tab on GitHub). You can also open Claude Code in this folder and ask it to make and push a change.

## For developers

```bash
npm install
npm run dev      # local preview at http://localhost:5173/ariya-study-hq/
npm test         # planner unit tests
npm run e2e      # Playwright tests (iPad portrait/landscape and phone)
npm run build
```

Built with Vite, React, TypeScript, Framer Motion, canvas-confetti and vite-plugin-pwa. Sound effects use the Web Audio API.

Privacy: the app uses a first name only. Don't add a surname, the school's name, crest or staff details, and don't commit the school booklet.
