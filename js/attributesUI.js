// attributesUI.js - UI for attributes section

import AttributeManager from './attributeManager.js';

/**
 * AttributesUI Class
 * Handles the UI elements for attributes section
 */
export default class AttributesUI {
    /**
     * Initialize the AttributesUI
     * @param {HTMLElement} container - Container element for the attributes UI
     * @param {Object} config - Configuration object
     * @param {number} config.maxCharacterPoints - Maximum character points
     * @param {function} config.onUpdate - Callback when attributes change
     */
    constructor(container, config = {}) {
        this.container = container;
        this.onUpdateCallback = config.onUpdate || function() {};
        
        // Create attribute manager
        this.attributeManager = new AttributeManager({
            maxCharacterPoints: config.maxCharacterPoints || 30,
            onUpdate: () => this.update()
        });
        
        // Initialize UI
        this.createUI();
        this.update();
    }

    /**
     * Create the initial UI elements
     */
    createUI() {
        // Create attributes container
        const attributesContainer = document.createElement('div');
        attributesContainer.className = 'attributes-container';
        this.container.appendChild(attributesContainer);
        this.attributesContainer = attributesContainer;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'attributes-header';
        header.innerHTML = `
            <h2>Attributes</h2>
            <div class="points">
                <span id="character-points-used">0/${this.attributeManager.maxCharacterPoints}</span>
            </div>
        `;
        attributesContainer.appendChild(header);
        
        // Create points tracker
        const pointsTracker = document.createElement('div');
        pointsTracker.className = 'points-tracker';
        pointsTracker.innerHTML = `
            <div>Character Points:</div>
            <div id="character-points-display">0/${this.attributeManager.maxCharacterPoints}</div>
        `;
        attributesContainer.appendChild(pointsTracker);
        
        // Create attribute grid
        const grid = document.createElement('div');
        grid.className = 'attribute-grid';
        attributesContainer.appendChild(grid);
        this.attributeGrid = grid;
        
        // Create attribute items
        const attributes = this.attributeManager.getAttributes();
        for (const attrCode in attributes) {
            const attr = attributes[attrCode];
            this.createAttributeItem(attrCode, attr);
        }
    }

    /**
     * Create a single attribute item in the grid
     * @param {string} attrCode - Attribute code (e.g., 'AGI')
     * @param {Object} attr - Attribute data object
     */
    createAttributeItem(attrCode, attr) {
        const item = document.createElement('div');
        item.className = `attribute-item attribute-${attr.category}`;
        item.innerHTML = `
            <div class="attribute-name-container">
                <div class="attribute-tooltip" data-tooltip="${attr.tooltip}">?</div>
                <div class="attribute-name">
                    <span>${attr.name}</span>
                    <span class="attribute-abbr">${attr.abbr}</span>
                </div>
            </div>
            <div class="attribute-controls">
                <div class="attribute-value" id="${attrCode.toLowerCase()}-value">0</div>
                <div class="attribute-buttons">
                    <button class="attribute-btn dec-btn" id="${attrCode.toLowerCase()}-decrease">-</button>
                    <button class="attribute-btn inc-btn" id="${attrCode.toLowerCase()}-increase">+</button>
                </div>
            </div>
            <div class="attribute-description">${attr.description}</div>
        `;
        this.attributeGrid.appendChild(item);
        
        // Add event listeners
        const decreaseBtn = item.querySelector(`#${attrCode.toLowerCase()}-decrease`);
        const increaseBtn = item.querySelector(`#${attrCode.toLowerCase()}-increase`);
        
        decreaseBtn.addEventListener('click', () => {
            this.attributeManager.decreaseAttribute(attrCode);
        });
        
        increaseBtn.addEventListener('click', () => {
            this.attributeManager.increaseAttribute(attrCode);
        });
    }

    /**
     * Update the UI to reflect current attribute values
     */
    update() {
        const attributes = this.attributeManager.getAttributes();
        const points = this.attributeManager.getCharacterPoints();
        
        // Update points display
        document.getElementById('character-points-display').textContent = `${points.used}/${points.max}`;
        document.getElementById('character-points-used').textContent = `${points.used}/${points.max}`;
        
        // Update attribute values and button states
        for (const attrCode in attributes) {
            const attr = attributes[attrCode];
            const value = attr.value;
            const valueElement = document.getElementById(`${attrCode.toLowerCase()}-value`);
            const decreaseBtn = document.getElementById(`${attrCode.toLowerCase()}-decrease`);
            const increaseBtn = document.getElementById(`${attrCode.toLowerCase()}-increase`);
            
            // Update value display
            if (valueElement) {
                valueElement.textContent = value;
            }
            
            // Update button states
            if (decreaseBtn) {
                decreaseBtn.disabled = value <= attr.range.min;
            }
            
            if (increaseBtn) {
                // Check if we have enough points to increase this attribute
                const nextValue = value + 1;
                const currentCost = this.attributeManager.getAttributeCost(value);
                const nextCost = this.attributeManager.getAttributeCost(nextValue);
                const additionalCost = nextCost - currentCost;
                
                increaseBtn.disabled = (
                    value >= attr.range.max || 
                    points.used + additionalCost > points.max
                );
            }
        }
        
        // Call the update callback
        this.onUpdateCallback(this.getSecondaryAttributes());
    }

    /**
     * Get the attribute manager
     * @returns {AttributeManager} The attribute manager instance
     */
    getAttributeManager() {
        return this.attributeManager;
    }

    /**
     * Get attribute values
     * @returns {Object} Object with attribute codes as keys and values
     */
    getAttributeValues() {
        return this.attributeManager.getAttributeValues();
    }

    /**
     * Get secondary attributes
     * @param {Object} skills - Skills object (optional)
     * @returns {Object} Secondary attributes
     */
    getSecondaryAttributes(skills) {
        return this.attributeManager.calculateSecondaryAttributes(skills);
    }

    /**
     * Set attribute values from data
     * @param {Object} data - Attributes data
     */
    setAttributeValues(data) {
        this.attributeManager.setAttributesFromData(data);
    }

    /**
     * Reset all attributes to default values
     */
    resetAttributes() {
        this.attributeManager.resetAttributes();
    }

    /**
     * Update the maximum character points
     * @param {number} max - New maximum character points
     */
    setMaxCharacterPoints(max) {
        this.attributeManager.setMaxCharacterPoints(max);
    }

    /**
     * Set attribute values from data
     * @param {Object} attributes - Attributes data
     */
    setAttributeValues(attributes) {
        if (!attributes) return;
        this.attributeManager.setAttributesFromData(attributes);
    }

    /**
     * Update the maximum character points
     * @param {number} max - New maximum character points
     */
    setMaxCharacterPoints(max) {
        this.attributeManager.setMaxCharacterPoints(max);
    }
}
