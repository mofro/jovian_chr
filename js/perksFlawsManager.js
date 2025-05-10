/**
 * File: js/perksFlawsManager.js
 * Data management for perks and flaws in the Jovian Chronicles Character Creator
 */

/**
 * PerksFlawsManager Class
 * Handles the data and logic for perks and flaws management
 */
export default class PerksFlawsManager {
    /**
     * Initialize the PerksFlawsManager
     * @param {Object} perksFlawsData - Perks and flaws data
     * @param {number} maxFlawPoints - Maximum allowed flaw points
     * @param {Function} onUpdate - Callback function when perks/flaws change
     */
    constructor(perksFlawsData, maxFlawPoints = 12, onUpdate = null) {
        this.perksFlawsData = perksFlawsData || { perks: [], flaws: [] };
        this.maxFlawPoints = maxFlawPoints;
        this.onUpdate = onUpdate || function() {};
        
        // Initialize character perks and flaws
        this.characterPerks = [];
        this.characterFlaws = [];
    }

    /**
     * Get all available perks
     * @returns {Array} Available perks
     */
    getAvailablePerks() {
        if (!this.perksFlawsData || !this.perksFlawsData.perks) {
            return [];
        }
        return [...this.perksFlawsData.perks];
    }

    /**
     * Get all available flaws
     * @returns {Array} Available flaws
     */
    getAvailableFlaws() {
        if (!this.perksFlawsData || !this.perksFlawsData.flaws) {
            return [];
        }
        return [...this.perksFlawsData.flaws];
    }

    /**
     * Get all perk categories
     * @returns {Array} Perk categories
     */
    getPerkCategories() {
        if (!this.perksFlawsData || !this.perksFlawsData.perks) {
            return [];
        }
        
        // Extract unique categories
        const categories = new Set();
        this.perksFlawsData.perks.forEach(perk => {
            if (perk.category) {
                categories.add(perk.category);
            }
        });
        
        return [...categories].sort();
    }

    /**
     * Get all flaw categories
     * @returns {Array} Flaw categories
     */
    getFlawCategories() {
        if (!this.perksFlawsData || !this.perksFlawsData.flaws) {
            return [];
        }
        
        // Extract unique categories
        const categories = new Set();
        this.perksFlawsData.flaws.forEach(flaw => {
            if (flaw.category) {
                categories.add(flaw.category);
            }
        });
        
        return [...categories].sort();
    }

    /**
     * Get the character's perks
     * @returns {Array} Character perks
     */
    getCharacterPerks() {
        return [...this.characterPerks];
    }

    /**
     * Get the character's flaws
     * @returns {Array} Character flaws
     */
    getCharacterFlaws() {
        return [...this.characterFlaws];
    }

    /**
     * Set the character's perks and flaws (used when loading a character)
     * @param {Array} perks - Character perks
     * @param {Array} flaws - Character flaws
     */
    setCharacterPerksFlaws(perks, flaws) {
        this.characterPerks = perks ? [...perks] : [];
        this.characterFlaws = flaws ? [...flaws] : [];
        
        // Call onUpdate callback
        if (this.onUpdate) {
            this.onUpdate();
        }
    }

    /**
     * Calculate the total skill points adjustment from perks and flaws
     * @returns {Object} Points adjustment
     */
    calculatePointsAdjustment() {
        // Calculate cost of perks with improved variable cost handling
        const perksCost = this.characterPerks.reduce((total, perk) => {
            let cost = 0;
            
            if (typeof perk.cost === 'object' && perk.cost !== null) {
                // For variable costs, use selectedCost or first available cost
                cost = perk.selectedCost || Object.values(perk.cost)[0] || 0;
            } else {
                // For fixed costs
                cost = perk.cost || 0;
            }
            
            console.log(`Perk: ${perk.name}, Cost: ${cost}`);
            return total + cost;
        }, 0);
        
        // Calculate points granted by flaws with improved variable value handling
        const flawsPoints = this.characterFlaws.reduce((total, flaw) => {
            let value = 0;
            
            if (typeof flaw.value === 'object' && flaw.value !== null) {
                // For variable values, use selectedValue or first available value
                const rawValue = flaw.selectedValue || Object.values(flaw.value)[0] || 0;
                
                // Handle negative values (convert to positive for addition)
                value = typeof rawValue === 'string' ? 
                    Math.abs(parseInt(rawValue.replace('-', ''))) : 
                    Math.abs(rawValue);
            } else {
                // For fixed values
                value = typeof flaw.value === 'string' ? 
                    Math.abs(parseInt(flaw.value.replace('-', ''))) : 
                    Math.abs(flaw.value || 0);
            }
            
            console.log(`Flaw: ${flaw.name}, Value: ${value}`);
            return total + value;
        }, 0);
        
        const netAdjustment = flawsPoints - perksCost;
        console.log(`Points adjustment: ${flawsPoints} - ${perksCost} = ${netAdjustment}`);
        
        return {
            perksCost,
            flawsPoints,
            netAdjustment
        };
    }

    /**
     * Get the flaw points used and maximum
     * @returns {Object} Flaw points info
     */
    getFlawPoints() {
        const flawsPoints = this.characterFlaws.reduce((total, flaw) => {
            // Handle flaws with variable values
            let value;
            
            if (typeof flaw.value === 'object') {
                value = flaw.selectedValue || 0;
            } else {
                value = flaw.value || 0;
            }
            
            // Convert negative values to positive for addition
            const absValue = typeof value === 'string' ? 
                parseInt(value.replace('-', '')) : 
                Math.abs(value);
                
            return total + absValue;
        }, 0);
        
        return {
            used: flawsPoints,
            max: this.maxFlawPoints,
            remaining: this.maxFlawPoints - flawsPoints
        };
    }

    /**
     * Add a perk to the character
     * @param {string} perkId - Perk ID
     * @param {number|string|null} selectedCost - Selected cost for variable cost perks
     * @param {Object} additionalData - Additional data for the perk (e.g., for Rank or Connections)
     * @returns {boolean} Whether the addition was successful
     */
    addPerk(perkId, selectedCost = null, additionalData = {}) {
        // Check if the perk is already added
        if (this.characterPerks.some(p => p.id === perkId)) {
            console.error(`Perk ${perkId} is already added`);
            return false;
        }
        
        // Find the perk in the available perks
        const perk = this.perksFlawsData.perks.find(p => p.id === perkId);
        if (!perk) {
            console.error(`Perk ${perkId} not found`);
            return false;
        }
        
        // Handle variable costs
        let finalCost = perk.cost;
        
        if (typeof perk.cost === 'object' && perk.cost !== null) {
            // For variable costs, validate the selected cost
            if (selectedCost === null) {
                console.error(`Selected cost is required for variable cost perk ${perkId}`);
                return false;
            }
            
            // Convert to number if necessary
            const costValue = typeof selectedCost === 'string' ? 
                parseInt(selectedCost) : selectedCost;
                
            // Validate the selected cost is one of the valid options
            const validCosts = Object.values(perk.cost).filter(c => c !== undefined && c !== null);
            if (validCosts.length === 0 || !validCosts.includes(costValue)) {
                console.error(`Invalid cost ${costValue} for perk ${perkId}. Valid costs: ${validCosts.join(', ')}`);
                return false;
            }
            
            finalCost = costValue;
        }
        
        // Create a deep copy of the perk with selected cost and additional data
        const characterPerk = { 
            ...JSON.parse(JSON.stringify(perk)), // Deep copy to avoid reference issues
            selectedCost: finalCost,
            ...additionalData
        };
        
        // Add the perk to the character
        this.characterPerks.push(characterPerk);
        
        // Call onUpdate callback
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        return true;
    }

    /**
     * Remove a perk from the character
     * @param {string} perkId - Perk ID
     * @returns {boolean} Whether the removal was successful
     */
    removePerk(perkId) {
        const initialLength = this.characterPerks.length;
        this.characterPerks = this.characterPerks.filter(p => p.id !== perkId);
        
        const success = this.characterPerks.length < initialLength;
        
        if (success && this.onUpdate) {
            this.onUpdate();
        }
        
        return success;
    }

    /**
     * Add a flaw to the character
     * @param {string} flawId - Flaw ID
     * @param {number|string|null} selectedValue - Selected value for variable value flaws
     * @param {Object} additionalData - Additional data for the flaw
     * @returns {boolean} Whether the addition was successful
     */
    addFlaw(flawId, selectedValue = null, additionalData = {}) {
        // Check if the flaw is already added
        if (this.characterFlaws.some(f => f.id === flawId)) {
            console.error(`Flaw ${flawId} is already added`);
            return false;
        }
        
        // Find the flaw in the available flaws
        const flaw = this.perksFlawsData.flaws.find(f => f.id === flawId);
        if (!flaw) {
            console.error(`Flaw ${flawId} not found`);
            return false;
        }
        
        // Handle variable values
        let finalValue = flaw.value;
        
        if (typeof flaw.value === 'object' && flaw.value !== null) {
            // For variable values, validate the selected value
            if (selectedValue === null) {
                console.error(`Selected value is required for variable value flaw ${flawId}`);
                return false;
            }
            
            // Convert to number if necessary
            let valueNum;
            if (typeof selectedValue === 'string') {
                // Handle negative string values like "-2"
                valueNum = selectedValue.startsWith('-') ? 
                    -parseInt(selectedValue.substring(1)) : 
                    parseInt(selectedValue);
            } else {
                valueNum = selectedValue;
            }
            
            // Validate the selected value is one of the valid options
            const validValues = Object.values(flaw.value).filter(v => v !== undefined && v !== null);
            if (validValues.length === 0 || !validValues.includes(valueNum)) {
                console.error(`Invalid value ${valueNum} for flaw ${flawId}. Valid values: ${validValues.join(', ')}`);
                return false;
            }
            
            finalValue = valueNum;
        }
        
        // Create a deep copy of the flaw with selected value and additional data
        const characterFlaw = { 
            ...JSON.parse(JSON.stringify(flaw)), // Deep copy to avoid reference issues
            selectedValue: finalValue,
            ...additionalData
        };
        
        // Calculate the current flaw points before adding the new flaw
        const currentPoints = this.getFlawPoints().used;
        
        // Calculate the value of the new flaw
        const newFlawValue = typeof finalValue === 'string' ? 
            Math.abs(parseInt(finalValue)) : 
            Math.abs(finalValue || 0);
        
        // Check if adding this flaw would exceed the maximum allowed flaw points
        if (currentPoints + newFlawValue > this.maxFlawPoints) {
            console.error(`Adding this flaw would exceed the maximum allowed flaw points (${this.maxFlawPoints})`);
            return false;
        }
        
        // Add the flaw to the character
        this.characterFlaws.push(characterFlaw);
        
        // Call onUpdate callback
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        return true;
    }

    /**
     * Remove a flaw from the character
     * @param {string} flawId - Flaw ID
     * @returns {boolean} Whether the removal was successful
     */
    removeFlaw(flawId) {
        const initialLength = this.characterFlaws.length;
        this.characterFlaws = this.characterFlaws.filter(f => f.id !== flawId);
        
        const success = this.characterFlaws.length < initialLength;
        
        if (success && this.onUpdate) {
            this.onUpdate();
        }
        
        return success;
    }

    /**
     * Update a perk's additional data or selected cost
     * @param {string} perkId - Perk ID
     * @param {number|string|null} selectedCost - New selected cost
     * @param {Object} additionalData - New additional data
     * @returns {boolean} Whether the update was successful
     */
    updatePerk(perkId, selectedCost = null, additionalData = {}) {
        const perkIndex = this.characterPerks.findIndex(p => p.id === perkId);
        if (perkIndex === -1) {
            console.error(`Perk ${perkId} not found`);
            return false;
        }
        
        // Handle variable costs
        if (selectedCost !== null) {
            // Find the original perk definition to validate cost
            const originalPerk = this.perksFlawsData.perks.find(p => p.id === perkId);
            
            if (originalPerk && typeof originalPerk.cost === 'object') {
                // Convert to number if necessary
                const costValue = typeof selectedCost === 'string' ? 
                    parseInt(selectedCost) : selectedCost;
                
                // Validate the selected cost is one of the valid options
                const validCosts = Object.values(originalPerk.cost);
                if (!validCosts.includes(costValue)) {
                    console.error(`Invalid cost ${costValue} for perk ${perkId}. Valid costs: ${validCosts.join(', ')}`);
                    return false;
                }
                
                this.characterPerks[perkIndex].selectedCost = costValue;
            } else {
                // For non-variable costs, just use the original cost
                this.characterPerks[perkIndex].selectedCost = originalPerk ? originalPerk.cost : selectedCost;
            }
        }
        
        // Update with additional data
        this.characterPerks[perkIndex] = {
            ...this.characterPerks[perkIndex],
            ...additionalData
        };
        
        // Call onUpdate callback
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        return true;
    }

    /**
     * Update a flaw's additional data or selected value
     * @param {string} flawId - Flaw ID
     * @param {number|string|null} selectedValue - New selected value
     * @param {Object} additionalData - New additional data
     * @returns {boolean} Whether the update was successful
     */
    updateFlaw(flawId, selectedValue = null, additionalData = {}) {
        const flawIndex = this.characterFlaws.findIndex(f => f.id === flawId);
        if (flawIndex === -1) {
            console.error(`Flaw ${flawId} not found`);
            return false;
        }
        
        // Handle variable values
        if (selectedValue !== null) {
            // Find the original flaw definition to validate value
            const originalFlaw = this.perksFlawsData.flaws.find(f => f.id === flawId);
            
            if (originalFlaw && typeof originalFlaw.value === 'object') {
                // Convert to number if necessary
                let valueNum;
                if (typeof selectedValue === 'string') {
                    // Handle negative string values like "-2"
                    valueNum = selectedValue.startsWith('-') ? 
                        -parseInt(selectedValue.substring(1)) : 
                        parseInt(selectedValue);
                } else {
                    valueNum = selectedValue;
                }
                
                // Validate the selected value is one of the valid options
                const validValues = Object.values(originalFlaw.value);
                if (!validValues.includes(valueNum)) {
                    console.error(`Invalid value ${valueNum} for flaw ${flawId}. Valid values: ${validValues.join(', ')}`);
                    return false;
                }
                
                // Calculate the old and new value to check if it would exceed the maximum
                const oldValue = typeof this.characterFlaws[flawIndex].selectedValue === 'object' ? 
                    Math.abs(Object.values(this.characterFlaws[flawIndex].selectedValue)[0] || 0) : 
                    Math.abs(this.characterFlaws[flawIndex].selectedValue || 0);
                    
                const newValue = Math.abs(valueNum);
                    
                const currentPoints = this.getFlawPoints().used;
                
                // Check if the new value would exceed the maximum allowed flaw points
                if (currentPoints - oldValue + newValue > this.maxFlawPoints) {
                    console.error(`Updating this flaw would exceed the maximum allowed flaw points (${this.maxFlawPoints})`);
                    return false;
                }
                
                this.characterFlaws[flawIndex].selectedValue = valueNum;
            } else {
                // For non-variable values, just use the original value
                this.characterFlaws[flawIndex].selectedValue = originalFlaw ? originalFlaw.value : selectedValue;
            }
        }
        
        // Update with additional data
        this.characterFlaws[flawIndex] = {
            ...this.characterFlaws[flawIndex],
            ...additionalData
        };
        
        // Call onUpdate callback
        if (this.onUpdate) {
            this.onUpdate();
        }
        
        return true;
    }

    /**
     * Filter perks by category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered perks
     */
    filterPerksByCategory(category) {
        if (!category || category === 'all') {
            return this.getAvailablePerks();
        }
        
        return this.getAvailablePerks().filter(perk => 
            perk.category && perk.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Filter flaws by category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered flaws
     */
    filterFlawsByCategory(category) {
        if (!category || category === 'all') {
            return this.getAvailableFlaws();
        }
        
        return this.getAvailableFlaws().filter(flaw => 
            flaw.category && flaw.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Search perks by name or description
     * @param {string} query - Search query
     * @returns {Array} Filtered perks
     */
    searchPerks(query) {
        if (!query) {
            return this.getAvailablePerks();
        }
        
        const lowerQuery = query.toLowerCase();
        return this.getAvailablePerks().filter(perk => 
            perk.name.toLowerCase().includes(lowerQuery) || 
            (perk.description && perk.description.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Search flaws by name or description
     * @param {string} query - Search query
     * @returns {Array} Filtered flaws
     */
    searchFlaws(query) {
        if (!query) {
            return this.getAvailableFlaws();
        }
        
        const lowerQuery = query.toLowerCase();
        return this.getAvailableFlaws().filter(flaw => 
            flaw.name.toLowerCase().includes(lowerQuery) || 
            (flaw.description && flaw.description.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Reset all perks and flaws to initial state
     */
    resetPerksFlaws() {
        this.characterPerks = [];
        this.characterFlaws = [];
        
        // Call onUpdate callback
        if (this.onUpdate) {
            this.onUpdate();
        }
    }
}