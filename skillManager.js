// skillManager.js - Manages skills data and operations

// Function to load skills data from JSON file
async function loadSkillsData() {
  try {
    const response = await fetch('skills.json');
    if (!response.ok) {
      throw new Error(`Failed to load skills data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading skills data:', error);
    // Fallback to default skills if loading fails
    return getDefaultSkillsData();
  }
}

// Fallback function to provide default skills data if JSON loading fails
function getDefaultSkillsData() {
  // Simplified version of the skills JSON for fallback
  return {
    categories: ["Combat", "Technical", "Physical", "Social", "Knowledge", "Space Operations"],
    skills: [
      // Include a minimal set of skills here as fallback
      { id: "hand-to-hand", name: "Hand-to-hand", category: "Combat", complex: false },
      { id: "small-arms", name: "Small Arms", category: "Combat", complex: false },
      { id: "exo-pilot", name: "Exo Pilot", category: "Space Operations", complex: true }
    ]
  };
}

// Function to initialize skills with levels for a new character
function initializeCharacterSkills(skillsData) {
  return skillsData.skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    complex: skill.complex,
    level: 0,
    specialization: null
  }));
}

// Calculate the cost of a skill based on level and complexity
function calculateSkillCost(skill, skillCosts, complexMultiplier) {
  if (skill.level === 0) return 0;
  
  const baseCost = skillCosts[skill.level] || 0;
  return skill.complex ? baseCost * complexMultiplier : baseCost;
}

// Calculate total skill points used
function calculateTotalSkillPoints(characterSkills, skillCosts, complexMultiplier) {
  return characterSkills.reduce((total, skill) => {
    return total + calculateSkillCost(skill, skillCosts, complexMultiplier);
  }, 0);
}

// Filter skills by category
function filterSkillsByCategory(characterSkills, category) {
  if (!category || category === "All") return characterSkills;
  return characterSkills.filter(skill => skill.category === category);
}

// Search skills by name
function searchSkills(characterSkills, searchTerm) {
  if (!searchTerm) return characterSkills;
  
  const term = searchTerm.toLowerCase();
  return characterSkills.filter(skill => 
    skill.name.toLowerCase().includes(term)
  );
}

// Add a specialization to a skill
function addSpecialization(characterSkills, skillId, specializationName) {
  return characterSkills.map(skill => {
    if (skill.id === skillId) {
      return { ...skill, specialization: specializationName };
    }
    return skill;
  });
}

// Increase skill level with validation
function increaseSkillLevel(characterSkills, skillId, maxLevel, maxPoints, skillCosts, complexMultiplier) {
  // Deep copy the skills array
  const updatedSkills = JSON.parse(JSON.stringify(characterSkills));
  
  // Find the skill to update
  const skillIndex = updatedSkills.findIndex(s => s.id === skillId);
  if (skillIndex === -1) return { success: false, message: "Skill not found", skills: characterSkills };
  
  const skill = updatedSkills[skillIndex];
  
  // Check if skill is already at max level
  if (skill.level >= maxLevel) {
    return { 
      success: false, 
      message: `${skill.name} is already at maximum level (${maxLevel})`, 
      skills: characterSkills 
    };
  }
  
  // Calculate current total points
  const currentTotal = calculateTotalSkillPoints(updatedSkills, skillCosts, complexMultiplier);
  
  // Calculate new level and cost
  const newLevel = skill.level + 1;
  const oldCost = calculateSkillCost(skill, skillCosts, complexMultiplier);
  
  skill.level = newLevel;
  
  const newCost = calculateSkillCost(skill, skillCosts, complexMultiplier);
  const additionalCost = newCost - oldCost;
  
  // Check if we have enough points
  if (currentTotal + additionalCost > maxPoints) {
    return { 
      success: false, 
      message: `Not enough skill points to increase ${skill.name}`, 
      skills: characterSkills 
    };
  }
  
  return { 
    success: true, 
    message: `${skill.name} increased to level ${newLevel}`, 
    skills: updatedSkills 
  };
}

// Decrease skill level
function decreaseSkillLevel(characterSkills, skillId, skillCosts, complexMultiplier) {
  // Deep copy the skills array
  const updatedSkills = JSON.parse(JSON.stringify(characterSkills));
  
  // Find the skill to update
  const skillIndex = updatedSkills.findIndex(s => s.id === skillId);
  if (skillIndex === -1) return { success: false, message: "Skill not found", skills: characterSkills };
  
  const skill = updatedSkills[skillIndex];
  
  // Check if skill is already at minimum level
  if (skill.level <= 0) {
    return { 
      success: false, 
      message: `${skill.name} is already at minimum level`, 
      skills: characterSkills 
    };
  }
  
  // Decrease level
  skill.level -= 1;
  
  return { 
    success: true, 
    message: `${skill.name} decreased to level ${skill.level}`, 
    skills: updatedSkills 
  };
}

// Export the functions
export {
  loadSkillsData,
  initializeCharacterSkills,
  calculateSkillCost,
  calculateTotalSkillPoints,
  filterSkillsByCategory,
  searchSkills,
  addSpecialization,
  increaseSkillLevel,
  decreaseSkillLevel
};