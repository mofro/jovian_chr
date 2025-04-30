// attributeManager.js - Manages attributes data and operations

/**
 * Attribute Manager Class
 * Handles attribute data, calculations, and operations
 */
export default class AttributeManager {
    /**
     * Initialize the AttributeManager
     * @param {Object} config - Configuration object
     * @param {number} config.maxCharacterPoints - Maximum character points available
     * @param {function} config.onUpdate - Callback function when attributes change
     */
    constructor(config = {}) {
        // Set default values
        this.maxCharacterPoints = config.maxCharacterPoints || 30; // Default for Adventurous games
        this.usedCharacterPoints = 0;
        this.onUpdate = config.onUpdate || function() {};
        
        // Define attribute ranges
        this.normalRange = { min: -3, max: 3 };
        this.buildRange = { min: -5, max: 5 };
        
        // Define attributes with their details
        this.attributes = {
            AGI: {
                name: "Agility",
                abbr: "AGI",
                value: 0,
                description: "Physical coordination and dexterity",
                category: "physical",
                range: this.normalRange,
                tooltip: "Measures hand-eye coordination, nimbleness and reflexes. Important for pilots, bodyguards, and similar action-oriented characters."
            },
            APP: {
                name: "Appearance",
                abbr: "APP",
                value: 0,
                description: "Physical attractiveness and presence",
                category: "social",
                range: this.normalRange,
                tooltip: "Rates physical attractiveness and can modify how others react to the character."
            },
            BLD: {
                name: "Build",
                abbr: "BLD",
                value: 0,
                description: "Physical size and mass",
                category: "physical",
                range: this.buildRange,
                tooltip: "A rating of size and body frame, not physical might. This is the only attribute with a -5 to +5 range."
            },
            CRE: {
                name: "Creativity",
                abbr: "CRE",
                value: 0,
                description: "Mental agility and problem-solving",
                category: "mental",
                range: this.normalRange,
                tooltip: "Measures ability to use the mind innovatively and think on one's feet. Useful for characters facing unfamiliar situations."
            },
            FIT: {
                name: "Fitness",
                abbr: "FIT",
                value: 0,
                description: "Physical conditioning and endurance",
                category: "physical",
                range: this.normalRange,
                tooltip: "Rates flexibility, cardiovascular endurance, resistance to effort and overall muscle tone."
            },
            INF: {
                name: "Influence",
                abbr: "INF",
                value: 0,
                description: "Leadership and persuasiveness",
                category: "social",
                range: this.normalRange,
                tooltip: "Measures charm, wit and persuasiveness. Essential for leaders and social characters."
            },
            KNO: {
                name: "Knowledge",
                abbr: "KNO",
                value: 0,
                description: "Education and memory",
                category: "mental",
                range: this.normalRange,
                tooltip: "Ability to learn and recall information, and reflects years of education successfully completed."
            },
            PER: {
                name: "Perception",
                abbr: "PER",
                value: 0,
                description: "Awareness of surroundings",
                category: "mental",
                range: this.normalRange,
                tooltip: "Attentiveness to detail and overall alertness. Crucial for scouts and investigators."
            },
            PSY: {
                name: "Psyche",
                abbr: "PSY",
                value: 0,
                description: "Mental stability and empathy",
                category: "psychological",
                range: this.normalRange,
                tooltip: "Abstract measure of karma, happiness, sensitivity and empathy. Reflects how 'in tune' the character is with emotions."
            },
            WIL: {
                name: "Willpower",
                abbr: "WIL",
                value: 0,
                description: "Mental fortitude and determination",
                category: "psychological",
                range: this.normalRange,
                tooltip: "Rating of self-discipline, determination and pain threshold. Important for characters who need to endure hardship."
            }
        };

        // Attribute point costs table
        this.attributeCosts = {
            3: 16,  // +3 costs 16 points
            2: 9,   // +2 costs 9 points
            1: 4,   // +1 costs 4 points
            0: 1,   // 0 costs 1 point
            "-1": 0,   // -1 gives 0 points back
            "-2": -1,  // -2 gives 1 point back
            "-3": -4,  // -3 gives 4 points back
            "-4": -9,  // -4 gives 9 points back
            "-5": -16  // -5 gives 16 points back
        };

        // Calculate initial used character points
        this.recalculatePoints();
    }

    /**
     * Get all attributes data
     * @returns {Object} The attributes object
     */
    getAttributes() {
        return this.attributes;
    }

    /**
     * Get a specific attribute data
     * @param {string} attr - Attribute code (e.g., 'AGI')
     * @returns {Object} The attribute object
     */
    getAttribute(attr) {
        return this.attributes[attr];
    }

    /**
     * Get used and maximum character points
     * @returns {Object} Object containing used and max character points
     */
    getCharacterPoints() {
        return {
            used: this.usedCharacterPoints,
            max: this.maxCharacterPoints
        };
    }

    /**
     * Set a specific attribute value
     * @param {string} attr - Attribute code (e.g., 'AGI')
     * @param {number} value - New value for the attribute
     * @returns {boolean} True if successful, false otherwise
     */
    setAttribute(attr, value) {
        // Check if attribute exists
        if (!this.attributes[attr]) {
            console.error(`Attribute ${attr} does not exist`);
            return false;
        }

        // Check if value is within range
        const range = this.attributes[attr].range;
        if (value < range.min || value > range.max) {
            console.error(`Value ${value} is outside valid range for ${attr}`);
            return false;
        }

        // Calculate point cost difference
        const oldValue = this.attributes[attr].value;
        const oldCost = this.getAttributeCost(oldValue);
        const newCost = this.getAttributeCost(value);
        const costDifference = newCost - oldCost;

        // Check if we have enough points for the increase
        if (this.usedCharacterPoints + costDifference > this.maxCharacterPoints) {
            console.error('Not enough character points available');
            return false;
        }

        // Update attribute and recalculate
        this.attributes[attr].value = value;
        this.recalculatePoints();
        this.onUpdate();
        return true;
    }

    /**
     * Increase an attribute by 1
     * @param {string} attr - Attribute code (e.g., 'AGI')
     * @returns {boolean} True if successful, false otherwise
     */
    increaseAttribute(attr) {
        const currentValue = this.attributes[attr].value;
        const maxValue = this.attributes[attr].range.max;
        
        if (currentValue < maxValue) {
            return this.setAttribute(attr, currentValue + 1);
        }
        return false;
    }

    /**
     * Decrease an attribute by 1
     * @param {string} attr - Attribute code (e.g., 'AGI')
     * @returns {boolean} True if successful, false otherwise
     */
    decreaseAttribute(attr) {
        const currentValue = this.attributes[attr].value;
        const minValue = this.attributes[attr].range.min;
        
        if (currentValue > minValue) {
            return this.setAttribute(attr, currentValue - 1);
        }
        return false;
    }

    /**
     * Calculate the cost of an attribute value
     * @param {number} value - Attribute value
     * @returns {number} Cost in character points
     */
    getAttributeCost(value) {
        return this.attributeCosts[value] || 0;
    }

    /**
     * Recalculate total used character points
     */
    recalculatePoints() {
        let total = 0;
        
        // Sum up costs for all attributes
        for (const attr in this.attributes) {
            const value = this.attributes[attr].value;
            const cost = this.getAttributeCost(value);
            total += cost;
        }
        
        this.usedCharacterPoints = total;
    }

    /**
     * Calculate secondary attributes based on primary attributes
     * @param {Object} skills - Character skills object (optional)
     * @returns {Object} Secondary attributes
     */
    calculateSecondaryAttributes(skills = {}) {
        const attrs = this.attributes;
        const secondaryAttributes = {};
        
        // Strength = (Build + Fitness) / 2, rounded towards zero
        secondaryAttributes.STR = Math.trunc((attrs.BLD.value + attrs.FIT.value) / 2);
        
        // Health = (Fitness + Psyche + Willpower) / 3, rounded to nearest integer
        secondaryAttributes.HLT = Math.round((attrs.FIT.value + attrs.PSY.value + attrs.WIL.value) / 3);
        
        // Stamina = (5 × (Build + Health)) + 25, minimum 1
        secondaryAttributes.STA = Math.max(1, (5 * (attrs.BLD.value + secondaryAttributes.HLT)) + 25);
        
        // Get Hand-to-Hand skill level if available
        let handToHandLevel = 0;
        if (skills.handToHand) {
            handToHandLevel = skills.handToHand.level || 0;
        }
        
        // Unarmed Damage = 3 + Strength + Build + Hand-to-Hand Skill level, minimum 1
        secondaryAttributes.UD = Math.max(1, 3 + secondaryAttributes.STR + attrs.BLD.value + handToHandLevel);
        
        // Get Melee skill level if available
        let meleeLevel = 0;
        if (skills.melee) {
            meleeLevel = skills.melee.level || 0;
        }
        
        // Armed Damage = 3 + Strength + Build + Melee Skill level, minimum 1
        secondaryAttributes.AD = Math.max(1, 3 + secondaryAttributes.STR + attrs.BLD.value + meleeLevel);
        
        // Calculate Wound Thresholds
        secondaryAttributes.fleshWound = Math.ceil(secondaryAttributes.STA / 2);
        secondaryAttributes.deepWound = secondaryAttributes.STA;
        secondaryAttributes.instantDeath = secondaryAttributes.STA * 2;
        
        // System Shock = 5 + Health, minimum 1
        secondaryAttributes.systemShock = Math.max(1, 5 + secondaryAttributes.HLT);
        
        return secondaryAttributes;
    }

    /**
     * Reset all attributes to default values
     */
    resetAttributes() {
        // Reset each attribute to 0
        for (const attr in this.attributes) {
            this.attributes[attr].value = 0;
        }
        
        // Recalculate points
        this.recalculatePoints();
        this.onUpdate();
    }

    /**
     * Set attribute values from a provided object
     * @param {Object} attributesData - Object with attribute codes as keys and values
     */
    setAttributesFromData(attributesData) {
        if (!attributesData) return;
        
        for (const attr in attributesData) {
            if (this.attributes[attr]) {
                this.attributes[attr].value = attributesData[attr];
            }
        }
        
        this.recalculatePoints();
        this.onUpdate();
    }

    /**
     * Get all attribute values as a simple object
     * @returns {Object} Object with attribute codes as keys and values
     */
    getAttributeValues() {
        const values = {};
        
        for (const attr in this.attributes) {
            values[attr] = this.attributes[attr].value;
        }
        
        return values;
    }

    /**
     * Update the maximum character points
     * @param {number} max - New maximum character points
     */
    setMaxCharacterPoints(max) {
        this.maxCharacterPoints = max;
        this.onUpdate();
    }
}
