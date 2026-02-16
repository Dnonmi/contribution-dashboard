# AI Village Contribution Visualization Dashboard

Interactive dashboard that showcases how AI Village agents contribute, collaborate, and shift focus over time. The project ships with synthetic data and ready-to-tweak Chart.js visualizations so you can plug in real signals from GitHub or other systems without a complex build step.

## Project Overview and Purpose
- Provide a single-pane view of contribution health (volume, activity mix, collaboration, and topical momentum).
- Serve as a lightweight demo that can be extended to real telemetry without additional frameworks.
- Offer reproducible synthetic datasets for prototyping, design reviews, and demos.

## Features and Visualizations
- Summary metrics for total contributions, active agents, collaboration density, and trending topic.
- Contribution volume line chart (weekly cadence) with gradient fill.
- Agent activity bar chart for role/agent comparisons.
- Collaboration bubble chart as a network proxy (weights represent co-work density).
- Topic evolution radar chart comparing current vs. previous periods.
- Historical trends dual-axis line chart (total contributions + collaboration score).
- Responsive layout with sidebar navigation and keyboard-focus styles.

## Data Sources
- **Synthetic data**: Generated via `data_generator.py`, which produces JSON files in `data/` (`daily_contributions.json`, `agent_activity.json`, `collaboration_network.json`, `topic_evolution.json`, `historical_trends.json`). The generator uses deterministic seeds to keep examples repeatable.
- **Real data (bring your own)**: Swap the sample datasets by fetching from your preferred sources (e.g., GitHub REST/GraphQL for PRs and reviews, Slack/Discord exports for discussions, or internal metrics). Normalize outputs to the same schemas used in `data/` and either load them into the static arrays in `index.html` or fetch them dynamically at runtime.

## Setup Instructions
### Prerequisites
- Python 3.9+ (only needed to regenerate synthetic data).
- A static server for local preview (e.g., `python -m http.server`)—no build tools required.

### Local Development
1) Clone the repo and move into it.  
2) (Optional) Create a virtualenv and install data tooling: `pip install -r requirements.txt`.  
3) Regenerate datasets if needed: `python data_generator.py` (outputs to `data/`).  
4) Start a static server from the project root, e.g. `python -m http.server 8000`.  
5) Open `http://localhost:8000` to view the dashboard.

### GitHub Pages
Because this is a pure static site, deployment is trivial:
- Commit and push `index.html` (and any assets/data) to your default branch.
- In GitHub Settings → Pages, set Source to “Deploy from a branch” and choose the branch/root folder, or publish the `gh-pages` branch if you prefer a dedicated deployment branch.
- After Pages builds, visit the provided `https://<org>.github.io/<repo>` URL.

## Usage Guide
- **View the dashboard**: Open `index.html` locally or via the served URL. Chart.js is loaded from a CDN.  
- **Update visuals**: Edit the datasets in `index.html` to match your data model, or fetch JSON from `data/` (or an API) and hydrate the charts at runtime.  
- **Regenerate sample data**: Run `python data_generator.py` to refresh all JSON files with new synthetic values (keeps structure consistent).  
- **Add new charts**: Extend the Chart.js configs in `index.html` or place modular scripts in `js/` and wire them up with additional `<canvas>` elements.

## Future Enhancements
- Hook charts to live GitHub/Slack telemetry with periodic refresh.
- Add filtering (by team, repo, date range) and drill-down panels per agent/topic.
- Render the collaboration network with an interactive force layout.
- Add CI to auto-regenerate synthetic data and publish to GitHub Pages on merge.
- Include accessibility checks (color-contrast linting, tab-order auditing).

## License and Contribution Guidelines
- **License**: MIT (add a `LICENSE` file before publishing externally if one is not already present).  
- **Contributions**: Open an issue or discussion before large changes. Use feature branches, keep commits focused, and include data/regeneration notes when modifying `data_generator.py` or `data/`. Prefer small PRs with screenshots or GIFs of UI updates and a quick description of how you validated changes locally.
