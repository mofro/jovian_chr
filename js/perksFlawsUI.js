/**
 * File: js/perksFlawsUI.js
 * UI component for perks and flaws management in the Jovian Chronicles Character Creator
 */

import PerksFlawsManager from './perksFlawsManager.js';

/**
 * PerksFlawsUI Class
 * Handles the UI elements for perks and flaws section
 */
export default class PerksFlawsUI {
    /**
     * Initialize the PerksFlawsUI
     * @param {HTMLElement} container - Container element for the perks and flaws UI
     * @param {Object} perksFlawsData - Perks and flaws data
     * @param {number} maxFlawPoints - Maximum allowed flaw points
     * @param {Function} onUpdate - Callback when perks or flaws change
     */
    constructor(container, perksFlawsData, maxFlawPoints = 12, onUpdate = null) {
        this.container = container;
        this.perksFlawsManager = new PerksFlawsManager(perksFlawsData, maxFlawPoints);
        this.onUpdateCallback = onUpdate;

        // First, clear the container to prevent duplication
        this.container.innerHTML = '';

        // Tab state
        this.activeTab = 'perks'; // 'perks' or 'flaws'

        // Filter and search state
        this.perkCategory = 'all';
        this.flawCategory = 'all';
        this.perkSearchQuery = '';
        this.flawSearchQuery = '';

        // Create UI elements
        this.createUI();

        // Update UI with initial state
        this.updateUI();
    }

    /**
     * Create the initial UI elements
     */
    createUI() {
        // Create section header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h2>Perks & Flaws</h2>
            <div class="points">
                <span id="perks-flaws-points-display">0 SP</span>
            </div>
        `;
        this.container.appendChild(header);

        // Create tabs
        const tabs = document.createElement('div');
        tabs.className = 'perks-flaws-tabs';
        tabs.innerHTML = `
            <button id="perks-tab" class="tab-btn active">Perks</button>
            <button id="flaws-tab" class="tab-btn">Flaws</button>
        `;
        this.container.appendChild(tabs);

        // Add event listeners for tabs
        const perksTab = tabs.querySelector('#perks-tab');
        const flawsTab = tabs.querySelector('#flaws-tab');

        perksTab.addEventListener('click', () => {
            this.activeTab = 'perks';
            perksTab.classList.add('active');
            flawsTab.classList.remove('active');
            this.updateUI();
        });

        flawsTab.addEventListener('click', () => {
            this.activeTab = 'flaws';
            flawsTab.classList.add('active');
            perksTab.classList.remove('active');
            this.updateUI();
        });

        // Create content container
        const content = document.createElement('div');
        content.className = 'perks-flaws-content';
        this.container.appendChild(content);
        this.contentContainer = content;

        // Create selected perks and flaws summary
        const summary = document.createElement('div');
        summary.className = 'perks-flaws-summary';
        summary.innerHTML = `
            <h3>Selected Perks & Flaws</h3>
            <div class="selected-perks-flaws">
                <div class="selected-perks">
                    <h4>Perks</h4>
                    <ul id="selected-perks-list" class="selected-list"></ul>
                </div>
                <div class="selected-flaws">
                    <h4>Flaws</h4>
                    <ul id="selected-flaws-list" class="selected-list"></ul>
                </div>
            </div>
            <div class="perks-flaws-totals">
                <div class="total-item">
                    <span>Perks Cost:</span>
                    <span id="perks-cost">0 SP</span>
                </div>
                <div class="total-item">
                    <span>Flaws Points:</span>
                    <span id="flaws-points">0 SP</span>
                </div>
                <div class="total-item total-net">
                    <span>Net Adjustment:</span>
                    <span id="net-adjustment">0 SP</span>
                </div>
            </div>
        `;
        this.container.appendChild(summary);
    }

    /**
     * Update the UI based on current state
     */
    updateUI() {
        this.updateContentContainer();
        this.updateSelectedSummary();
        this.updatePointsDisplay();
    }

    /**
     * Update the content container based on active tab
     */
    updateContentContainer() {
        // Clear existing content
        this.contentContainer.innerHTML = '';

        if (this.activeTab === 'perks') {
            this.renderPerksContent();
        } else {
            this.renderFlawsContent();
        }
    }

    /**
     * Render perks content
     */
    renderPerksContent() {
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'perks-flaws-controls';
        controls.innerHTML = `
            <div class="filter-group">
                <label for="perk-category-filter">Category</label>
                <select id="perk-category-filter">
                    <option value="all">All Categories</option>
                    ${this.perksFlawsManager.getPerkCategories().map(category => 
                        `<option value="${category.toLowerCase()}" ${this.perkCategory === category.toLowerCase() ? 'selected' : ''}>${category}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="filter-group">
                <label for="perk-search">Search</label>
                <input type="text" id="perk-search" placeholder="Search perks..." value="${this.perkSearchQuery}">
            </div>
        `;
        this.contentContainer.appendChild(controls);
        
        // Add event listeners for controls
        const categoryFilter = controls.querySelector('#perk-category-filter');
        categoryFilter.addEventListener('change', () => {
            this.perkCategory = categoryFilter.value;
            this.updateContentContainer();
        });
        
        const searchInput = controls.querySelector('#perk-search');
        searchInput.addEventListener('input', () => {
            this.perkSearchQuery = searchInput.value;
            this.updateContentContainer();
        });
        
        // Create perks list
        const perksList = document.createElement('div');
        perksList.className = 'perks-flaws-list';
        
        // Get filtered perks
        let perks = this.perksFlawsManager.filterPerksByCategory(this.perkCategory);
        
        // Apply search filter
        if (this.perkSearchQuery) {
            perks = this.perksFlawsManager.searchPerks(this.perkSearchQuery);
        }
        
        // If no perks to display
        if (perks.length === 0) {
            const noPerksMessage = document.createElement('div');
            noPerksMessage.className = 'no-items-message';
            noPerksMessage.textContent = 'No perks match your criteria.';
            perksList.appendChild(noPerksMessage);
        } else {
            // Create perk items
            perks.forEach(perk => {
                const perkItem = this.createPerkItem(perk);
                perksList.appendChild(perkItem);
            });
        }
        
        this.contentContainer.appendChild(perksList);
    }

    /**
     * Render flaws content
     */
    renderFlawsContent() {
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'perks-flaws-controls';
        
        // Add flaw points tracker
        const flawPoints = this.perksFlawsManager.getFlawPoints();
        const flawPointsTracker = document.createElement('div');
        flawPointsTracker.className = 'flaw-points-tracker';
        flawPointsTracker.innerHTML = `
            <span>Flaw Points:</span>
            <span id="flaw-points-display">${flawPoints.used}/${flawPoints.max}</span>
        `;
        controls.appendChild(flawPointsTracker);
        
        // Add filters
        controls.innerHTML += `
            <div class="filter-group">
                <label for="flaw-category-filter">Category</label>
                <select id="flaw-category-filter">
                    <option value="all">All Categories</option>
                    ${this.perksFlawsManager.getFlawCategories().map(category => 
                        `<option value="${category.toLowerCase()}" ${this.flawCategory === category.toLowerCase() ? 'selected' : ''}>${category}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="filter-group">
                <label for="flaw-search">Search</label>
                <input type="text" id="flaw-search" placeholder="Search flaws..." value="${this.flawSearchQuery}">
            </div>
        `;
        this.contentContainer.appendChild(controls);
        
        // Add event listeners for controls
        const categoryFilter = controls.querySelector('#flaw-category-filter');
        categoryFilter.addEventListener('change', () => {
            this.flawCategory = categoryFilter.value;
            this.updateContentContainer();
        });
        
        const searchInput = controls.querySelector('#flaw-search');
        searchInput.addEventListener('input', () => {
            this.flawSearchQuery = searchInput.value;
            this.updateContentContainer();
        });
        
        // Create flaws list
        const flawsList = document.createElement('div');
        flawsList.className = 'perks-flaws-list';
        
        // Get filtered flaws
        let flaws = this.perksFlawsManager.filterFlawsByCategory(this.flawCategory);
        
        // Apply search filter
        if (this.flawSearchQuery) {
            flaws = this.perksFlawsManager.searchFlaws(this.flawSearchQuery);
        }
        
        // If no flaws to display
        if (flaws.length === 0) {
            const noFlawsMessage = document.createElement('div');
            noFlawsMessage.className = 'no-items-message';
            noFlawsMessage.textContent = 'No flaws match your criteria.';
            flawsList.appendChild(noFlawsMessage);
        } else {
            // Create flaw items
            flaws.forEach(flaw => {
                const flawItem = this.createFlawItem(flaw);
                flawsList.appendChild(flawItem);
            });
        }
        
        this.contentContainer.appendChild(flawsList);
    }

    /**
     * Create a perk item element
     * @param {Object} perk - Perk data
     * @returns {HTMLElement} Perk item element
     */
    createPerkItem(perk) {
        const item = document.createElement('div');
        item.className = 'perks-flaws-item';
        
        // Check if perk is already selected
        const isSelected = this.perksFlawsManager.getCharacterPerks().some(p => p.id === perk.id);
        if (isSelected) {
            item.classList.add('selected');
        }
        
        // Create header
        const header = document.createElement('div');
        header.className = 'item-header';
        
        const nameEl = document.createElement('h4');
        nameEl.className = 'item-name';
        nameEl.textContent = perk.name;
        
        const costEl = document.createElement('div');
        costEl.className = 'item-cost';
        
        // Handle perks with variable costs (like Military Rank or Animal Companion)
        if (typeof perk.cost === 'object') {
            let costOptions = '';
            for (const [key, value] of Object.entries(perk.cost)) {
                costOptions += `${key}: ${value} SP, `;
            }
            costEl.textContent = `Cost: ${costOptions.slice(0, -2)}`;
        } else {
            costEl.textContent = `Cost: ${perk.cost} SP`;
        }
        
        header.appendChild(nameEl);
        header.appendChild(costEl);
        item.appendChild(header);
        
        // Create description
        if (perk.description) {
            const description = document.createElement('div');
            description.className = 'item-description';
            description.textContent = perk.description;
            item.appendChild(description);
        }
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'item-controls';
        
        // For perks with variable costs, add a select dropdown
        if (typeof perk.cost === 'object') {
            const selectGroup = document.createElement('div');
            selectGroup.className = 'select-group';
            
            const select = document.createElement('select');
            select.className = 'cost-select';
            
            for (const [key, value] of Object.entries(perk.cost)) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = `${key} (${value} SP)`;
                select.appendChild(option);
            }
            
            selectGroup.appendChild(select);
            controls.appendChild(selectGroup);
        }
        
        // Add/Remove button
        const actionBtn = document.createElement('button');
        actionBtn.className = `action-btn ${isSelected ? 'remove-btn' : 'add-btn'}`;
        actionBtn.textContent = isSelected ? 'Remove' : 'Add';
        
        actionBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            console.log(`Button clicked for perk: ${perk.name}, action: ${isSelected ? 'remove' : 'add'}`);
            
            if (isSelected) {
                const success = this.perksFlawsManager.removePerk(perk.id);
                console.log(`Removed perk ${perk.id}: ${success ? 'success' : 'failed'}`);
            } else {
                let selectedCost = null;
                if (typeof perk.cost === 'object') {
                    const select = controls.querySelector('.cost-select');
                    selectedCost = select ? parseInt(select.value) : Object.values(perk.cost)[0];
                    console.log(`Selected cost for ${perk.name}: ${selectedCost}`);
                }
                const success = this.perksFlawsManager.addPerk(perk.id, selectedCost);
                console.log(`Added perk ${perk.id} with cost ${selectedCost}: ${success ? 'success' : 'failed'}`);
            }
            
            // Update UI after action
            this.updateUI();
            
            // Call onUpdate callback if provided
            if (this.onUpdateCallback) {
                this.onUpdateCallback();
            }
        });
        
        controls.appendChild(actionBtn);
        item.appendChild(controls);
        
        return item;
    }

    /**
     * Create a flaw item element
     * @param {Object} flaw - Flaw data
     * @returns {HTMLElement} Flaw item element
     */
    createFlawItem(flaw) {
        const item = document.createElement('div');
        item.className = 'perks-flaws-item';

        // Check if flaw is already selected
        const isSelected = this.perksFlawsManager.getCharacterFlaws().some(f => f.id === flaw.id);
        if (isSelected) {
            item.classList.add('selected');
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'item-header';

        const nameEl = document.createElement('h4');
        nameEl.className = 'item-name';
        nameEl.textContent = flaw.name;

        const valueEl = document.createElement('div');
        valueEl.className = 'item-value';

        // Handle flaws with variable values
        if (typeof flaw.value === 'object') {
            let valueOptions = '';
            for (const [key, value] of Object.entries(flaw.value)) {
                valueOptions += `${key}: ${value} SP, `;
            }
            valueEl.textContent = `Value: ${valueOptions.slice(0, -2)}`;
        } else {
            valueEl.textContent = `Value: ${flaw.value} SP`;
        }

        header.appendChild(nameEl);
        header.appendChild(valueEl);
        item.appendChild(header);

        // Create description
        if (flaw.description) {
            const description = document.createElement('div');
            description.className = 'item-description';
            description.textContent = flaw.description;
            item.appendChild(description);
        }

        // Create controls
        const controls = document.createElement('div');
        controls.className = 'item-controls';
        
        // For flaws with variable values, add a select dropdown
        if (typeof flaw.value === 'object') {
            const selectGroup = document.createElement('div');
            selectGroup.className = 'select-group';
            
            const select = document.createElement('select');
            select.className = 'value-select';
            
            for (const [key, value] of Object.entries(flaw.value)) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = `${key} (${value} SP)`;
                select.appendChild(option);
            }
            
            selectGroup.appendChild(select);
            controls.appendChild(selectGroup);
        }

        // Add/Remove button
        const actionBtn = document.createElement('button');
        actionBtn.className = `action-btn ${isSelected ? 'remove-btn' : 'add-btn'}`;
        actionBtn.textContent = isSelected ? 'Remove' : 'Add';

        actionBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            console.log(`Button clicked for flaw: ${flaw.name}, action: ${isSelected ? 'remove' : 'add'}`);
            
            if (isSelected) {
                const success = this.perksFlawsManager.removeFlaw(flaw.id);
                console.log(`Removed flaw ${flaw.id}: ${success ? 'success' : 'failed'}`);
            } else {
                let selectedValue = null;
                if (typeof flaw.value === 'object') {
                    const select = controls.querySelector('.value-select');
                    selectedValue = select ? parseInt(select.value) : Object.values(flaw.value)[0];
                    console.log(`Selected value for ${flaw.name}: ${selectedValue}`);
                }
                const success = this.perksFlawsManager.addFlaw(flaw.id, selectedValue);
                console.log(`Added flaw ${flaw.id} with value ${selectedValue}: ${success ? 'success' : 'failed'}`);
            }
            
            // Update UI after action
            this.updateUI();
            
            // Call onUpdate callback if provided
            if (this.onUpdateCallback) {
                this.onUpdateCallback();
            }
        });

        controls.appendChild(actionBtn);
        item.appendChild(controls);

        return item;
    }

    /**
     * Update the selected perks and flaws summary
     */
    updateSelectedSummary() {
        // Get selected perks and flaws lists
        const perksListEl = document.getElementById('selected-perks-list');
        const flawsListEl = document.getElementById('selected-flaws-list');
        
        if (!perksListEl || !flawsListEl) {
            console.error('Selected perks or flaws list elements not found');
            return;
        }
        
        // Clear current lists
        perksListEl.innerHTML = '';
        flawsListEl.innerHTML = '';
        
        // Add selected perks
        const selectedPerks = this.perksFlawsManager.getCharacterPerks();
        if (selectedPerks.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-item';
            emptyItem.textContent = 'No perks selected';
            perksListEl.appendChild(emptyItem);
        } else {
            selectedPerks.forEach(perk => {
                const item = document.createElement('li');
                item.className = 'selected-item';
                
                // Display cost based on whether it's variable or fixed
                const cost = typeof perk.cost === 'object' ? 
                    perk.selectedCost || Object.values(perk.cost)[0] : 
                    perk.cost;
                
                item.innerHTML = `
                    <span class="item-name">${perk.name}</span>
                    <span class="item-cost">${cost} SP</span>
                    <button class="remove-btn small" data-id="${perk.id}" data-type="perk">×</button>
                `;
                perksListEl.appendChild(item);
                
                // Add click event for remove button
                const removeBtn = item.querySelector('.remove-btn');
                removeBtn.addEventListener('click', () => {
                    this.perksFlawsManager.removePerk(perk.id);
                    this.updateUI();
                    
                    // Call onUpdate callback if provided
                    if (this.onUpdateCallback) {
                        this.onUpdateCallback();
                    }
                });
            });
        }
        
        // Add selected flaws
        const selectedFlaws = this.perksFlawsManager.getCharacterFlaws();
        if (selectedFlaws.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-item';
            emptyItem.textContent = 'No flaws selected';
            flawsListEl.appendChild(emptyItem);
        } else {
            selectedFlaws.forEach(flaw => {
                const item = document.createElement('li');
                item.className = 'selected-item';
                
                // Display value based on whether it's variable or fixed
                const value = typeof flaw.value === 'object' ? 
                    flaw.selectedValue || Object.values(flaw.value)[0] : 
                    flaw.value;
                
                item.innerHTML = `
                    <span class="item-name">${flaw.name}</span>
                    <span class="item-value">${value} SP</span>
                    <button class="remove-btn small" data-id="${flaw.id}" data-type="flaw">×</button>
                `;
                flawsListEl.appendChild(item);
                
                // Add click event for remove button
                const removeBtn = item.querySelector('.remove-btn');
                removeBtn.addEventListener('click', () => {
                    this.perksFlawsManager.removeFlaw(flaw.id);
                    this.updateUI();
                    
                    // Call onUpdate callback if provided
                    if (this.onUpdateCallback) {
                        this.onUpdateCallback();
                    }
                });
            });
        }
    }

    /**
     * Update the points display
     */
    updatePointsDisplay() {
        const points = this.perksFlawsManager.calculatePointsAdjustment();
        
        // Update points in the header
        const pointsDisplay = document.getElementById('perks-flaws-points-display');
        if (pointsDisplay) {
            pointsDisplay.textContent = `${points.netAdjustment} SP`;
        }
        
        // Update points in the summary
        const perksCount = document.getElementById('perks-cost');
        const flawsCount = document.getElementById('flaws-points');
        const netAdjustment = document.getElementById('net-adjustment');
        
        if (perksCount && flawsCount && netAdjustment) {
            perksCount.textContent = `${points.perksCost} SP`;
            flawsCount.textContent = `${points.flawsPoints} SP`;
            netAdjustment.textContent = `${points.netAdjustment} SP`;
        }
    }

    /**
     * Set character perks and flaws
     * @param {Array} perks - Character perks
     * @param {Array} flaws - Character flaws
     */
    setCharacterPerksFlaws(perks, flaws) {
        this.perksFlawsManager.setCharacterPerksFlaws(perks, flaws);
        this.updateUI();
    }

    /**
     * Set maximum flaw points
     * @param {number} max - Maximum flaw points
     */
    setMaxFlawPoints(max) {
        this.perksFlawsManager.maxFlawPoints = max;
        this.updateUI();
    }

    /**
     * Get the current perks, flaws, and points adjustment
     * @returns {Object} Perks, flaws, and points adjustment
     */
    getPerksFlawsData() {
        const perks = this.perksFlawsManager.getCharacterPerks();
        const flaws = this.perksFlawsManager.getCharacterFlaws();
        const pointsAdjustment = this.perksFlawsManager.calculatePointsAdjustment();
        
        return {
            perks,
            flaws,
            pointsModifier: pointsAdjustment.netAdjustment
        };
    }

    /**
     * Reset all perks and flaws
     */
    resetPerksFlaws() {
        if (this.perksFlawsManager) {
            this.perksFlawsManager.resetPerksFlaws();
            this.updateUI();
        }
    }
}