/**
 * File: js/PerksFlawsStore.js
 * Compatibility layer to support existing code that references the old store pattern
 * while using the new manager implementation.
 */

import PerksFlawsManager from './perksFlawsManager.js';

/**
 * PerksFlawsStore class - Compatibility wrapper around PerksFlawsManager
 * This maintains backward compatibility with code that expects the old store interface
 */
export default class PerksFlawsStore {
    /**
     * Initialize the PerksFlawsStore
     * @param {Object} perksFlawsData - Perks and flaws data
     * @param {number} maxFlawPoints - Maximum allowed flaw points
     * @param {Function} onUpdate - Callback function when perks/flaws change
     */
    constructor(perksFlawsData, maxFlawPoints = 12, onUpdate = null) {
        // Create the actual manager that will handle everything
        this.manager = new PerksFlawsManager(perksFlawsData, maxFlawPoints, onUpdate);
    }

    /**
     * Get all available perks
     * @returns {Array} Available perks
     */
    getAvailablePerks() {
        return this.manager.getAvailablePerks();
    }

    /**
     * Get all available flaws
     * @returns {Array} Available flaws
     */
    getAvailableFlaws() {
        return this.manager.getAvailableFlaws();
    }

    /**
     * Get all perk categories
     * @returns {Array} Perk categories
     */
    getPerkCategories() {
        return this.manager.getPerkCategories();
    }

    /**
     * Get all flaw categories
     * @returns {Array} Flaw categories
     */
    getFlawCategories() {
        return this.manager.getFlawCategories();
    }

    /**
     * Get the character's perks
     * @returns {Array} Character perks
     */
    getCharacterPerks() {
        return this.manager.getCharacterPerks();
    }

    /**
     * Get the character's flaws
     * @returns {Array} Character flaws
     */
    getCharacterFlaws() {
        return this.manager.getCharacterFlaws();
    }

    /**
     * Set the character's perks and flaws
     * @param {Array} perks - Character perks
     * @param {Array} flaws - Character flaws
     */
    setCharacterPerksFlaws(perks, flaws) {
        this.manager.setCharacterPerksFlaws(perks, flaws);
    }

    /**
     * Calculate the total skill points adjustment from perks and flaws
     * @returns {Object} Points adjustment
     */
    calculatePointsAdjustment() {
        return this.manager.calculatePointsAdjustment();
    }

    /**
     * Get the flaw points used and maximum
     * @returns {Object} Flaw points info
     */
    getFlawPoints() {
        return this.manager.getFlawPoints();
    }

    /**
     * Add a perk to the character
     * @param {string} perkId - Perk ID
     * @param {number|string|null} selectedCost - Selected cost for variable cost perks
     * @param {Object} additionalData - Additional data for the perk
     * @returns {boolean} Whether the addition was successful
     */
    addPerk(perkId, selectedCost = null, additionalData = {}) {
        return this.manager.addPerk(perkId, selectedCost, additionalData);
    }

    /**
     * Remove a perk from the character
     * @param {string} perkId - Perk ID
     * @returns {boolean} Whether the removal was successful
     */
    removePerk(perkId) {
        return this.manager.removePerk(perkId);
    }

    /**
     * Add a flaw to the character
     * @param {string} flawId - Flaw ID
     * @param {number|string|null} selectedValue - Selected value for variable value flaws
     * @param {Object} additionalData - Additional data for the flaw
     * @returns {boolean} Whether the addition was successful
     */
    addFlaw(flawId, selectedValue = null, additionalData = {}) {
        return this.manager.addFlaw(flawId, selectedValue, additionalData);
    }

    /**
     * Remove a flaw from the character
     * @param {string} flawId - Flaw ID
     * @returns {boolean} Whether the removal was successful
     */
    removeFlaw(flawId) {
        return this.manager.removeFlaw(flawId);
    }

    /**
     * Update a perk's additional data or selected cost
     * @param {string} perkId - Perk ID
     * @param {number|string|null} selectedCost - New selected cost
     * @param {Object} additionalData - New additional data
     * @returns {boolean} Whether the update was successful
     */
    updatePerk(perkId, selectedCost = null, additionalData = {}) {
        return this.manager.updatePerk(perkId, selectedCost, additionalData);
    }

    /**
     * Update a flaw's additional data or selected value
     * @param {string} flawId - Flaw ID
     * @param {number|string|null} selectedValue - New selected value
     * @param {Object} additionalData - New additional data
     * @returns {boolean} Whether the update was successful
     */
    updateFlaw(flawId, selectedValue = null, additionalData = {}) {
        return this.manager.updateFlaw(flawId, selectedValue, additionalData);
    }

    /**
     * Filter perks by category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered perks
     */
    filterPerksByCategory(category) {
        return this.manager.filterPerksByCategory(category);
    }

    /**
     * Filter flaws by category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered flaws
     */
    filterFlawsByCategory(category) {
        return this.manager.filterFlawsByCategory(category);
    }

    /**
     * Search perks by name or description
     * @param {string} query - Search query
     * @returns {Array} Filtered perks
     */
    searchPerks(query) {
        return this.manager.searchPerks(query);
    }

    /**
     * Search flaws by name or description
     * @param {string} query - Search query
     * @returns {Array} Filtered flaws
     */
    searchFlaws(query) {
        return this.manager.searchFlaws(query);
    }

    /**
     * Reset all perks and flaws to initial state
     */
    resetPerksFlaws() {
        this.manager.resetPerksFlaws();
    }
}