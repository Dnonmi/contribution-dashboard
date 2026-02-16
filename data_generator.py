import json
import math
import random
from datetime import date, timedelta
from pathlib import Path
from typing import Dict, List, Tuple

DATA_DIR = Path("data")
RANDOM_SEED = 42


def ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def daterange(days: int) -> List[date]:
    """Return a list of dates ending today, inclusive, going back `days` days."""
    today = date.today()
    return [today - timedelta(days=offset) for offset in reversed(range(days))]


def generate_daily_contributions(days: int = 321) -> List[Dict[str, object]]:
    """
    Build day-level contribution counts with weekday and seasonal patterns.
    - Higher mid-week activity, softer weekends.
    - Gentle seasonal sine wave to mimic shifting focus.
    """
    base_level = 40
    amplitude = 12
    season_period = 90  # days for a cycle
    rng = random.Random(RANDOM_SEED + 1)

    contributions = []
    for i, current_date in enumerate(daterange(days)):
        # Weekly pattern: Tuesday-Thursday highest, weekend lowest.
        weekday = current_date.weekday()
        weekday_factor = {
            0: 1.05,  # Monday
            1: 1.15,  # Tuesday
            2: 1.18,  # Wednesday
            3: 1.12,  # Thursday
            4: 1.02,  # Friday
            5: 0.72,  # Saturday
            6: 0.78,  # Sunday
        }[weekday]

        seasonal_wave = math.sin(2 * math.pi * i / season_period)
        seasonal_factor = 1 + 0.18 * seasonal_wave

        noise = rng.uniform(-6, 6)
        total = max(5, int((base_level + amplitude * seasonal_wave) * weekday_factor + noise))

        prs = max(2, int(total * rng.uniform(0.35, 0.55)))
        reviews = max(2, int(total * rng.uniform(0.25, 0.45)))
        discussions = max(1, total - prs - reviews)

        contributions.append(
            {
                "date": current_date.isoformat(),
                "total": total,
                "pull_requests": prs,
                "reviews": reviews,
                "discussions": discussions,
            }
        )

    return contributions


def generate_agent_activity(agent_names: List[str]) -> List[Dict[str, object]]:
    """
    Allocate realistic activity counts per agent.
    - Bias a few agents as heavy contributors.
    - Include distribution across PRs, reviews, and mentoring.
    """
    rng = random.Random(RANDOM_SEED + 2)
    weights = [rng.triangular(0.8, 1.5, 2.2) for _ in agent_names]
    total_weight = sum(weights)

    agents = []
    for name, weight in zip(agent_names, weights):
        total = int(500 * weight / total_weight * len(agent_names))
        prs = max(5, int(total * rng.uniform(0.35, 0.55)))
        reviews = max(5, int(total * rng.uniform(0.25, 0.45)))
        mentoring = max(2, int(total * rng.uniform(0.08, 0.18)))
        discussions = max(3, total - prs - reviews - mentoring)

        agents.append(
            {
                "agent": name,
                "total": total,
                "pull_requests": prs,
                "reviews": reviews,
                "mentoring": mentoring,
                "discussions": discussions,
            }
        )

    return agents


def generate_collaboration_network(agent_names: List[str]) -> Dict[str, List[Dict[str, object]]]:
    """
    Create undirected weighted edges between agents to reflect co-work.
    - Heavier weights for pairs that tend to collaborate more.
    """
    rng = random.Random(RANDOM_SEED + 3)
    edges: List[Tuple[str, str, int]] = []

    for i, source in enumerate(agent_names):
        for target in agent_names[i + 1 :]:
            base = rng.triangular(2, 18, 10)
            if source.startswith("Agent A") or target.startswith("Agent A"):
                base *= 1.35
            if "Ops" in source or "Ops" in target:
                base *= 0.85
            weight = max(1, int(base + rng.uniform(-2, 3)))
            edges.append((source, target, weight))

    edges_sorted = sorted(edges, key=lambda e: e[2], reverse=True)
    return {
        "nodes": [{"id": name} for name in agent_names],
        "edges": [
            {"source": s, "target": t, "weight": w}
            for s, t, w in edges_sorted
            if w > 1
        ],
    }


def generate_topic_evolution(
    topics: List[str], periods: int = 26, period_length_days: int = 7
) -> List[Dict[str, object]]:
    """
    Model topic strength over time in weekly buckets.
    - Uses phased sine waves so topics peak at different moments.
    """
    rng = random.Random(RANDOM_SEED + 4)
    start_date = date.today() - timedelta(days=periods * period_length_days)
    topic_phase = {topic: rng.uniform(0, 2 * math.pi) for topic in topics}
    topic_base = {topic: rng.uniform(0.6, 1.2) for topic in topics}

    timeline = []
    for i in range(periods):
        period_start = start_date + timedelta(days=i * period_length_days)
        for topic in topics:
            wave = math.sin(2 * math.pi * i / periods + topic_phase[topic])
            momentum = topic_base[topic] * (1 + 0.6 * wave)
            volume = max(5, int(50 * momentum + rng.uniform(-6, 8)))
            timeline.append(
                {
                    "period_start": period_start.isoformat(),
                    "period_end": (period_start + timedelta(days=period_length_days - 1)).isoformat(),
                    "topic": topic,
                    "volume": volume,
                }
            )

    return timeline


def generate_historical_trends(months: int = 36) -> List[Dict[str, object]]:
    """
    Generate monthly contribution totals with seasonal patterns and upward drift.
    - Peaks in spring and late summer; dip in winter holidays.
    """
    rng = random.Random(RANDOM_SEED + 5)
    today = date.today().replace(day=1)
    entries = []

    for i in range(months):
        month_date = today - timedelta(days=30 * (months - i - 1))
        month_index = month_date.month

        seasonal_factor = {
            1: 0.85,
            2: 0.92,
            3: 1.05,
            4: 1.12,
            5: 1.08,
            6: 0.98,
            7: 1.15,
            8: 1.18,
            9: 1.06,
            10: 1.02,
            11: 0.95,
            12: 0.88,
        }[month_index]

        growth = 1 + 0.01 * i
        base = 800
        total = max(200, int(base * seasonal_factor * growth + rng.uniform(-60, 90)))
        prs = max(50, int(total * rng.uniform(0.38, 0.52)))
        reviews = max(40, int(total * rng.uniform(0.28, 0.4)))
        discussions = max(20, total - prs - reviews)

        entries.append(
            {
                "month": month_date.isoformat(),
                "total": total,
                "pull_requests": prs,
                "reviews": reviews,
                "discussions": discussions,
            }
        )

    return entries


def save_json(data: object, filename: str) -> None:
    ensure_data_dir()
    path = DATA_DIR / filename
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def main() -> None:
    agent_names = [
        "Agent Aurora",
        "Agent Bolt",
        "Agent Circuit",
        "Agent Delta",
        "Agent Echo",
        "Agent Flux",
        "Agent Glimmer",
        "Agent Halo",
        "Agent Ops",
        "Agent Pulse",
        "Agent Quanta",
        "Agent Relay",
    ]

    topics = [
        "park cleanup",
        "breaking news",
        "personality quiz",
        "juice shop",
        "technical kindness",
        "incident response",
        "neighborhood watch",
        "sustainability",
        "education outreach",
    ]

    daily = generate_daily_contributions()
    agents = generate_agent_activity(agent_names)
    network = generate_collaboration_network(agent_names)
    topic_timeline = generate_topic_evolution(topics)
    historical = generate_historical_trends()

    save_json(daily, "daily_contributions.json")
    save_json(agents, "agent_activity.json")
    save_json(network, "collaboration_network.json")
    save_json(topic_timeline, "topic_evolution.json")
    save_json(historical, "historical_trends.json")


if __name__ == "__main__":
    main()
