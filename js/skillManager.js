/**
 * File: js/skillManager.js
 * Data management for skills in the Jovian Chronicles Character Creator
 */

/**
 * SkillManager Class
 * Handles the data and logic for skills management
 */
export default class SkillManager {
    /**
     * Initialize the SkillManager
     * @param {Object} skillsData - Skills data
     * @param {Object} perksFlawsData - Perks and flaws data
     * @param {number} maxSkillPoints - Maximum skill points
     */
    constructor(skillsData, perksFlawsData, maxSkillPoints) {
        this.skillsData = skillsData;
        this.perksFlawsData = perksFlawsData;
        this.maxSkillPoints = maxSkillPoints || 50; // Default to adventurous game
        
        // Initialize character skills from the skills data
        this.characterSkills = this.initializeCharacterSkills();
    }

    /**
     * Initialize character skills from skills data
     * @returns {Array} Initialized character skills
     */
    initializeCharacterSkills() {
        // Ensure we have skills data
        if (!this.skillsData || !this.skillsData.skills || !Array.isArray(this.skillsData.skills)) {
            console.error('Invalid skills data');
            return [];
        }
        
        // Create character skills from skills data
        return this.skillsData.skills.map(skill => ({
            id: skill.id,
            name: skill.name,
            category: skill.category,
            description: skill.description,
            complex: skill.complex || false,
            level: 0,
            complexity: 1, // All skills start with complexity 1 for free
            specializations: [],
            cost: 0, // Initial cost is 0
            relatedAttributes: skill.relatedAttributes || []
        }));
    }

    /**
     * Get the list of skill categories
     * @returns {Array} List of categories
     */
    getCategories() {
        if (!this.skillsData || !this.skillsData.categories) {
            return [];
        }
        
        return [...this.skillsData.categories];
    }

    /**
     * Get all character skills
     * @returns {Array} Character skills
     */
    getCharacterSkills() {
        return [...this.characterSkills];
    }

    /**
     * Set character skills (used when loading a character)
     * @param {Array} skills - Character skills
     */
    setCharacterSkills(skills) {
        if (!Array.isArray(skills)) {
            console.error('Invalid skills array');
            return;
        }
        
        // Reset all skills
        this.characterSkills = this.initializeCharacterSkills();
        
        // Update with the provided skills
        skills.forEach(loadedSkill => {
            const skillIndex = this.characterSkills.findIndex(s => s.id === loadedSkill.id);
            if (skillIndex !== -1) {
                this.characterSkills[skillIndex].level = loadedSkill.level || 0;
                this.characterSkills[skillIndex].complexity = loadedSkill.complexity || 1;
                this.characterSkills[skillIndex].specializations = loadedSkill.specializations || [];
                
                // Recalculate cost
                this.characterSkills[skillIndex].cost = this.calculateSkillCost(this.characterSkills[skillIndex]);
            }
        });
    }

    /**
     * Filter skills by category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered skills
     */
    filterSkillsByCategory(category) {
        if (!category || category === 'all') {
            return this.characterSkills;
        }
        
        return this.characterSkills.filter(skill => 
            skill.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Search skills by name or description
     * @param {string} query - Search query
     * @returns {Array} Filtered skills
     */
    searchSkills(query) {
        if (!query) {
            return this.characterSkills;
        }
        
        const lowerQuery = query.toLowerCase();
        return this.characterSkills.filter(skill => 
            skill.name.toLowerCase().includes(lowerQuery) || 
            (skill.description && skill.description.toLowerCase().includes(lowerQuery)) ||
            (skill.category && skill.category.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Calculate the cost of a skill
     * @param {Object} skill - Skill object
     * @returns {number} Skill cost
     */
    calculateSkillCost(skill) {
        // Base skill level costs
        const levelCosts = {
            0: 0,
            1: 1,
            2: 4,
            3: 9,
            4: 16,
            5: 25
        };
        
        // Complexity costs (beyond the free Complexity 1)
        const complexityCosts = {
            1: 0, // Free
            2: 4,
            3: 9,
            4: 16,
            5: 25
        };
        
        // Calculate level cost (complex skills cost double)
        const levelCost = skill.complex ? levelCosts[skill.level] * 2 : levelCosts[skill.level];
        
        // Calculate complexity cost
        const complexityCost = complexityCosts[skill.complexity];
        
        // Calculate specialization cost (5 points each)
        const specializationCost = (skill.specializations?.length || 0) * 5;
        
        // Return total cost
        return levelCost + complexityCost + specializationCost;
    }

    /**
     * Get the total skill points used and maximum
     * @returns {Object} Skill points info
     */
    getSkillPoints() {
        // Calculate total used points
        const used = this.characterSkills.reduce((total, skill) => {
            return total + this.calculateSkillCost(skill);
        }, 0);
        
        return {
            used,
            max: this.maxSkillPoints,
            remaining: this.maxSkillPoints - used
        };
    }

    /**
     * Check if a skill level can be increased
     * @param {string} skillId - Skill ID
     * @returns {boolean} Whether the skill can be increased
     */
    canIncreaseSkillLevel(skillId) {
        const skillIndex = this.characterSkills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) {
            return false;
        }
        
        const skill = this.characterSkills[skillIndex];
        
        // Can't decrease below complexity 1 (which is free)
        if (skill.complexity <= 1) {
            return false;
        }
        
        // Decrease the complexity
        this.characterSkills[skillIndex].complexity--;
        
        // Recalculate cost
        this.characterSkills[skillIndex].cost = this.calculateSkillCost(this.characterSkills[skillIndex]);
        
        return true;
    }

    /**
     * Add a specialization to a skill
     * @param {string} skillId - Skill ID
     * @param {string} specialization - Specialization name
     * @returns {boolean} Whether the addition was successful
     */
    addSpecialization(skillId, specialization) {
        const skillIndex = this.characterSkills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) {
            return false;
        }
        
        const skill = this.characterSkills[skillIndex];
        
        // Check if the specialization already exists
        if (skill.specializations.includes(specialization)) {
            return false;
        }
        
        // Calculate the cost of adding the specialization
        const currentCost = this.calculateSkillCost(skill);
        
        // Create a copy of the skill with the added specialization
        const updatedSkill = { 
            ...skill, 
            specializations: [...skill.specializations, specialization] 
        };
        const updatedCost = this.calculateSkillCost(updatedSkill);
        
        // Calculate additional cost (should be 5 points per specialization)
        const additionalCost = updatedCost - currentCost;
        
        // Get current skill points
        const points = this.getSkillPoints();
        
        // Check if we have enough points
        if (points.remaining < additionalCost) {
            return false;
        }
        
        // Add the specialization
        this.characterSkills[skillIndex].specializations.push(specialization);
        
        // Recalculate cost
        this.characterSkills[skillIndex].cost = this.calculateSkillCost(this.characterSkills[skillIndex]);
        
        return true;
    }

    /**
     * Remove a specialization from a skill
     * @param {string} skillId - Skill ID
     * @param {string} specialization - Specialization name
     * @returns {boolean} Whether the removal was successful
     */
    removeSpecialization(skillId, specialization) {
        const skillIndex = this.characterSkills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) {
            return false;
        }
        
        const skill = this.characterSkills[skillIndex];
        
        // Check if the specialization exists
        const specIndex = skill.specializations.indexOf(specialization);
        if (specIndex === -1) {
            return false;
        }
        
        // Remove the specialization
        this.characterSkills[skillIndex].specializations.splice(specIndex, 1);
        
        // Recalculate cost
        this.characterSkills[skillIndex].cost = this.calculateSkillCost(this.characterSkills[skillIndex]);
        
        return true;
    }

    /**
     * Get skills data needed for secondary traits calculation
     * @returns {Object} Skills data for traits
     */
    getSkillsForTraits() {
        // Find the hand-to-hand and melee skills
        const handToHand = this.characterSkills.find(skill => skill.id === 'hand-to-hand');
        const melee = this.characterSkills.find(skill => skill.id === 'melee');
        
        return {
            handToHandLevel: handToHand ? handToHand.level : 0,
            meleeLevel: melee ? melee.level : 0
        };
    }

    /**
     * Reset all skills to initial state
     */
    resetSkills() {
        this.characterSkills = this.initializeCharacterSkills();
    }
}[skillIndex];
        
        // Can't decrease below 0
        if (skill.level <= 0) {
            return false;
        }
        
        // Decrease the level
        this.characterSkills[skillIndex].level--;
        
        // Recalculate cost
        this.characterSkills[skillIndex].cost = this.calculateSkillCost(this.characterSkills[skillIndex]);
        
        return true;
    }

    /**
     * Check if a skill complexity can be increased
     * @param {string} skillId - Skill ID
     * @returns {boolean} Whether the complexity can be increased
     */
    canIncreaseSkillComplexity(skillId) {
        const skillIndex = this.characterSkills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) {
            return false;
        }
        
        const skill = this.characterSkills[skillIndex];
        
        // Maximum complexity is 5
        if (skill.complexity >= 5) {
            return false;
        }
        
        // Calculate the cost of increasing the complexity
        const currentCost = this.calculateSkillCost(skill);
        
        // Create a copy of the skill with the increased complexity
        const increasedSkill = { ...skill, complexity: skill.complexity + 1 };
        const increasedCost = this.calculateSkillCost(increasedSkill);
        
        // Calculate additional cost
        const additionalCost = increasedCost - currentCost;
        
        // Get current skill points
        const points = this.getSkillPoints();
        
        // Check if we have enough points
        return points.remaining >= additionalCost;
    }

    /**
     * Increase a skill's complexity
     * @param {string} skillId - Skill ID
     * @returns {boolean} Whether the increase was successful
     */
    increaseSkillComplexity(skillId) {
        if (!this.canIncreaseSkillComplexity(skillId)) {
            return false;
        }
        
        const skillIndex = this.characterSkills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) {
            return false;
        }
        
        // Increase the complexity
        this.characterSkills[skillIndex].complexity++;
        
        // Recalculate cost
        this.characterSkills[skillIndex].cost = this.calculateSkillCost(this.characterSkills[skillIndex]);
        
        return true;
    }

    /**
     * Decrease a skill's complexity
     * @param {string} skillId - Skill ID
     * @returns {boolean} Whether the decrease was successful
     */
    decreaseSkillComplexity(skillId) {
        const skillIndex = this.characterSkills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) {
            return false;
        }
        
        const skill = this.characterSkills[skillIndex];
        
        // Maximum skill level is 5
        if (skill.level >= 5) {
            return false;
        }
        
        // Calculate the cost of increasing the level
        const currentCost = this.calculateSkillCost(skill);
        
        // Create a copy of the skill with the increased level
        const increasedSkill = { ...skill, level: skill.level + 1 };
        const increasedCost = this.calculateSkillCost(increasedSkill);
        
        // Calculate additional cost
        const additionalCost = increasedCost - currentCost;
        
        // Get current skill points
        const points = this.getSkillPoints();
        
        // Check if we have enough points
        return points.remaining >= additionalCost;
    }

    /**
     * Increase a skill's level
     * @param {string} skillId - Skill ID
     * @returns {boolean} Whether the increase was successful
     */
    increaseSkillLevel(skillId) {
        if (!this.canIncreaseSkillLevel(skillId)) {
            return false;
        }
        
        const skillIndex = this.characterSkills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) {
            return false;
        }
        
        // Increase the level
        this.characterSkills[skillIndex].level++;
        
        // Recalculate cost
        this.characterSkills[skillIndex].cost = this.calculateSkillCost(this.characterSkills[skillIndex]);
        
        return true;
    }

    /**
     * Decrease a skill's level
     * @param {string} skillId - Skill ID
     * @returns {boolean} Whether the decrease was successful
     */
    decreaseSkillLevel(skillId) {
        const skillIndex = this.characterSkills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) {
            return false;
        }
        
        const skill = this.characterSkills