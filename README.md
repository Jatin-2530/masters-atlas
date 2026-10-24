# Masters Atlas

Single source of truth for Jatin's overseas master's search (analytics, AI, technology management). Budget cap: INR 60 lakh all-in, no scholarships, Indian citizen.

## What is here

- `index.html`: the explorer. Browse by continent, country and university, re-weight the seven scores, open an info page per programme (`#p12`), add comments and YouTube links.
- `data/programs.json`: the dataset the page reads. Edit this file and the page updates.
- `data/programs.csv`: the same rows for Excel or Sheets.

## Data rules

- Every programme has `status`, `sourceUrls` and `links`. Rows marked `Unverified` use indicative figures and must be checked on the official page before any budgeting.
- Use official university pages, government immigration sites and published rankings or outcome reports only.
- Costs are in INR lakh at the rates in `meta.fx`. Update `meta.updated` and `meta.fx` whenever fees or rates are refreshed.
- Scores run 1 to 10 on: relevance, employability, immigration, PR chances, affordability, admission odds, duration fit. Default weights are in `meta.weights`.
- `links.youtube` is a search link. Vetted videos go in the comments thread on the programme page.

## Put it on GitHub

1. Create a repository and push these files.
2. Settings, Pages, deploy from the `main` branch root. The site then serves `index.html` with `data/programs.json` next to it.
3. To refresh data later, edit `data/programs.json` in a pull request. Regenerate the CSV from it so the two stay in step.

## Comments

Comments and video links are stored in the published Claude artifact's own database, so they live there and not in this repository. On a GitHub Pages copy the comment box shows a "not available" note. For a GitHub-native thread, enable Discussions and link each programme to a discussion.

## Not advice

Not legal or migration advice. Visa and PR rules change often. Confirm with official government sources or a registered adviser before paying anything.
