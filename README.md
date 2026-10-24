# Masters Atlas

Single source of truth for Jatin's overseas master's search (analytics, AI, technology management). Budget cap: INR 60 lakh all-in, no scholarships, Indian citizen.

## What is here

- `index.html`: the explorer. Browse by continent, country and university, re-weight the seven scores, open an info page per programme (`#p12`), add comments and YouTube links.
- `data/programs.json`: the 100 programmes the page reads (cost, scores, links). Edit this file and the page updates.
- `data/details.json`: per-programme depth keyed by id (`p1` to `p100`): admission process, documents, deadlines, tests, notes for Indian applicants, scholarships, a confidence flag and a list of what was not confirmed.
- `data/countries.json`: one guide per country (degree checks, 3-year degree rules, visa and funds, after-study stay, English norms, country-level funding).
- `data/programs.csv`: the programme rows for Excel or Sheets. Regenerate it from the JSON after any edit.

## Data rules

- Every programme has `status`, `sourceUrls` and `links`. Rows marked `Unverified` use indicative figures and must be checked on the official page before any budgeting.
- Use official university pages, government immigration sites and published rankings or outcome reports only.
- Costs are in INR lakh at the rates in `meta.fx`. Update `meta.updated` and `meta.fx` whenever fees or rates are refreshed.
- Each `details` entry has `confidence` (`verified` or `partial`) and `unverified` (what to check). `partial` means some items came from a search summary, an older page or a consultancy source, not the official page. Check those before paying anything.
- Country guides cite official pages where I could read them and flag items I could not confirm (for example post-study permits for several countries).
- Rank is by the default weighted score. New rows score on the same conventions as the first 50: affordability by cost band, immigration and PR by country, duration by months. Relevance, employability and admission odds are judgement calls.
- Scores run 1 to 10 on: relevance, employability, immigration, PR chances, affordability, admission odds, duration fit. Default weights are in `meta.weights`.
- `links.youtube` is a search link. Vetted videos go in the comments thread on the programme page.

## Adding a programme

1. Add an object to `programs` in `data/programs.json` with a new id (`p101`, ...). Copy the fields of an existing row.
2. Add an entry with the same id to `data/details.json` and make sure the country has a guide in `data/countries.json`.
3. Add the country to the `ISO` map in `index.html` if it is new (for the flag).
4. Regenerate the CSV and push to `main`.

## Put it on GitHub

1. Create a repository and push these files.
2. Settings, Pages, deploy from the `main` branch root. The site then serves `index.html` with `data/programs.json` next to it.
3. To refresh data later, edit `data/programs.json` in a pull request. Regenerate the CSV from it so the two stay in step.

## Comments

Comments and video links are stored in the published Claude artifact's own database, so they live there and not in this repository. On a GitHub Pages copy the comment box shows a "not available" note. For a GitHub-native thread, enable Discussions and link each programme to a discussion.

## Not advice

Not legal or migration advice. Visa and PR rules change often. Confirm with official government sources or a registered adviser before paying anything.
