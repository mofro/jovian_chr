// secondaryTraitsUI.js - UI for secondary traits section

import SecondaryTraitsManager from './secondaryTraitsManager.js';

/**
 * SecondaryTraitsUI Class
 * Handles the UI elements for secondary traits section
 */
export default class SecondaryTraitsUI {
    /**
     * Initialize the SecondaryTraitsUI
     * @param {HTMLElement} container - Container element for the secondary traits UI
     * @param {Object} config - Configuration object
     * @param {Object} config.attributesManager - Instance of AttributesManager
     * @param {Object} config.skillsManager - Instance of SkillsManager (optional)
     * @param {function} config.onUpdate - Callback when secondary traits change
     */
    constructor(container, config = {}) {
        this.container = container;
        this.attributesManager = config.attributesManager;
        this.skillsManager = config.skillsManager;
        this.onUpdateCallback = config.onUpdate || function() {};
        
        // Create secondary traits manager
        this.traitsManager = new SecondaryTraitsManager({
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
        // Create secondary traits container
        const traitsContainer = document.createElement('div');
        traitsContainer.className = 'secondary-traits-container';
        this.container.appendChild(traitsContainer);
        this.traitsContainer = traitsContainer;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'secondary-traits-header';
        header.innerHTML = `
            <h2>Secondary Traits</h2>
        `;
        traitsContainer.appendChild(header);
        
        // Create description
        const description = document.createElement('div');
        description.className = 'secondary-traits-description';
        description.innerHTML = `
            <p>Secondary traits are derived from your primary attributes and skill levels. They represent your character's 
            physical capabilities and resistances in gameplay. These values are automatically calculated and will 
            update as you change your attributes and skills.</p>
        `;
        traitsContainer.appendChild(description);
        
        // Create traits grid
        const traitsGrid = document.createElement('div');
        traitsGrid.className = 'traits-grid';
        traitsContainer.appendChild(traitsGrid);
        
        // Create physical traits section
        const physicalTraits = document.createElement('div');
        physicalTraits.className = 'traits-section';
        physicalTraits.innerHTML = `
            <h3>Physical Capabilities</h3>
            <div class="traits-list" id="physical-traits-list">
                <!-- Physical traits will be populated here -->
            </div>
        `;
        traitsGrid.appendChild(physicalTraits);
        this.physicalTraitsList = physicalTraits.querySelector('#physical-traits-list');
        
        // Create damage thresholds section
        const damageThresholds = document.createElement('div');
        damageThresholds.className = 'traits-section';
        damageThresholds.innerHTML = `
            <h3>Damage Thresholds</h3>
            <div class="traits-list" id="threshold-traits-list">
                <!-- Damage thresholds will be populated here -->
            </div>
        `;
        traitsGrid.appendChild(damageThresholds);
        this.thresholdTraitsList = damageThresholds.querySelector('#threshold-traits-list');
        
        // Create injury levels section
        const injuryLevels = document.createElement('div');
        injuryLevels.className = 'injury-levels';
        injuryLevels.innerHTML = `
            <h3>Injury Levels</h3>
            <table class="injury-table">
                <thead>
                    <tr>
                        <th>Injury Type</th>
                        <th>Threshold</th>
                        <th>Effects</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="injury-type">Flesh Wound</td>
                        <td class="injury-threshold" id="flesh-wound-threshold">-</td>
                        <td class="injury-effects">-1 to all actions per wound</td>
                    </tr>
                    <tr>
                        <td class="injury-type">Deep Wound</td>
                        <td class="injury-threshold" id="deep-wound-threshold">-</td>
                        <td class="injury-effects">-2 to all actions per wound, significant bleeding</td>
                    </tr>
                    <tr>
                        <td class="injury-type">Instant Death</td>
                        <td class="injury-threshold" id="instant-death-threshold">-</td>
                        <td class="injury-effects">Character is killed instantly</td>
                    </tr>
                </tbody>
            </table>
            
            <p>Armor adds its points to each threshold individually when worn.</p>
            
            <div class="armor-input">
                <label for="armor-points">Armor Points:</label>
                <input type="number" id="armor-points" min="0" value="0">
                <button id="apply-armor" class="button secondary">Apply</button>
            </div>
        `;
        traitsContainer.appendChild(injuryLevels);
        
        // Add event listener for armor points
        const applyArmorButton = injuryLevels.querySelector('#apply-armor');
        applyArmorButton.addEventListener('click', () => {
            const armorPoints = parseInt(injuryLevels.querySelector('#armor-points').value) || 0;
            this.traitsManager.setArmorPoints(armorPoints);
            this.update();
        });
        
        // Create system shock track
        const systemShockTrack = document.createElement('div');
        systemShockTrack.className = 'system-shock-track';
        systemShockTrack.innerHTML = `
            <h3>System Shock</h3>
            <p>System Shock represents how many injuries a character can take before going into shock and dying. 
            If the total of System Shock and a character's wound-induced penalties equals zero or less, the character 
            goes into shock.</p>
            <div class="shock-boxes" id="system-shock-track">
                <!-- System shock boxes will be populated here -->
            </div>
        `;
        traitsContainer.appendChild(systemShockTrack);
        this.systemShockTrack = systemShockTrack.querySelector('#system-shock-track');
    }

    /**
     * Create a trait item element
     * @param {string} name - Trait name
     * @param {string} abbr - Trait abbreviation
     * @param {number} value - Trait value
     * @param {string} formula - Formula description
     * @param {string} category - Trait category for styling
     * @returns {HTMLElement} The trait item element
     */
    createTraitItem(name, abbr, value, formula, category) {
        const item = document.createElement('div');
        item.className = `trait-item trait-${category}`;
        item.innerHTML = `
            <div class="trait-name">${name} (${abbr})</div>
            <div class="trait-value">${value}</div>
            <div class="trait-formula">${formula}</div>
        `;
        return item;
    }

    /**
     * Update the system shock track display
     * @param {number} systemShock - System shock value
     */
    updateSystemShockTrack(systemShock) {
        // Clear existing track
        this.systemShockTrack.innerHTML = '';
        
        // Create boxes based on system shock value
        for (let i = 1; i <= systemShock; i++) {
            const box = document.createElement('div');
            box.className = 'shock-box';
            box.textContent = i;
            this.systemShockTrack.appendChild(box);
        }
    }

    /**
     * Update the UI to reflect current traits values
     */
    update() {
        // Get attributes if available
        let attributes = null;
        if (this.attributesManager) {
            attributes = this.attributesManager.getAttributeValues();
        }
        
        // Get skills if available
        let skills = null;
        if (this.skillsManager) {
            skills = this.skillsManager.getSkillsForTraits();
        }
        
        // Calculate secondary traits
        const traits = this.traitsManager.calculateSecondaryTraits(attributes, skills);
        if (!traits || Object.keys(traits).length === 0) {
            return;
        }
        
        // Update physical traits
        this.physicalTraitsList.innerHTML = '';
        
        // Add Strength
        this.physicalTraitsList.appendChild(
            this.createTraitItem(
                'Strength', 'STR', traits.STR, 
                '(BLD + FIT) / 2', 'physical'
            )
        );
        
        // Add Health
        this.physicalTraitsList.appendChild(
            this.createTraitItem(
                'Health', 'HLT', traits.HLT, 
                '(FIT + PSY + WIL) / 3', 'physical'
            )
        );
        
        // Add Stamina
        this.physicalTraitsList.appendChild(
            this.createTraitItem(
                'Stamina', 'STA', traits.STA, 
                '5 × (BLD + HLT) + 25', 'physical'
            )
        );
        
        // Add Unarmed Damage
        this.physicalTraitsList.appendChild(
            this.createTraitItem(
                'Unarmed Damage', 'UD', traits.UD, 
                '3 + STR + BLD + Hand-to-Hand', 'damage'
            )
        );
        
        // Add Armed Damage
        this.physicalTraitsList.appendChild(
            this.createTraitItem(
                'Armed Damage', 'AD', traits.AD, 
                '3 + STR + BLD + Melee', 'damage'
            )
        );
        
        // Update damage thresholds
        this.thresholdTraitsList.innerHTML = '';
        
        // Add Flesh Wound threshold
        this.thresholdTraitsList.appendChild(
            this.createTraitItem(
                'Flesh Wound', 'FW', traits.fleshWound, 
                'STA / 2 (rounded up)', 'threshold'
            )
        );
        
        // Add Deep Wound threshold
        this.thresholdTraitsList.appendChild(
            this.createTraitItem(
                'Deep Wound', 'DW', traits.deepWound, 
                'STA', 'threshold'
            )
        );
        
        // Add Instant Death threshold
        this.thresholdTraitsList.appendChild(
            this.createTraitItem(
                'Instant Death', 'ID', traits.instantDeath, 
                'STA × 2', 'threshold'
            )
        );
        
        // Add System Shock
        this.thresholdTraitsList.appendChild(
            this.createTraitItem(
                'System Shock', 'SS', traits.systemShock, 
                '5 + HLT', 'resistance'
            )
        );
        
        // Update injury table thresholds
        document.getElementById('flesh-wound-threshold').textContent = 
            traits.fleshWoundArmored ? `${traits.fleshWound} (${traits.fleshWoundArmored})` : traits.fleshWound;
            
        document.getElementById('deep-wound-threshold').textContent = 
            traits.deepWoundArmored ? `${traits.deepWound} (${traits.deepWoundArmored})` : traits.deepWound;
            
        document.getElementById('instant-death-threshold').textContent = 
            traits.instantDeathArmored ? `${traits.instantDeath} (${traits.instantDeathArmored})` : traits.instantDeath;
        
        // Update system shock track
        this.updateSystemShockTrack(traits.systemShock);
        
        // Call the update callback
        this.onUpdateCallback(traits);
    }

    /**
     * Get the secondary traits manager
     * @returns {SecondaryTraitsManager} The secondary traits manager instance
     */
    getTraitsManager() {
        return this.traitsManager;
    }

    /**
     * Get current secondary traits
     * @returns {Object} Secondary traits
     */
    getSecondaryTraits() {
        return this.traitsManager.getSecondaryTraits();
    }

    /**
     * Set attributes manager to use for calculations
     * @param {Object} attributesManager - Attributes manager instance
     */
    setAttributesManager(attributesManager) {
        this.attributesManager = attributesManager;
        this.update();
    }

    /**
     * Set skills manager to use for calculations
     * @param {Object} skillsManager - Skills manager instance
     */
    setSkillsManager(skillsManager) {
        this.skillsManager = skillsManager;
        this.update();
    }
}