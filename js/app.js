/**
 * File: js/app.js
 * Main application script for the Jovian Chronicles Character Creator
 */

import { eventBus } from './eventBus.js';
import { CharacterState } from './characterState.js';
import AttributesUI from './attributesUI.js';
import SkillsUI from './skillsUI.js';
import PerksFlawsUI from './perksFlawsUI.js';
import SecondaryTraitsUI from './secondaryTraitsUI.js';

// Game settings with power levels
const gameSettings = {
    gritty: {
        name: "Gritty Game",
        description: "A realistic game where characters face serious challenges and dangers.",
        characterPoints: 20,
        skillPoints: 40,
    },
    adventurous: {
        name: "Adventurous Game",
        description: "The standard Jovian Chronicles setting with heroic characters.",
        characterPoints: 30,
        skillPoints: 50,
    },
    cinematic: {
        name: "Cinematic Game",
        description: "A high-powered game with exceptional characters capable of amazing feats.",
        characterPoints: 50,
        skillPoints: 70,
    }
};

// Main application class
class JovianCharacterCreator {
    constructor() {
        // Initialize event bus
        this.eventBus = eventBus;
        
        // Initialize central character state
        this.characterState = new CharacterState(this.eventBus, gameSettings);
        
        // Store loaded data
        this.skillsData = null;
        this.perksFlawsData = null;
        
        // Bind methods to ensure correct context
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
        this.initUI = this.initUI.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.setupTabNavigation = this.setupTabNavigation.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.updateSecondaryTraits = this.updateSecondaryTraits.bind(this);
        
        // Initialize the application
        this.init();
    }

    async init() {
        try {
            // Wait for the DOM to fully load
            if (document.readyState !== 'complete') {
                await new Promise(resolve => window.addEventListener('load', resolve));
            }

            // Load external data
            const dataLoaded = await this.loadData();
            if (!dataLoaded) {
                throw new Error('Failed to load required data.');
            }

            // Initialize UI components
            this.initUI();

            // Set up event listeners
            this.setupEventListeners();

            console.log('Jovian Chronicles Character Creator initialized');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Error initializing application. Please refresh and try again.');
        }
    }

    /**
     * Load JSON data from a URL
     * @param {string} url - URL to fetch
     * @returns {Promise<Object>} Parsed JSON data
     */
    async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading data from ${url}:`, error);
            throw error;
        }
    }

    /**
     * Load data from external sources
     */
    async loadData() {
        try {
            // Load skills data
            const skillsResponse = await fetch('data/skills.json');
            this.skillsData = await skillsResponse.json();
    
            console.log('Loaded skills data:', this.skillsData);
    
            if (!this.skillsData || !Array.isArray(this.skillsData.skills)) {
                throw new Error('Invalid skills data format');
            }
    
            // Load perks and flaws data
            const perksFlawsResponse = await fetch('data/perks-flaws.json');
            this.perksFlawsData = await perksFlawsResponse.json();
            
            console.log('Loaded perks and flaws data:', this.perksFlawsData);
    
            if (!this.perksFlawsData || !Array.isArray(this.perksFlawsData.perks) || !Array.isArray(this.perksFlawsData.flaws)) {
                throw new Error('Invalid perks and flaws data format');
            }
    
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }

    initUI() {
        // Initialize attributes UI
        const attributesContainer = document.querySelector('#attributes-tab');
        if (attributesContainer) {
            this.attributesUI = new AttributesUI(attributesContainer, {
                maxCharacterPoints: this.characterState.getCharacterPoints().max,
                onUpdate: (attributes, usedPoints) => {
                    this.characterState.updateAttributes(attributes, usedPoints);
                }
            });
            
            // Subscribe to attribute events
            this.eventBus.subscribe('attributes:updated', data => {
                this.updateSecondaryTraits();
            });
        }
        
        // Initialize skills UI
        const skillsContainer = document.querySelector('#skills-tab');
        if (skillsContainer) {
            this.skillsUI = new SkillsUI(skillsContainer, {
                skillsData: this.skillsData,
                maxSkillPoints: this.characterState.getSkillPoints().max,
                onUpdate: (skills, usedPoints) => {
                    this.characterState.updateSkills(skills, usedPoints);
                }
            });
            
            // Subscribe to skills events
            this.eventBus.subscribe('skills:updated', data => {
                this.updateSecondaryTraits();
            });
        }
        
        // Initialize perks & flaws UI
        const perksFlawsContainer = document.querySelector('#perks-flaws-tab');
        if (perksFlawsContainer) {
            const maxFlawPoints = gameSettings[this.characterState.getState().setting].flawPoints;
            
            this.perksFlawsUI = new PerksFlawsUI(perksFlawsContainer, this.perksFlawsData, maxFlawPoints, 
                (perks, flaws, pointsModifier) => {
                    this.characterState.updatePerksFlaws(perks, flaws, pointsModifier);
                }
            );
            
            // Subscribe to perks/flaws events
            this.eventBus.subscribe('perksFlaws:updated', data => {
                if (this.skillsUI) {
                    this.skillsUI.setMaxSkillPoints(data.adjustedSkillPoints.max);
                }
            });
        }
        
        // Initialize secondary traits UI
        const secondaryTraitsContainer = document.querySelector('#secondary-traits-tab');
        if (secondaryTraitsContainer) {
            this.secondaryTraitsUI = new SecondaryTraitsUI(secondaryTraitsContainer, {
                attributesManager: this.attributesUI?.getAttributeManager(),
                skillsManager: this.skillsUI?.getSkillManager(),
                onUpdate: (traits) => {
                    this.characterState.updateSecondaryTraits(traits);
                }
            });
            
            // Subscribe to armor updates
            this.eventBus.subscribe('armor:updated', armorPoints => {
                if (this.secondaryTraitsUI) {
                    this.secondaryTraitsUI.getTraitsManager().setArmorPoints(armorPoints);
                }
            });
        }
        
        this.setupTabNavigation();
    }

    updateSecondaryTraits() {
        if (this.secondaryTraitsUI) {
            const attributesManager = this.attributesUI?.getAttributeManager();
            const skillsManager = this.skillsUI?.getSkillManager();
            
            if (attributesManager && skillsManager) {
                this.secondaryTraitsUI.setAttributesManager(attributesManager);
                this.secondaryTraitsUI.setSkillsManager(skillsManager);
                this.secondaryTraitsUI.update();
            }
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Game setting selection
        const settingCards = document.querySelectorAll('.setting-card');
        if (settingCards.length) {
            settingCards.forEach(card => {
                card.addEventListener('click', () => {
                    const setting = card.dataset.setting;
                    
                    // Update selected class
                    settingCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    
                    // Update character setting
                    this.characterState.changeGameSetting(setting);
                });
            });
            
            // Subscribe to setting changes
            this.eventBus.subscribe('setting:changed', data => {
                if (this.attributesUI) {
                    this.attributesUI.setMaxCharacterPoints(data.characterPoints);
                }
                
                if (this.skillsUI) {
                    this.skillsUI.setMaxSkillPoints(data.skillPoints);
                }
                
                if (this.perksFlawsUI) {
                    const maxFlawPoints = gameSettings[data.setting].flawPoints;
                    this.perksFlawsUI.setMaxFlawPoints(maxFlawPoints);
                }
            });
        }
        
        // Save character button
        const saveBtn = document.getElementById('save-character');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Get character name
                const nameInput = document.getElementById('character-name');
                const name = nameInput ? nameInput.value.trim() : "";
                
                if (!name) {
                    this.showMessage("Please enter a character name", "error");
                    return;
                }
                
                // Update basic info
                this.characterState.updateBasic({
                    name: name,
                    concept: document.getElementById('character-concept')?.value || '',
                    faction: document.getElementById('character-faction')?.value || ''
                });
                
                // Save character
                if (this.characterState.saveCharacter()) {
                    this.showMessage(`Character "${name}" saved successfully`, "success");
                    this.loadSavedCharacters();
                } else {
                    this.showMessage(`Error saving character "${name}"`, "error");
                }
            });
        }
        
        // Load character button
        const loadBtn = document.getElementById('load-character');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                const select = document.getElementById('load-character-select');
                if (!select || !select.value) {
                    this.showMessage("Please select a character to load", "warning");
                    return;
                }
                
                if (this.characterState.loadSavedCharacter(select.value)) {
                    this.showMessage(`Character "${select.value}" loaded successfully`, "success");
                } else {
                    this.showMessage(`Error loading character "${select.value}"`, "error");
                }
            });
        }
        
        // Reset character button
        const resetBtn = document.getElementById('reset-character');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset the character? All unsaved changes will be lost.')) {
                    this.characterState.resetCharacter();
                    this.showMessage('Character reset to default values', 'info');
                }
            });
        }
        
        // Subscribe to character reset
        this.eventBus.subscribe('character:reset', () => {
            // Update all UI components
            if (this.attributesUI) this.attributesUI.resetAttributes();
            if (this.skillsUI) this.skillsUI.resetSkills();
            if (this.perksFlawsUI) this.perksFlawsUI.resetPerksFlaws();
            this.updateSecondaryTraits();
            
            // Reset form fields
            document.getElementById('character-name').value = '';
            document.getElementById('character-concept').value = '';
            document.getElementById('character-faction').value = '';
        });
        
        // Subscribe to character loaded
        this.eventBus.subscribe('character:loaded', state => {
            // Update UI elements with loaded data
            document.getElementById('character-name').value = state.basic.name || '';
            document.getElementById('character-concept').value = state.basic.concept || '';
            document.getElementById('character-faction').value = state.basic.faction || '';
            
            // Update game setting
            const settingCards = document.querySelectorAll('.setting-card');
            settingCards.forEach(card => {
                if (card.dataset.setting === state.setting) {
                    card.click(); // Trigger click to update UI
                }
            });
            
            // These will be updated through events
            if (this.attributesUI) this.attributesUI.setAttributeValues(state.attributes);
            if (this.skillsUI) this.skillsUI.setCharacterSkills(state.skills);
            if (this.perksFlawsUI) this.perksFlawsUI.setCharacterPerksFlaws(
                state.perksFlaws.perks, 
                state.perksFlaws.flaws
            );
        });
    }

    /**
     * Save the current character
     */
    saveCharacter() {
        // Get character name
        const nameInput = document.getElementById('character-name');
        const name = nameInput ? nameInput.value.trim() : "";
        
        if (!name) {
            this.showMessage("Please enter a character name", "error");
            return;
        }
        
        // Collect character data from all components
        this.updateCharacterData();
        
        // Create character object for saving
        const characterToSave = {
            ...this.character,
            name: name,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // Get existing saved characters
        const savedCharacters = JSON.parse(localStorage.getItem('jovianChroniclesCharacters') || '[]');
        
        // Check if character with same name exists
        const existingIndex = savedCharacters.findIndex(c => c.name === name);
        
        if (existingIndex !== -1) {
            // Confirm overwrite
            if (!confirm(`Character "${name}" already exists. Overwrite?`)) {
                return;
            }
            savedCharacters[existingIndex] = characterToSave;
        } else {
            // Add new character
            savedCharacters.push(characterToSave);
        }
        
        // Save to localStorage
        localStorage.setItem('jovianChroniclesCharacters', JSON.stringify(savedCharacters));
        
        this.showMessage(`Character "${name}" saved successfully`, "success");
        
        // Refresh character list
        this.loadSavedCharacters();
    }

    /**
     * Update character data from UI components
     */
    updateCharacterData() {
        // Get basic info
        const nameInput = document.getElementById('character-name');
        const conceptInput = document.getElementById('character-concept');
        const factionSelect = document.getElementById('character-faction');
        
        if (nameInput) this.character.basic.name = nameInput.value.trim();
        if (conceptInput) this.character.basic.concept = conceptInput.value.trim();
        if (factionSelect) this.character.basic.faction = factionSelect.value;
        
        // Get skills data if skillsUI is initialized
        if (this.skillsUI) {
            const skillsData = this.skillsUI.getCharacterData();
            this.character.skills = skillsData.skills;
        }
        
        // Get perks and flaws data
        if (this.perksFlawsUI) {
            const perksFlawsManager = this.perksFlawsUI.getPerksFlawsManager();
            this.character.perksFlaws = {
                perks: perksFlawsManager.getCharacterPerks(),
                flaws: perksFlawsManager.getCharacterFlaws()
            };
            
            // Update perksFlawsModifier
            const pointsAdjustment = perksFlawsManager.calculatePointsAdjustment();
            this.character.points.perksFlawsModifier = pointsAdjustment.netAdjustment;
        }
    }

    /**
     * Load saved characters into the select dropdown
     */
    loadSavedCharacters() {
        const selectElement = document.getElementById('load-character-select');
        if (!selectElement) return;
        
        // Clear select options except the default
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        
        // Get saved characters
        const savedCharacters = this.characterState.getSavedCharacters();
        
        // Add options for each saved character
        savedCharacters.forEach(character => {
            const option = document.createElement('option');
            option.value = character.name;
            option.textContent = character.name;
            
            // Add faction if available
            if (character.faction) {
                option.textContent += ` (${character.faction})`;
            }
            
            selectElement.appendChild(option);
        });
    }

    /**
     * Load a selected character
     */
    loadSelectedCharacter() {
        const selectElement = document.getElementById('load-character-select');
        if (!selectElement || !selectElement.value) {
            this.showMessage("Please select a character to load", "warning");
            return;
        }
        
        // Get saved characters
        const savedCharacters = JSON.parse(localStorage.getItem('jovianChroniclesCharacters') || '[]');
        const character = savedCharacters[selectElement.value];
        
        if (!character) {
            this.showMessage("Character not found", "error");
            return;
        }
        
        // Update the character object
        this.character = { ...character };
        
        // Update the UI components
        this.updateUIFromCharacter();
        
        this.showMessage(`Character "${character.name}" loaded successfully`, "success");
    }

    /**
     * Update UI components from character data
     */
    updateUIFromCharacter() {
        console.info('Updating UI from character data');
        // Update basic info
        const nameInput = document.getElementById('character-name');
        const conceptInput = document.getElementById('character-concept');
        const factionSelect = document.getElementById('character-faction');
        
        if (nameInput) nameInput.value = this.character.basic.name || "";
        if (conceptInput) conceptInput.value = this.character.basic.concept || "";
        if (factionSelect) factionSelect.value = this.character.basic.faction || "";
        
        // Update game setting
        const settingCards = document.querySelectorAll('.setting-card');
        if (settingCards.length && this.character.setting) {
            settingCards.forEach(card => {
                card.classList.remove('selected');
                if (card.dataset.setting === this.character.setting) {
                    card.classList.add('selected');
                }
            });
        }
        
        // Update skills component
        if (this.skillsUI && this.character.skills) {
            this.skillsUI.setCharacterData({
                skills: this.character.skills,
                maxSkillPoints: this.gameSettings[this.character.setting].skillPoints + this.character.points.perksFlawsModifier
            });
        }
        
        // Update perks and flaws
        if (this.perksFlawsUI && this.character.perksFlaws) {
            this.perksFlawsUI.getPerksFlawsManager().setCharacterPerksFlaws(
                this.character.perksFlaws.perks,
                this.character.perksFlaws.flaws
            );
        }
    }

    /**
     * Show a message to the user
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, warning, info)
     */
    showMessage(message, type = "info") {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(notification);
        });
        
        notification.appendChild(closeBtn);
        
        // Add to body
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Show an error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.showMessage(message, "error");
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');

        console.log('Tab buttons:', tabButtons);
        console.log('Tab panes:', tabPanes);

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // Add active class to the clicked button and corresponding pane
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                const targetPane = document.getElementById(`${tabId}-tab`);
                if (targetPane) {
                    targetPane.classList.add('active');
                } else {
                    console.error(`Tab pane with ID '${tabId}-tab' not found.`);
                }

                // Trigger updates for the corresponding UI component
                if (tabId === 'attributes' && this.attributesUI) {
                    this.attributesUI.update();
                } else if (tabId === 'skills' && this.skillsUI) {
                    this.skillsUI.update();
                } else if (tabId === 'perks-flaws' && this.perksFlawsUI) {
                    this.perksFlawsUI.updateUI();
                } else if (tabId === 'secondary-traits' && this.secondaryTraitsUI) {
                    this.secondaryTraitsUI.update();
                }
            });
        });
    }

    updateActiveTab(tabId) {
        // Update tab-specific content
        switch(tabId) {
            case 'attributes':
                if (this.attributesUI) this.attributesUI.update();
                break;
            case 'skills':
                if (this.skillsUI) this.skillsUI.update();
                break;
            case 'perks-flaws':
                if (this.perksFlawsUI) this.perksFlawsUI.update();
                break;
            case 'secondary-traits':
                if (this.secondaryTraitsUI) this.secondaryTraitsUI.update();
                break;
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jovianApp = new JovianCharacterCreator();
});