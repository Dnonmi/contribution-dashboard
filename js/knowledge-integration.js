// knowledge-integration.js
// Integrates Time Capsule knowledge documents with Contribution Dashboard

class KnowledgeIntegrator {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.knowledgeData = null;
    this.villageGoalsData = null;
    this.timelineData = null;
    this.mappings = {};
    this.initialized = false;
    this.activeComponents = [];
  }

  // Load all required data
  async initialize() {
    try {
      // Load knowledge integration data
      this.knowledgeData = await this.dataLoader.loadData('integration/knowledge_integration_data.json');
      
      // Load village goals data (created by DeepSeek-V3.2)
      try {
        this.villageGoalsData = await this.dataLoader.loadData('village_goals.json');
      } catch (e) {
        console.warn("Village goals data not available yet:", e);
      }
      
      // Load timeline data (created by DeepSeek-V3.2)
      try {
        this.timelineData = await this.dataLoader.loadData('village_timeline.json');
      } catch (e) {
        console.warn("Timeline data not available yet:", e);
      }
      
      // Generate mappings if all data is available
      if (this.knowledgeData && this.villageGoalsData && this.timelineData) {
        this.generateMappings();
        this.initialized = true;
        
        // Set up event handlers for timeline and goals interaction
        this.setupEventHandlers();
      }
      
      return true;
    } catch (e) {
      console.error("Failed to initialize knowledge integrator:", e);
      return false;
    }
  }
  
  // Generate bidirectional mappings between knowledge documents and timeline/goals
  generateMappings() {
    this.mappings = {
      // Map from days to knowledge components
      dayToComponents: {},
      // Map from goals to knowledge components
      goalToComponents: {},
      // Map from knowledge components to goals and days
      componentToGoalsAndDays: {}
    };
    
    // Process each knowledge document and its components
    this.knowledgeData.knowledgeDocuments.forEach(doc => {
      doc.components.forEach(component => {
        // Store component reference
        const componentRef = {
          id: component.id,
          documentId: doc.id,
          title: component.title,
          type: doc.type,
          description: component.description
        };
        
        // Map days to components
        component.dayRanges.forEach(range => {
          for (let day = range.start; day <= range.end; day++) {
            if (!this.mappings.dayToComponents[day]) {
              this.mappings.dayToComponents[day] = [];
            }
            this.mappings.dayToComponents[day].push(componentRef);
          }
        });
        
        // Map goals to components
        if (component.goalIds) {
          component.goalIds.forEach(goalId => {
            if (!this.mappings.goalToComponents[goalId]) {
              this.mappings.goalToComponents[goalId] = [];
            }
            this.mappings.goalToComponents[goalId].push(componentRef);
          });
        }
        
        // Map component to goals and days
        this.mappings.componentToGoalsAndDays[component.id] = {
          component: componentRef,
          goals: component.goalIds || [],
          dayRanges: component.dayRanges,
          relatedDocuments: component.relatedDocuments || []
        };
      });
    });
  }

  // Set up event handlers for timeline and goals interaction
  setupEventHandlers() {
    // Event delegation approach for timeline elements
    document.addEventListener('click', (event) => {
      // Handle timeline day clicks
      if (event.target.matches('.timeline-day') || event.target.closest('.timeline-day')) {
        const dayElement = event.target.matches('.timeline-day') 
          ? event.target 
          : event.target.closest('.timeline-day');
        
        const day = parseInt(dayElement.getAttribute('data-day'), 10);
        if (!isNaN(day)) {
          this.handleDayClick(day, dayElement);
        }
      }
      
      // Handle goal clicks
      if (event.target.matches('.goal-item') || event.target.closest('.goal-item')) {
        const goalElement = event.target.matches('.goal-item') 
          ? event.target 
          : event.target.closest('.goal-item');
        
        const goalId = goalElement.getAttribute('data-goal-id');
        if (goalId) {
          this.handleGoalClick(goalId, goalElement);
        }
      }
      
      // Handle knowledge component clicks
      if (event.target.matches('.knowledge-component') || event.target.closest('.knowledge-component')) {
        const componentElement = event.target.matches('.knowledge-component') 
          ? event.target 
          : event.target.closest('.knowledge-component');
        
        const componentId = componentElement.getAttribute('data-component-id');
        if (componentId) {
          this.handleComponentClick(componentId, componentElement);
        }
      }
    });
  }
  
  // Handle clicks on timeline days
  handleDayClick(day, dayElement) {
    // Clear any previous active state
    this.clearActiveState();
    
    // Get components for this day
    const components = this.getComponentsForDay(day);
    
    // Add active class to the clicked element
    dayElement.classList.add('active-day');
    
    // Update the knowledge components list
    this.displayKnowledgeComponents(components, `Day ${day} Knowledge Components`);
    
    // Highlight any related timeline elements
    this.highlightRelatedTimelineElements(components);
    
    console.log(`Day ${day} clicked: ${components.length} knowledge components found`);
  }
  
  // Handle clicks on goal items
  handleGoalClick(goalId, goalElement) {
    // Clear any previous active state
    this.clearActiveState();
    
    // Get components for this goal
    const components = this.getComponentsForGoal(goalId);
    
    // Add active class to the clicked element
    goalElement.classList.add('active-goal');
    
    // Update the knowledge components list
    this.displayKnowledgeComponents(components, `Goal "${goalId.replace(/_/g, ' ')}" Knowledge Components`);
    
    // Highlight any related timeline elements
    this.highlightRelatedTimelineElements(components);
    
    console.log(`Goal ${goalId} clicked: ${components.length} knowledge components found`);
  }
  
  // Handle clicks on knowledge components
  handleComponentClick(componentId, componentElement) {
    // Clear any previous active state
    this.clearActiveState();
    
    // Get goals and days for this component
    const componentData = this.getGoalsAndDaysForComponent(componentId);
    
    if (componentData) {
      // Add active class to the clicked element
      componentElement.classList.add('active-component');
      
      // Update the knowledge reference docs
      this.displayComponentDetails(componentData);
      
      // Highlight any related timeline elements
      this.highlightRelatedDaysAndGoals(componentData);
      
      console.log(`Component ${componentId} clicked: ${componentData.goals.length} related goals, ${componentData.dayRanges.length} day ranges`);
    }
  }
  
  // Clear all active states
  clearActiveState() {
    document.querySelectorAll('.active-day, .active-goal, .active-component').forEach(el => {
      el.classList.remove('active-day', 'active-goal', 'active-component');
    });
    
    document.querySelectorAll('.highlighted-day, .highlighted-goal').forEach(el => {
      el.classList.remove('highlighted-day', 'highlighted-goal');
    });
    
    this.activeComponents = [];
  }
  
  // Display knowledge components in the components list
  displayKnowledgeComponents(components, title) {
    const container = document.getElementById('knowledgeComponentsList');
    if (!container) return;
    
    this.activeComponents = components;
    
    let html = `<h3>${title}</h3>`;
    
    if (components.length === 0) {
      html += '<p>No knowledge components found for this selection.</p>';
    } else {
      html += '<ul class="knowledge-components-list">';
      components.forEach(component => {
        html += `
          <li class="knowledge-component" data-component-id="${component.id}">
            <h4>${component.title}</h4>
            <p class="component-type">${component.type}</p>
            <p>${component.description}</p>
          </li>
        `;
      });
      html += '</ul>';
    }
    
    container.innerHTML = html;
  }
  
  // Display detailed information about a component
  displayComponentDetails(componentData) {
    const container = document.getElementById('knowledgeReferenceDocs');
    if (!container) return;
    
    const component = componentData.component;
    
    let html = `<div class="component-details">`;
    html += `<h3>${component.title}</h3>`;
    html += `<p class="component-type">${component.type}</p>`;
    html += `<p>${component.description}</p>`;
    
    // Day ranges
    html += `<div class="day-ranges">`;
    html += `<h4>Active During:</h4>`;
    html += `<ul>`;
    componentData.dayRanges.forEach(range => {
      html += `<li>Days ${range.start}-${range.end}</li>`;
    });
    html += `</ul>`;
    html += `</div>`;
    
    // Related goals
    if (componentData.goals && componentData.goals.length > 0) {
      html += `<div class="related-goals">`;
      html += `<h4>Related Goals:</h4>`;
      html += `<ul>`;
      componentData.goals.forEach(goalId => {
        html += `<li>${goalId.replace(/_/g, ' ')}</li>`;
      });
      html += `</ul>`;
      html += `</div>`;
    }
    
    // Related documents
    if (componentData.relatedDocuments && componentData.relatedDocuments.length > 0) {
      html += `<div class="related-documents">`;
      html += `<h4>Related Documents:</h4>`;
      html += `<ul>`;
      componentData.relatedDocuments.forEach(doc => {
        html += `<li>${doc.id} (${doc.relationship})</li>`;
      });
      html += `</ul>`;
      html += `</div>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
  }
  
  // Highlight timeline days and goals related to the components
  highlightRelatedTimelineElements(components) {
    // Get all day ranges and goal IDs for these components
    const relevantDays = new Set();
    const relevantGoals = new Set();
    
    components.forEach(component => {
      const data = this.mappings.componentToGoalsAndDays[component.id];
      if (data) {
        // Add days
        data.dayRanges.forEach(range => {
          for (let day = range.start; day <= range.end; day++) {
            relevantDays.add(day);
          }
        });
        
        // Add goals
        data.goals.forEach(goalId => {
          relevantGoals.add(goalId);
        });
      }
    });
    
    // Highlight days in timeline
    relevantDays.forEach(day => {
      document.querySelectorAll(`.timeline-day[data-day="${day}"]`).forEach(el => {
        el.classList.add('highlighted-day');
      });
    });
    
    // Highlight goals
    relevantGoals.forEach(goalId => {
      document.querySelectorAll(`.goal-item[data-goal-id="${goalId}"]`).forEach(el => {
        el.classList.add('highlighted-goal');
      });
    });
  }
  
  // Highlight days and goals related to a specific component
  highlightRelatedDaysAndGoals(componentData) {
    // Highlight days
    componentData.dayRanges.forEach(range => {
      for (let day = range.start; day <= range.end; day++) {
        document.querySelectorAll(`.timeline-day[data-day="${day}"]`).forEach(el => {
          el.classList.add('highlighted-day');
        });
      }
    });
    
    // Highlight goals
    componentData.goals.forEach(goalId => {
      document.querySelectorAll(`.goal-item[data-goal-id="${goalId}"]`).forEach(el => {
        el.classList.add('highlighted-goal');
      });
    });
  }
  
  // Get knowledge components active on a specific day
  getComponentsForDay(day) {
    return this.mappings.dayToComponents[day] || [];
  }
  
  // Get knowledge components related to a specific goal
  getComponentsForGoal(goalId) {
    return this.mappings.goalToComponents[goalId] || [];
  }
  
  // Get goals and day ranges for a specific knowledge component
  getGoalsAndDaysForComponent(componentId) {
    return this.mappings.componentToGoalsAndDays[componentId] || null;
  }
  
  // Extend the timeline visualization with knowledge markers
  extendTimelineVisualization(timelineElement) {
    if (!this.knowledgeData || !this.mappings.dayToComponents) {
      console.warn("Knowledge data not fully loaded for visualization");
      return;
    }
    
    // Get all institutional memory moments (pivotal events)
    const pivotalMoments = this.knowledgeData.knowledgeDocuments
      .filter(doc => doc.type === 'institutional_memory')
      .flatMap(doc => doc.components.map(component => ({
        id: component.id,
        title: component.title,
        description: component.description,
        dayRanges: component.dayRanges
      })));
    
    // Add markers for pivotal moments
    pivotalMoments.forEach(moment => {
      // Implementation would add visual markers to the timeline
      // For each moment.dayRanges, add a marker at start day
      console.log(`Adding marker for ${moment.title} at day ${moment.dayRanges[0].start}`);
      
      // This would be actual D3.js or similar visualization code
      // depending on how the timeline is implemented
    });
  }
  
  // Add decision framework context to goal visualization
  addDecisionFrameworkContext(goalElement, goalId) {
    const frameworks = this.getComponentsForGoal(goalId)
      .filter(component => component.type === 'decision_framework');
    
    if (frameworks.length === 0) return;
    
    // Implementation would add UI elements showing which decision
    // frameworks were used during this goal period
    console.log(`Adding ${frameworks.length} decision frameworks to goal ${goalId}`);
    
    // This would be actual DOM manipulation code
    // depending on how the goals are visualized
  }
  
  // Generate HTML documentation for bidirectional references
  generateReferenceDocs() {
    if (!this.knowledgeData) return null;
    
    let html = '<div class="knowledge-reference">';
    html += '<h2>Knowledge Reference Integration</h2>';
    
    // Add documentation for each knowledge document
    this.knowledgeData.knowledgeDocuments.forEach(doc => {
      html += `<div class="knowledge-document">`;
      html += `<h3>${doc.title}</h3>`;
      html += `<p>${doc.description}</p>`;
      
      // Add components
      html += `<div class="components">`;
      doc.components.forEach(component => {
        html += `<div class="component">`;
        html += `<h4>${component.title}</h4>`;
        html += `<p>${component.description || ''}</p>`;
        
        // Add day ranges
        html += `<div class="day-ranges">`;
        html += `<strong>Day Ranges:</strong> `;
        component.dayRanges.forEach((range, i) => {
          html += `Days ${range.start}-${range.end}`;
          if (i < component.dayRanges.length - 1) html += ', ';
        });
        html += `</div>`;
        
        // Add goals if available
        if (component.goalIds && component.goalIds.length > 0) {
          html += `<div class="goals">`;
          html += `<strong>Related Goals:</strong> `;
          component.goalIds.forEach((goalId, i) => {
            html += goalId.replace(/_/g, ' ');
            if (i < component.goalIds.length - 1) html += ', ';
          });
          html += `</div>`;
        }
        
        // Add related documents if available
        if (component.relatedDocuments && component.relatedDocuments.length > 0) {
          html += `<div class="related-docs">`;
          html += `<strong>Related Documents:</strong> `;
          component.relatedDocuments.forEach((doc, i) => {
            html += `${doc.id} (${doc.relationship})`;
            if (i < component.relatedDocuments.length - 1) html += ', ';
          });
          html += `</div>`;
        }
        
        html += `</div>`;
      });
      html += `</div>`;
      html += `</div>`;
    });
    
    html += '</div>';
    return html;
  }
}

// Export the class for use in the dashboard
export { KnowledgeIntegrator };
