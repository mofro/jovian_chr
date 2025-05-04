// secondaryTraitsManager.js - Manages secondary traits calculations

/**
 * SecondaryTraitsManager Class
 * Handles secondary traits calculations and logic
 */
export default class SecondaryTraitsManager {
    /**
     * Initialize the SecondaryTraitsManager
     * @param {Object} config - Configuration object
     * @param {function} config.onUpdate - Callback function when traits change
     */
    constructor(config = {}) {
        this.onUpdate = config.onUpdate || function() {};
        this.secondaryTraits = {};
        this.armorPoints = 0;
    }

    /**
     * Calculate secondary traits based on attributes and skills
     * @param {Object} attributes - Character attributes object
     * @param {Object} skills - Character skills object
     * @returns {Object} Secondary traits
     */
    calculateSecondaryTraits(attributes, skills = {}) {
        // Return empty object if attributes are not provided
        if (!attributes) {
            console.warn('Cannot calculate secondary traits: Missing attribute data');
            return {};
        }
        
        // Create secondary traits object
        const traits = {};
        
        // Use safe attribute access with default values
        const safeGet = (obj, key, defaultValue = 0) => {
            return obj && typeof obj[key] !== 'undefined' ? obj[key] : defaultValue;
        };
        
        // Calculate Strength: (Build + Fitness) / 2, rounded towards zero
        traits.STR = Math.trunc((safeGet(attributes, 'BLD') + safeGet(attributes, 'FIT')) / 2);
        
        // Calculate Health: (Fitness + Psyche + Willpower) / 3, rounded to nearest integer
        traits.HLT = Math.round(
            (safeGet(attributes, 'FIT') + safeGet(attributes, 'PSY') + safeGet(attributes, 'WIL')) / 3
        );
        
        // Calculate Stamina: (5 × (Build + Health)) + 25, minimum 1
        traits.STA = Math.max(1, (5 * (safeGet(attributes, 'BLD') + traits.HLT)) + 25);
        
        // Get Hand-to-Hand skill level if available
        let handToHandLevel = 0;
        if (skills && skills.handToHand) {
            handToHandLevel = safeGet(skills.handToHand, 'level');
        }
        
        // Calculate Unarmed Damage: 3 + Strength + Build + Hand-to-Hand Skill level, minimum 1
        traits.UD = Math.max(1, 3 + traits.STR + safeGet(attributes, 'BLD') + handToHandLevel);
        
        // Get Melee skill level if available
        let meleeLevel = 0;
        if (skills && skills.melee) {
            meleeLevel = safeGet(skills.melee, 'level');
        }
        
        // Calculate Armed Damage: 3 + Strength + Build + Melee Skill level, minimum 1
        traits.AD = Math.max(1, 3 + traits.STR + safeGet(attributes, 'BLD') + meleeLevel);
        
        // Calculate Wound Thresholds
        traits.fleshWound = Math.ceil(traits.STA / 2);
        traits.deepWound = traits.STA;
        traits.instantDeath = traits.STA * 2;
        
        // Apply armor to thresholds if any
        if (this.armorPoints > 0) {
            traits.fleshWoundArmored = traits.fleshWound + this.armorPoints;
            traits.deepWoundArmored = traits.deepWound + this.armorPoints;
            traits.instantDeathArmored = traits.instantDeath + this.armorPoints;
        }
        
        // Calculate System Shock: 5 + Health, minimum 1
        traits.systemShock = Math.max(1, 5 + traits.HLT);
        
        return traits;
    }

    /**
     * Set armor points that will affect thresholds
     * @param {number} armorPoints - Armor points to add to thresholds
     */
    setArmorPoints(armorPoints) {
        this.armorPoints = armorPoints || 0;
        this.onUpdate();
    }

    /**
     * Get the current secondary traits
     * @returns {Object} Secondary traits
     */
    getSecondaryTraits() {
        return this.secondaryTraits;
    }

    /**
     * Get the armor points
     * @returns {number} Armor points
     */
    getArmorPoints() {
        return this.armorPoints;
    }

    /**
     * Update secondary traits with provided data
     * @param {Object} traitsData - Secondary traits data
     */
    setSecondaryTraitsFromData(traitsData) {
        if (!traitsData) return;
        
        this.secondaryTraits = { ...traitsData };
        this.onUpdate();
    }
}
