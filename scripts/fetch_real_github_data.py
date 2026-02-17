#!/usr/bin/env python3
"""
Fetch real GitHub contribution data for ai-village-agents organization.
Uses the gh CLI for authenticated API access.
Outputs JSON files matching the dashboard's expected format.
"""

import json
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timedelta

ORG = "ai-village-agents"

def run_gh_api(endpoint):
    """Run a gh api command and return parsed JSON."""
    cmd = ["gh", "api", endpoint, "--paginate"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error fetching {endpoint}: {result.stderr}", file=sys.stderr)
        return []
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        # Handle paginated results (multiple JSON objects)
        items = []
        for line in result.stdout.strip().split('\n'):
            if line:
                try:
                    data = json.loads(line)
                    if isinstance(data, list):
                        items.extend(data)
                    else:
                        items.append(data)
                except:
                    pass
        return items

def get_repos():
    """Get all repos in the organization."""
    repos = run_gh_api(f"/orgs/{ORG}/repos?per_page=100")
    return [r["name"] for r in repos if not r.get("archived")]

def get_contributors_for_repo(repo):
    """Get commit contributors for a repo."""
    contributors = run_gh_api(f"/repos/{ORG}/{repo}/contributors?per_page=100")
    return {c["login"]: c["contributions"] for c in contributors if isinstance(c, dict)}

def get_prs_for_repo(repo):
    """Get PRs for a repo (last 100)."""
    prs = run_gh_api(f"/repos/{ORG}/{repo}/pulls?state=all&per_page=100")
    return prs

def get_reviews_for_pr(repo, pr_number):
    """Get reviews for a specific PR."""
    reviews = run_gh_api(f"/repos/{ORG}/{repo}/pulls/{pr_number}/reviews")
    return reviews

def main():
    print("Fetching repos...")
    repos = get_repos()
    print(f"Found {len(repos)} repos: {repos}")
    
    agent_stats = defaultdict(lambda: {
        "total": 0,
        "pull_requests": 0,
        "reviews": 0,
        "commits": 0,
        "discussions": 0
    })
    
    # Fetch commits per contributor
    print("\nFetching commit data...")
    for repo in repos:
        contributors = get_contributors_for_repo(repo)
        for login, count in contributors.items():
            agent_stats[login]["commits"] += count
            agent_stats[login]["total"] += count
    
    # Fetch PR data
    print("\nFetching PR data...")
    for repo in repos:
        prs = get_prs_for_repo(repo)
        for pr in prs:
            if isinstance(pr, dict) and "user" in pr:
                author = pr["user"]["login"]
                agent_stats[author]["pull_requests"] += 1
                agent_stats[author]["total"] += 1
                
                # Get reviews for this PR (limit to first 5 PRs per repo to avoid rate limits)
                if agent_stats[author]["pull_requests"] <= 5:
                    reviews = get_reviews_for_pr(repo, pr["number"])
                    for review in reviews:
                        if isinstance(review, dict) and "user" in review:
                            reviewer = review["user"]["login"]
                            agent_stats[reviewer]["reviews"] += 1
                            agent_stats[reviewer]["total"] += 1
    
    # Convert to output format
    output = []
    for agent, stats in sorted(agent_stats.items(), key=lambda x: -x[1]["total"]):
        output.append({
            "agent": agent,
            "total": stats["total"],
            "pull_requests": stats["pull_requests"],
            "reviews": stats["reviews"],
            "commits": stats["commits"],
            "discussions": stats["discussions"]
        })
    
    # Save to file
    output_path = "data/agent_activity_real.json"
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved {len(output)} contributors to {output_path}")
    print("\nTop 10 contributors:")
    for item in output[:10]:
        print(f"  {item['agent']}: {item['total']} total ({item['commits']} commits, {item['pull_requests']} PRs, {item['reviews']} reviews)")

if __name__ == "__main__":
    main()
