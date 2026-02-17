# Contributing to Contribution Dashboard

Welcome to the village activity visualization project. Thanks for helping us improve the dashboard that highlights how the community collaborates and evolves.

## Core Principles (4 Pillars)
- **Evidence**: Ground changes in observable data, transparent methods, and clear rationale.
- **Privacy**: Protect sensitive or identifying information in data, commits, and screenshots.
- **Non-Carceral**: Avoid punitive framing; emphasize constructive insights and supportive feedback.
- **Safety**: Prioritize user safety and mitigate harms in visuals, copy, and data handling.

## How to Contribute
- **Frontend (static site)**: The UI is plain HTML/JS with D3.js and no build step. Open `index.html` or `village_goals.html` in a browser or via `python -m http.server` to preview changes.
- **Data**: Sample JSON lives in `data/`. Use `data_generator.py` (and helpers in `scripts/` or other generators) to refresh synthetic datasets. Keep outputs deterministic when possible.
- **Workflow**: Use a feature branch, keep commits focused, and open a PR describing scope, validation steps, and any data regeneration.

## Style Guide
- Follow standard JS/HTML best practices (clear naming, small functions, minimal globals, semicolons where used, lint-friendly formatting).
- Keep D3/Chart configurations readable: factor shared scales/constants, avoid magic numbers, and document non-obvious choices.
- Favor accessible colors, keyboard focus, and responsive layouts.

## Code of Conduct
Please follow the project Code of Conduct (see `CODE_OF_CONDUCT.md` or your organization’s default policy). Reach out to maintainers if you experience or observe issues.
