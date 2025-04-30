// skillManager.js - Module for handling skills, perks, and flaws in the Jovian Chronicles character creator

// Constants for skill costs
const SKILL_LEVEL_COSTS = {
  1: 1,
  2: 4,
  3: 9,
  4: 16,
  5: 25,
  6: 36,
  7: 49,
  8: 64,
  9: 81,
  10: 100
};

const SKILL_COMPLEXITY_COSTS = {
  1: 0, // First level is free
  2: 4,
  3: 9,
  4: 16,
  5: 25
};

const SPECIALIZATION_COST = 5;

/**
 * Class to manage skills, perks, and flaws for a character
 */
class SkillManager {
  constructor(skillsData, perksFlawsData, maxSkillPoints) {
    this.skillsData = skillsData;
    this.perksFlawsData = perksFlawsData;
    this.maxSkillPoints = maxSkillPoints;
    this.usedSkillPoints = 0;
    
    // Character's selected skills, perks, and flaws
    this.characterSkills = [];
    this.characterPerks = [];
    this.characterFlaws = [];
    
    // Initialize skills from data
    this.initializeSkills();
  }
  
  /**
   * Initialize character skills from the skills data
   */
  initializeSkills() {
    this.characterSkills = this.skillsData.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      complex: skill.complex,
      level: 0,
      complexity: 1, // All skills start with complexity 1 for free
      specializations: []
    }));
  }
  
  /**
   * Get a skill by ID
   * @param {string} skillId - The ID of the skill to retrieve
   * @returns {Object} The skill object
   */
  getSkill(skillId) {
    return this.characterSkills.find(skill => skill.id === skillId);
  }
  
  /**
   * Get the original skill data by ID
   * @param {string} skillId - The ID of the skill to retrieve
   * @returns {Object} The original skill data
   */
  getSkillData(skillId) {
    return this.skillsData.skills.find(skill => skill.id === skillId);
  }
  
  /**
   * Calculate the cost of a skill based on level and complexity
   * @param {Object} skill - The skill object
   * @returns {number} The total cost of the skill
   */
  calculateSkillCost(skill) {
    let levelCost = 0;
    let complexityCost = 0;
    let specializationCost = 0;
    
    // Calculate level cost
    if (skill.level > 0) {
      levelCost = skill.complex 
        ? SKILL_LEVEL_COSTS[skill.level] * 2 // Complex skills cost twice as much
        : SKILL_LEVEL_COSTS[skill.level];
    }
    
    // Calculate complexity cost (complexity 1 is free)
    if (skill.complexity > 1) {
      complexityCost = SKILL_COMPLEXITY_COSTS[skill.complexity];
    }
    
    // Calculate specialization cost
    specializationCost = skill.specializations.length * SPECIALIZATION_COST;
    
    return levelCost + complexityCost + specializationCost;
  }
  
  /**
   * Calculate total skill points used
   * @returns {number} Total skill points used
   */
  calculateTotalSkillPoints() {
    let total = 0;
    
    // Add skill costs
    this.characterSkills.forEach(skill => {
      total += this.calculateSkillCost(skill);
    });
    
    // Add perk costs
    this.characterPerks.forEach(perk => {
      total += this.getPerkCost(perk);
    });
    
    // Subtract flaw values
    this.characterFlaws.forEach(flaw => {
      total -= this.getFlawValue(flaw);
    });
    
    return total;
  }
  
  /**
   * Get the cost of a perk
   * @param {Object} perk - The perk object
   * @returns {number} The cost of the perk
   */
  getPerkCost(perk) {
    const perkData = this.perksFlawsData.perks.find(p => p.id === perk.id);
    if (!perkData) return 0;
    
    // Handle perks with fixed costs
    if (typeof perkData.cost === 'number') {
      return perkData.cost;
    }
    
    // Handle perks with variable costs
    if (typeof perkData.cost === 'object') {
      return perkData.cost[perk.level] || 0;
    }
    
    return 0;
  }
  
  /**
   * Get the value of a flaw
   * @param {Object} flaw - The flaw object
   * @returns {number} The value of the flaw (positive number)
   */
  getFlawValue(flaw) {
    const flawData = this.perksFlawsData.flaws.find(f => f.id === flaw.id);
    if (!flawData) return 0;
    
    // Handle flaws with fixed values
    if (typeof flawData.value === 'number') {
      return Math.abs(flawData.value); // Return absolute value
    }
    
    // Handle flaws with variable values
    if (typeof flawData.value === 'object') {
      return Math.abs(flawData.value[flaw.level] || 0);
    }
    
    return 0;
  }
  
  /**
   * Increase skill level
   * @param {string} skillId - The ID of the skill to increase
   * @returns {Object} Result of the operation
   */
  increaseSkillLevel(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return { success: false, message: "Skill not found" };
    }
    
    // Check if already at max level
    if (skill.level >= 10) {
      return { success: false, message: `${skill.name} is already at maximum level` };
    }
    
    const nextLevel = skill.level + 1;
    
    // Calculate current and next cost
    const currentCost = this.calculateSkillCost(skill);
    skill.level = nextLevel;
    const newCost = this.calculateSkillCost(skill);
    const additionalCost = newCost - currentCost;
    
    // Check if we have enough skill points
    const totalAfterChange = this.calculateTotalSkillPoints();
    if (totalAfterChange > this.maxSkillPoints) {
      // Revert change
      skill.level = nextLevel - 1;
      return { 
        success: false, 
        message: `Not enough skill points to increase ${skill.name} to level ${nextLevel}`
      };
    }
    
    this.usedSkillPoints = totalAfterChange;
    return { 
      success: true, 
      message: `${skill.name} increased to level ${nextLevel}`,
      cost: additionalCost 
    };
  }
  
  /**
   * Decrease skill level
   * @param {string} skillId - The ID of the skill to decrease
   * @returns {Object} Result of the operation
   */
  decreaseSkillLevel(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return { success: false, message: "Skill not found" };
    }
    
    // Check if already at minimum level
    if (skill.level <= 0) {
      return { success: false, message: `${skill.name} is already at minimum level` };
    }
    
    // Calculate current and next cost
    const currentCost = this.calculateSkillCost(skill);
    skill.level -= 1;
    const newCost = this.calculateSkillCost(skill);
    const costReduction = currentCost - newCost;
    
    this.usedSkillPoints = this.calculateTotalSkillPoints();
    return { 
      success: true, 
      message: `${skill.name} decreased to level ${skill.level}`,
      cost: -costReduction 
    };
  }
  
  /**
   * Increase skill complexity
   * @param {string} skillId - The ID of the skill to modify
   * @returns {Object} Result of the operation
   */
  increaseSkillComplexity(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return { success: false, message: "Skill not found" };
    }
    
    // Check if already at max complexity
    if (skill.complexity >= 5) {
      return { success: false, message: `${skill.name} is already at maximum complexity` };
    }
    
    const nextComplexity = skill.complexity + 1;
    
    // Calculate current and next cost
    const currentCost = this.calculateSkillCost(skill);
    skill.complexity = nextComplexity;
    const newCost = this.calculateSkillCost(skill);
    const additionalCost = newCost - currentCost;
    
    // Check if we have enough skill points
    const totalAfterChange = this.calculateTotalSkillPoints();
    if (totalAfterChange > this.maxSkillPoints) {
      // Revert change
      skill.complexity = nextComplexity - 1;
      return { 
        success: false, 
        message: `Not enough skill points to increase ${skill.name} to complexity ${nextComplexity}`
      };
    }
    
    this.usedSkillPoints = totalAfterChange;
    return { 
      success: true, 
      message: `${skill.name} increased to complexity ${nextComplexity}`,
      cost: additionalCost 
    };
  }
  
  /**
   * Decrease skill complexity
   * @param {string} skillId - The ID of the skill to modify
   * @returns {Object} Result of the operation
   */
  decreaseSkillComplexity(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return { success: false, message: "Skill not found" };
    }
    
    // Check if already at minimum complexity (1 is the minimum)
    if (skill.complexity <= 1) {
      return { success: false, message: `${skill.name} is already at minimum complexity` };
    }
    
    // Calculate current and next cost
    const currentCost = this.calculateSkillCost(skill);
    skill.complexity -= 1;
    const newCost = this.calculateSkillCost(skill);
    const costReduction = currentCost - newCost;
    
    this.usedSkillPoints = this.calculateTotalSkillPoints();
    return { 
      success: true, 
      message: `${skill.name} decreased to complexity ${skill.complexity}`,
      cost: -costReduction 
    };
  }
  
  /**
   * Add a specialization to a skill
   * @param {string} skillId - The ID of the skill
   * @param {string} specialization - The specialization to add
   * @returns {Object} Result of the operation
   */
  addSpecialization(skillId, specialization) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return { success: false, message: "Skill not found" };
    }
    
    // Check if specialization already exists
    if (skill.specializations.includes(specialization)) {
      return { success: false, message: `${skill.name} already has the ${specialization} specialization` };
    }
    
    // Calculate cost before and after adding specialization
    const currentCost = this.calculateSkillCost(skill);
    skill.specializations.push(specialization);
    const newCost = this.calculateSkillCost(skill);
    const additionalCost = newCost - currentCost;
    
    // Check if we have enough skill points
    const totalAfterChange = this.calculateTotalSkillPoints();
    if (totalAfterChange > this.maxSkillPoints) {
      // Revert change
      skill.specializations.pop();
      return { 
        success: false, 
        message: `Not enough skill points to add ${specialization} specialization to ${skill.name}`
      };
    }
    
    this.usedSkillPoints = totalAfterChange;
    return { 
      success: true, 
      message: `Added ${specialization} specialization to ${skill.name}`,
      cost: additionalCost 
    };
  }
  
  /**
   * Remove a specialization from a skill
   * @param {string} skillId - The ID of the skill
   * @param {string} specialization - The specialization to remove
   * @returns {Object} Result of the operation
   */
  removeSpecialization(skillId, specialization) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return { success: false, message: "Skill not found" };
    }
    
    // Check if specialization exists
    const specIndex = skill.specializations.indexOf(specialization);
    if (specIndex === -1) {
      return { success: false, message: `${skill.name} doesn't have the ${specialization} specialization` };
    }
    
    // Calculate cost before and after removing specialization
    const currentCost = this.calculateSkillCost(skill);
    skill.specializations.splice(specIndex, 1);
    const newCost = this.calculateSkillCost(skill);
    const costReduction = currentCost - newCost;
    
    this.usedSkillPoints = this.calculateTotalSkillPoints();
    return { 
      success: true, 
      message: `Removed ${specialization} specialization from ${skill.name}`,
      cost: -costReduction 
    };
  }
  
  /**
   * Add a perk to the character
   * @param {string} perkId - The ID of the perk
   * @param {string} level - The level or type of the perk (for variable cost perks)
   * @returns {Object} Result of the operation
   */
  addPerk(perkId, level = null) {
    const perkData = this.perksFlawsData.perks.find(p => p.id === perkId);
    if (!perkData) {
      return { success: false, message: "Perk not found" };
    }
    
    // Check if perk already exists
    if (this.characterPerks.some(p => p.id === perkId)) {
      return { success: false, message: `Character already has the ${perkData.name} perk` };
    }
    
    const perk = {
      id: perkId,
      name: perkData.name,
      level: level
    };
    
    // Calculate cost
    const perkCost = this.getPerkCost(perk);
    
    // Add perk and check if we have enough skill points
    this.characterPerks.push(perk);
    const totalAfterChange = this.calculateTotalSkillPoints();
    if (totalAfterChange > this.maxSkillPoints) {
      // Revert change
      this.characterPerks.pop();
      return { 
        success: false, 
        message: `Not enough skill points to add ${perkData.name}`
      };
    }
    
    this.usedSkillPoints = totalAfterChange;
    return { 
      success: true, 
      message: `Added ${perkData.name} perk`,
      cost: perkCost 
    };
  }
  
  /**
   * Remove a perk from the character
   * @param {string} perkId - The ID of the perk
   * @returns {Object} Result of the operation
   */
  removePerk(perkId) {
    const perkIndex = this.characterPerks.findIndex(p => p.id === perkId);
    if (perkIndex === -1) {
      return { success: false, message: "Character doesn't have this perk" };
    }
    
    const perk = this.characterPerks[perkIndex];
    const perkCost = this.getPerkCost(perk);
    
    // Remove perk
    this.characterPerks.splice(perkIndex, 1);
    this.usedSkillPoints = this.calculateTotalSkillPoints();
    
    return { 
      success: true, 
      message: `Removed ${perk.name} perk`,
      cost: -perkCost 
    };
  }
  
  /**
   * Add a flaw to the character
   * @param {string} flawId - The ID of the flaw
   * @param {string} level - The level or type of the flaw (for variable value flaws)
   * @returns {Object} Result of the operation
   */
  addFlaw(flawId, level = null) {
    const flawData = this.perksFlawsData.flaws.find(f => f.id === flawId);
    if (!flawData) {
      return { success: false, message: "Flaw not found" };
    }
    
    // Check if flaw already exists
    if (this.characterFlaws.some(f => f.id === flawId)) {
      return { success: false, message: `Character already has the ${flawData.name} flaw` };
    }
    
    const flaw = {
      id: flawId,
      name: flawData.name,
      level: level
    };
    
    // Calculate value
    const flawValue = this.getFlawValue(flaw);
    
    // Add flaw
    this.characterFlaws.push(flaw);
    this.usedSkillPoints = this.calculateTotalSkillPoints();
    
    return { 
      success: true, 
      message: `Added ${flawData.name} flaw`,
      value: flawValue 
    };
  }
  
  /**
   * Remove a flaw from the character
   * @param {string} flawId - The ID of the flaw
   * @returns {Object} Result of the operation
   */
  removeFlaw(flawId) {
    const flawIndex = this.characterFlaws.findIndex(f => f.id === flawId);
    if (flawIndex === -1) {
      return { success: false, message: "Character doesn't have this flaw" };
    }
    
    const flaw = this.characterFlaws[flawIndex];
    const flawValue = this.getFlawValue(flaw);
    
    // Remove flaw and check if we have enough skill points
    this.characterFlaws.splice(flawIndex, 1);
    const totalAfterChange = this.calculateTotalSkillPoints();
    if (totalAfterChange > this.maxSkillPoints) {
      // Revert change
      this.characterFlaws.splice(flawIndex, 0, flaw);
      return { 
        success: false, 
        message: `Removing ${flaw.name} would exceed skill point limit`
      };
    }
    
    this.usedSkillPoints = totalAfterChange;
    return { 
      success: true, 
      message: `Removed ${flaw.name} flaw`,
      value: -flawValue 
    };
  }
  
  /**
   * Get all character skills filtered by category
   * @param {string} category - The category to filter by (optional)
   * @returns {Array} Filtered skill list
   */
  getSkillsByCategory(category = null) {
    if (!category) {
      return this.characterSkills;
    }
    
    return this.characterSkills.filter(skill => {
      const skillData = this.getSkillData(skill.id);
      return skillData && skillData.category === category;
    });
  }
  
  /**
   * Export character skills, perks, and flaws for saving
   * @returns {Object} Character skills, perks, and flaws data
   */
  exportData() {
    return {
      skills: this.characterSkills,
      perks: this.characterPerks,
      flaws: this.characterFlaws,
      usedSkillPoints: this.usedSkillPoints,
      maxSkillPoints: this.maxSkillPoints
    };
  }
  
  /**
   * Import character skills, perks, and flaws from saved data
   * @param {Object} data - The data to import
   */
  importData(data) {
    if (data.skills) this.characterSkills = data.skills;
    if (data.perks) this.characterPerks = data.perks;
    if (data.flaws) this.characterFlaws = data.flaws;
    if (data.maxSkillPoints) this.maxSkillPoints = data.maxSkillPoints;
    
    // Recalculate used skill points
    this.usedSkillPoints = this.calculateTotalSkillPoints();
  }
}

// Export the SkillManager class
export default SkillManager;