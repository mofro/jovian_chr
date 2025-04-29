// skillsUI.js - UI management for skills section

import { 
  loadSkillsData, 
  initializeCharacterSkills,
  calculateSkillCost,
  calculateTotalSkillPoints,
  filterSkillsByCategory,
  searchSkills,
  increaseSkillLevel,
  decreaseSkillLevel
} from './skillManager.js';

// Global variables
let skillsData = null;
let characterSkills = [];
const skillCosts = {
  1: 1,
  2: 4,
  3: 9
};
const complexSkillMultiplier = 2;
const maxSkillPoints = 70;
const maxSkillLevel = 3;

// Initialize skills module
async function initializeSkills() {
  // Load skills data
  skillsData = await loadSkillsData();
  
  // Initialize character skills
  characterSkills = initializeCharacterSkills(skillsData);
  
  // Setup UI
  populateCategoryFilter();
  setupEventListeners();
  renderSkillList();
}

// Populate category dropdown
function populateCategoryFilter() {
  const categoryFilter = document.getElementById('skill-category-filter');
  if (!categoryFilter) return;
  
  // Clear existing options except "All Categories"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  
  // Add categories from data
  skillsData.categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Category filter change
  const categoryFilter = document.getElementById('skill-category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderSkillList);
  }
  
  // Search input
  const searchInput = document.getElementById('skill-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderSkillList);
  }
  
  // Display options
  const showDescriptions = document.getElementById('show-descriptions');
  if (showDescriptions) {
    showDescriptions.addEventListener('change', renderSkillList);
  }
  
  const showSpecializations = document.getElementById('show-specializations');
  if (showSpecializations) {
    showSpecializations.addEventListener('change', renderSkillList);
  }
}

// Render the skill list based on current filters
function renderSkillList() {
  const skillListElement = document.getElementById('skill-list');
  if (!skillListElement) return;
  
  // Clear existing skills
  skillListElement.innerHTML = '';
  
  // Get filter values
  const categoryFilter = document.getElementById('skill-category-filter');
  const selectedCategory = categoryFilter ? categoryFilter.value : 'All';
  
  const searchInput = document.getElementById('skill-search');
  const searchTerm = searchInput ? searchInput.value : '';
  
  const showDescriptions = document.getElementById('show-descriptions');
  const displayDescriptions = showDescriptions ? showDescriptions.checked : true;
  
  const showSpecializations = document.getElementById('show-specializations');
  const displaySpecializations = showSpecializations ? showSpecializations.checked : false;
  
  // Filter skills
  let filteredSkills = filterSkillsByCategory(characterSkills, selectedCategory === 'All' ? null : selectedCategory);
  filteredSkills = searchSkills(filteredSkills, searchTerm);
  
  // Get full skill data for each character skill
  const enrichedSkills = filteredSkills.map(charSkill => {
    const fullSkill = skillsData.skills.find(s => s.id === charSkill.id);
    return { ...charSkill, ...fullSkill };
  });
  
  // Render each skill
  enrichedSkills.forEach(skill => {
    const skillElement = document.createElement('div');
    skillElement.className = 'skill-item';
    
    // Calculate skill cost
    const skillCost = calculateSkillCost(skill, skillCosts, complexSkillMultiplier);
    
    // Build skill HTML
    let skillHTML = `
      <div class="skill-header">
        <span class="skill-name">${skill.name}${skill.complex ? ' (Complex)' : ''}</span>
        <span class="skill-category">${skill.category}</span>
      </div>
      <div class="skill-info">
        <span class="skill-level">Level: ${skill.level}</span>
        <span class="skill-cost">Cost: ${skillCost}</span>
        <div class="skill-controls">
          <button class="skill-decrease" data-skill-id="${skill.id}">-</button>
          <button class="skill-increase" data-skill-id="${skill.id}">+</button>
        </div>
      </div>
    `;
    
    // Add description if enabled
    if (displayDescriptions && skill.description) {
      skillHTML += `<div class="skill-description">${skill.description}</div>`;
    }
    
    // Add specializations if enabled
    if (displaySpecializations && skill.specializations && skill.specializations.length > 0) {
      skillHTML += `<div class="skill-specializations">
        <div class="specialization-label">Specializations:</div>
        <div class="specialization-list">
          ${skill.specializations.map(spec => `<span class="specialization">${spec}</span>`).join('')}
        </div>
      </div>`;
    }
    
    skillElement.innerHTML = skillHTML;
    
    // Add event listeners for buttons
    const increaseButton = skillElement.querySelector('.skill-increase');
    if (increaseButton) {
      increaseButton.addEventListener('click', () => increaseSkill(skill.id));
    }
    
    const decreaseButton = skillElement.querySelector('.skill-decrease');
    if (decreaseButton) {
      decreaseButton.addEventListener('click', () => decreaseSkill(skill.id));
    }
    
    skillListElement.appendChild(skillElement);
  });
  
  // Update points tracker
  updatePointsTracker();
}

// Increase skill level
function increaseSkill(skillId) {
  const result = increaseSkillLevel(
    characterSkills, 
    skillId, 
    maxSkillLevel, 
    maxSkillPoints, 
    skillCosts, 
    complexSkillMultiplier
  );
  
  if (result.success) {
    characterSkills = result.skills;
    renderSkillList();
  } else {
    alert(result.message);
  }
}

// Decrease skill level
function decreaseSkill(skillId) {
  const result = decreaseSkillLevel(
    characterSkills, 
    skillId, 
    skillCosts, 
    complexSkillMultiplier
  );
  
  if (result.success) {
    characterSkills = result.skills;
    renderSkillList();
  } else {
    alert(result.message);
  }
}

// Update the points tracker display
function updatePointsTracker() {
  const pointsTracker = document.getElementById('skill-points-used');
  if (!pointsTracker) return;
  
  const usedPoints = calculateTotalSkillPoints(characterSkills, skillCosts, complexSkillMultiplier);
  pointsTracker.textContent = `${usedPoints}/${maxSkillPoints}`;
}

// Get current character skills for saving
function getCharacterSkills() {
  return JSON.parse(JSON.stringify(characterSkills));
}

// Set character skills when loading
function setCharacterSkills(skills) {
  characterSkills = skills;
  renderSkillList();
}

// Export public functions
export {
  initializeSkills,
  getCharacterSkills,
  setCharacterSkills
};