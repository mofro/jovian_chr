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
     * @param {number} maxFlawPoints - Maximum allowed flaw points (usually 12, or 20 for Cinematic games)
     */
    constructor(perksFlawsData, maxFlawPoints = 12) {
        this.perksFlawsData = perksFlawsData;
        this.maxFlawPoints = maxFlawPoints;
        
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
    }

    /**
     * Calculate the total skill points adjustment from perks and flaws
     * @returns {Object} Points adjustment
     */
    calculatePointsAdjustment() {
        // Calculate cost of perks
        const perksCost = this.characterPerks.reduce((total, perk) => {
            // Handle perks with variable costs (e.g., Rank, Wealth)
            const cost = typeof perk.cost === 'object' ? perk.selectedCost : perk.cost;
            return total + (cost || 0);
        }, 0);
        
        // Calculate points granted by flaws
        const flawsPoints = this.characterFlaws.reduce((total, flaw) => {
            // Handle flaws with variable values (e.g., Code of Honor, Social Stigma)
            const value = typeof flaw.value === 'object' ? flaw.selectedValue : flaw.value;
            // Make sure we convert negative values to positive for addition
            const absValue = typeof value === 'string' ? 
                parseInt(value.replace('-', '')) : Math.abs(value || 0);
            return total + absValue;
        }, 0);
        
        return {
            perksCost,
            flawsPoints,
            netAdjustment: flawsPoints - perksCost
        };
    }

    /**
     * Get the flaw points used and maximum
     * @returns {Object} Flaw points info
     */
    getFlawPoints() {
        const flawsPoints = this.characterFlaws.reduce((total, flaw) => {
            // Handle flaws with variable values
            const value = typeof flaw.value === 'object' ? flaw.selectedValue : flaw.value;
            // Make sure we convert negative values to positive for addition
            const absValue = typeof value === 'string' ? 
                parseInt(value.replace('-', '')) : Math.abs(value || 0);
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
     * @param {number|string} selectedCost - Selected cost for variable cost perks
     * @param {Object} additionalData - Additional data for the perk (e.g., for Rank or Connections)
     * @returns {boolean} Whether the addition was successful
     */
    addPerk(perkId, selectedCost = null, additionalData = {}) {
        // Check if the perk is already added
        if (this.characterPerks.some(p => p.id === perkId)) {
            return false;
        }
        
        // Find the perk in the available perks
        const perk = this.perksFlawsData.perks.find(p => p.id === perkId);
        if (!perk) {
            return false;
        }
        
        // Create a copy of the perk with selected cost and additional data
        const characterPerk = { 
            ...perk,
            selectedCost: selectedCost !== null ? selectedCost : perk.cost,
            ...additionalData
        };
        
        // Add the perk to the character
        this.characterPerks.push(characterPerk);
        
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
        return this.characterPerks.length < initialLength;
    }

    /**
     * Add a flaw to the character
     * @param {string} flawId - Flaw ID
     * @param {number|string} selectedValue - Selected value for variable value flaws
     * @param {Object} additionalData - Additional data for the flaw
     * @returns {boolean} Whether the addition was successful
     */
    addFlaw(flawId, selectedValue = null, additionalData = {}) {
        // Check if the flaw is already added
        if (this.characterFlaws.some(f => f.id === flawId)) {
            return false;
        }
        
        // Find the flaw in the available flaws
        const flaw = this.perksFlawsData.flaws.find(f => f.id === flawId);
        if (!flaw) {
            return false;
        }
        
        // Create a copy of the flaw with selected value and additional data
        const characterFlaw = { 
            ...flaw,
            selectedValue: selectedValue !== null ? selectedValue : flaw.value,
            ...additionalData
        };
        
        // Calculate the current flaw points before adding the new flaw
        const currentPoints = this.getFlawPoints().used;
        
        // Calculate the value of the new flaw
        const newFlawValue = typeof characterFlaw.selectedValue === 'object' ? 
            characterFlaw.selectedValue : Math.abs(characterFlaw.selectedValue || 0);
        
        // Check if adding this flaw would exceed the maximum allowed flaw points
        if (currentPoints + newFlawValue > this.maxFlawPoints) {
            return false;
        }
        
        // Add the flaw to the character
        this.characterFlaws.push(characterFlaw);
        
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
        return this.characterFlaws.length < initialLength;
    }

    /**
     * Update a perk's additional data or selected cost
     * @param {string} perkId - Perk ID
     * @param {number|string} selectedCost - New selected cost
     * @param {Object} additionalData - New additional data
     * @returns {boolean} Whether the update was successful
     */
    updatePerk(perkId, selectedCost = null, additionalData = {}) {
        const perkIndex = this.characterPerks.findIndex(p => p.id === perkId);
        if (perkIndex === -1) {
            return false;
        }
        
        // Update the perk
        if (selectedCost !== null) {
            this.characterPerks[perkIndex].selectedCost = selectedCost;
        }
        
        this.characterPerks[perkIndex] = {
            ...this.characterPerks[perkIndex],
            ...additionalData
        };
        
        return true;
    }

    /**
     * Update a flaw's additional data or selected value
     * @param {string} flawId - Flaw ID
     * @param {number|string} selectedValue - New selected value
     * @param {Object} additionalData - New additional data
     * @returns {boolean} Whether the update was successful
     */
    updateFlaw(flawId, selectedValue = null, additionalData = {}) {
        const flawIndex = this.characterFlaws.findIndex(f => f.id === flawId);
        if (flawIndex === -1) {
            return false;
        }
        
        // If updating the value, check if it would exceed the maximum flaw points
        if (selectedValue !== null) {
            const oldValue = typeof this.characterFlaws[flawIndex].selectedValue === 'object' ? 
                this.characterFlaws[flawIndex].selectedValue : 
                Math.abs(this.characterFlaws[flawIndex].selectedValue || 0);
                
            const newValue = typeof selectedValue === 'object' ? 
                selectedValue : Math.abs(selectedValue || 0);
                
            const currentPoints = this.getFlawPoints().used;
            
            // Check if the new value would exceed the maximum flaw points
            if (currentPoints - oldValue + newValue > this.maxFlawPoints) {
                return false;
            }
            
            this.characterFlaws[flawIndex].selectedValue = selectedValue;
        }
        
        this.characterFlaws[flawIndex] = {
            ...this.characterFlaws[flawIndex],
            ...additionalData
        };
        
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
    }
}
