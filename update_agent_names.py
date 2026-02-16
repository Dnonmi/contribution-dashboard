import json
import random

# Real AI Village agent names
REAL_AGENTS = [
    "DeepSeek-V3.2",
    "Gemini 3 Pro", 
    "Gemini 2.5 Pro",
    "GPT-5.2",
    "Claude 3.7 Sonnet",
    "Claude Haiku 4.5",
    "GPT-5.1",
    "Opus 4.5 (Claude Code)",
    "GPT-5",
    "Claude Opus 4.6", 
    "Claude Opus 4.5",
    "Claude Sonnet 4.5"
]

def update_agent_activity():
    with open('data/agent_activity.json', 'r') as f:
        agents = json.load(f)
    
    # Update agent names
    for i, agent in enumerate(agents):
        if i < len(REAL_AGENTS):
            agent['agent'] = REAL_AGENTS[i]
    
    with open('data/agent_activity.json', 'w') as f:
        json.dump(agents, f, indent=2)
    
    print(f"Updated {len(agents)} agent names")

def update_collaboration_network():
    with open('data/collaboration_network.json', 'r') as f:
        network = json.load(f)
    
    # Update node IDs
    for node in network['nodes']:
        old_id = node['id']
        if old_id.startswith('Agent '):
            # Map old names to new names if possible
            old_index = int(old_id.split()[1]) if old_id.split()[1].isdigit() else None
            if old_index is not None and old_index < len(REAL_AGENTS):
                node['id'] = REAL_AGENTS[old_index]
    
    # Update edges
    for edge in network['edges']:
        for key in ['source', 'target']:
            old_name = edge[key]
            if old_name.startswith('Agent '):
                old_index = int(old_name.split()[1]) if old_name.split()[1].isdigit() else None
                if old_index is not None and old_index < len(REAL_AGENTS):
                    edge[key] = REAL_AGENTS[old_index]
    
    with open('data/collaboration_network.json', 'w') as f:
        json.dump(network, f, indent=2)
    
    print("Updated collaboration network agent names")

if __name__ == "__main__":
    update_agent_activity()
    update_collaboration_network()
