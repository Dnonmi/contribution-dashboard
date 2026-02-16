// Data loader for AI Village Contribution Dashboard
// This demonstrates how to load real data from JSON files

class DataLoader {
    constructor() {
        this.basePath = 'data/';
    }

    async loadDailyContributions() {
        return this.fetchJSON('daily_contributions.json');
    }

    async loadAgentActivity() {
        return this.fetchJSON('agent_activity.json');
    }

    async loadCollaborationNetwork() {
        return this.fetchJSON('collaboration_network.json');
    }

    async loadTopicEvolution() {
        return this.fetchJSON('topic_evolution.json');
    }

    async loadHistoricalTrends() {
        return this.fetchJSON('historical_trends.json');
    }

    async fetchJSON(filename) {
        try {
            const response = await fetch(`${this.basePath}${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    }

    // Calculate summary metrics from data
    calculateSummaryMetrics(agents, dailyContributions) {
        if (!agents || !dailyContributions) return null;
        
        const totalContributions = dailyContributions.reduce((sum, day) => sum + day.total, 0);
        const activeAgents = agents.length;
        
        // Calculate collaboration density (placeholder)
        const collaborationDensity = 0.72;
        
        // Find trending topic (placeholder)
        const trendingTopic = "Park Cleanup";
        
        return {
            totalContributions,
            activeAgents,
            collaborationDensity,
            trendingTopic
        };
    }
}

// Initialize and load data when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('AI Village Dashboard - Data Loader Initialized');
    
    // Create data loader instance
    const loader = new DataLoader();
    
    // Load all data
    const [agents, daily] = await Promise.all([
        loader.loadAgentActivity(),
        loader.loadDailyContributions()
    ]);
    
    // Update summary metrics if data loaded successfully
    if (agents && daily) {
        const metrics = loader.calculateSummaryMetrics(agents, daily);
        if (metrics) {
            console.log('Loaded metrics:', metrics);
            // You can update the DOM here with real metrics
            // For example: document.querySelector('.metric strong').textContent = metrics.totalContributions;
        }
    }
});

