/**
 * File: js/app.js
 * Main application script for the Jovian Chronicles Character Creator
 */

import SkillsUI from './skillsUI.js';
import AttributesUI from './attributesUI.js';
import AttributeManager from './attributeManager.js';
import SkillManager from './skillManager.js';
import PerksFlawsUI from './perksFlawsUI.js';
import SecondaryTraitsUI from './secondaryTraitsUI.js'; // Added import for SecondaryTraitsUI

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
        this.managers = {}; // Initialize managers object
        this.skillsData = null; // Placeholder for skills data
        this.perksFlawsData = null;
        // Assign gameSettings to this.gameSettings
        this.gameSettings = gameSettings;

        // Initialize character object with default values
        this.character = {
            setting: 'adventurous', // Default to 'adventurous' setting
            attributes: {},
            skills: [],
            perksFlaws: {
                perks: [],
                flaws: []
            },
            points: {
                characterPoints: {
                    used: 0,
                    max: 30 // Default for 'adventurous' setting
                },
                skillPoints: {
                    used: 0,
                    max: 50 // Default for 'adventurous' setting
                },
                perksFlawsModifier: 0
            },
            secondaryTraits: {}
        };

        // Bind methods to ensure correct `this` context
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
        this.initUI = this.initUI.bind(this);
        this.createManagers = this.createManagers.bind(this);
        this.createAttributesUI = this.createAttributesUI.bind(this);
        this.createSkillsUI = this.createSkillsUI.bind(this);
        this.createPerksFlawsUI = this.createPerksFlawsUI.bind(this);
        this.createSecondaryTraitsUI = this.createSecondaryTraitsUI.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.setupTabNavigation = this.setupTabNavigation.bind(this);

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

            console.log('Data loaded successfully:', this.skillsData); // Debugging log

            // Initialize managers
            this.createManagers();

            console.log('Managers created successfully:', this.managers); // Debugging log

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
            const skillsResponse = await fetch('data/skills.json');
            const skillsData = await skillsResponse.json();

            if (!skillsData || !Array.isArray(skillsData.skills)) {
                throw new Error('Invalid skills data format');
            }

            this.skillsData = skillsData; // Ensure skillsData is correctly assigned
            console.log('Loaded skillsData:', this.skillsData); // Debugging log

            const perksFlawsResponse = await fetch('data/perks-flaws.json');
            this.perksFlawsData = await perksFlawsResponse.json();

            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }

    initUI() {
        console.log('Initializing UI components...');
        this.createAttributesUI();
        console.log('AttributesUI initialized.');
        this.createSkillsUI();
        console.log('SkillsUI initialized.');
        this.createPerksFlawsUI();
        console.log('PerksFlawsUI initialized.');
        this.createSecondaryTraitsUI();
        console.log('SecondaryTraitsUI initialized.');
        this.setupTabNavigation();
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
                    // Update selected class
                    settingCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    
                    // Update character setting
                    const setting = card.dataset.setting;
                    this.character.setting = setting;
                    
                    // Update skill points if SkillsUI is initialized
                    if (this.skillsUI) {
                        this.skillsUI.setCharacterData({
                            maxSkillPoints: gameSettings[setting].skillPoints
                        });
                    }
                });
            });
        }
        
        // Save character button
        const saveBtn = document.getElementById('save-character');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCharacter());
        }
        
        // Load character button
        const loadBtn = document.getElementById('load-character');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadSelectedCharacter());
        }
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
        
        // Other components will be added in future phases
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
        const savedCharacters = JSON.parse(localStorage.getItem('jovianChroniclesCharacters') || '[]');
        
        // Add options for each saved character
        savedCharacters.forEach((character, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = character.name;
            
            // Add faction if available
            if (character.basic && character.basic.faction) {
                option.textContent += ` (${character.basic.faction})`;
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
                maxSkillPoints: gameSettings[this.character.setting].skillPoints
            });
        }
        
        // Other components will be added in future phases
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

    changeGameSetting(setting) {
        if (!this.gameSettings[setting]) return;

        this.character.setting = setting;

        // Update character points
        const newCharacterPoints = this.gameSettings[setting].characterPoints;
        this.managers.attributes.setMaxCharacterPoints(newCharacterPoints);

        // Update skill points
        const newSkillPoints = this.gameSettings[setting].skillPoints;
        this.managers.skills.setMaxSkillPoints(newSkillPoints);

        // Notify UI components
        this.updateUI();
    }

    updateUI() {
        if (this.attributesUI) this.attributesUI.update();
        if (this.skillsUI) this.skillsUI.update();
        if (this.perksFlawsUI) this.perksFlawsUI.update();
        if (this.secondaryTraitsUI) this.secondaryTraitsUI.update();
    }

    createManagers() {
        if (!this.skillsData || !Array.isArray(this.skillsData.skills)) {
            console.error('Invalid skills data: skillsData.skills must be an array.');
            return;
        }

        console.log('Initializing SkillsStore with skillsData:', this.skillsData); // Debugging log

        this.managers.skills = new SkillManager({
            skillsData: this.skillsData,
            maxSkillPoints: this.gameSettings[this.character.setting].skillPoints,
            onUpdate: () => {
                const skillsForTraits = this.managers.skills.getSkillsForTraits();
                this.managers.secondaryTraits.updateSkills(skillsForTraits);

                const points = this.managers.skills.getSkillPoints();
                this.character.points.skillPoints.used = points.used;

                const adjustedMax = this.character.points.skillPoints.max + this.character.points.perksFlawsModifier;
                if (adjustedMax !== points.max) {
                    this.managers.skills.setMaxSkillPoints(adjustedMax);
                }
            }
        });

        console.log('SkillsManager initialized:', this.managers.skills); // Debugging log
    }

    createAttributesUI() {
        const attributesContainer = document.querySelector('.attributes-container');
        if (!attributesContainer) {
            console.error('Attributes container not found in the DOM.');
            return;
        }

        this.attributesUI = new AttributesUI(attributesContainer, {
            maxCharacterPoints: this.gameSettings[this.character.setting].characterPoints,
            onUpdate: (attributes, usedPoints) => {
                this.character.attributes = attributes;
                this.character.points.characterPoints.used = usedPoints;

                if (this.managers.secondaryTraits) {
                    this.managers.secondaryTraits.updateAttributes(attributes);
                }
            }
        });

        console.log('AttributesUI initialized:', this.attributesUI);
    }

    createSkillsUI() {
        const skillsContainer = document.querySelector('.skills-container');
        if (!skillsContainer) {
            console.error('Skills container not found in the DOM.');
            return;
        }

        console.log('Initializing SkillsUI with SkillsStore:', this.managers.skills.skillsStore); // Debugging log

        this.skillsUI = new SkillsUI(skillsContainer, {
            skillsStore: this.managers.skills.skillsStore, // Pass the SkillsStore directly
            maxSkillPoints: this.gameSettings[this.character.setting].skillPoints,
            onUpdate: () => {
                const points = this.skillsUI.skillsStore.getSkillPoints();
                this.character.points.skillPoints.used = points.used;

                if (this.managers.secondaryTraits) {
                    const skillsForTraits = this.skillsUI.skillsStore.getSkillsForTraits();
                    this.managers.secondaryTraits.updateSkills(skillsForTraits);
                }
            }
        });

        console.log('SkillsUI initialized:', this.skillsUI);
    }

    createPerksFlawsUI() {
        const perksFlawsContainer = document.querySelector('#perks-flaws-container');
        if (!perksFlawsContainer) {
            console.error('Perks & Flaws container not found in the DOM.');
            return;
        }

        this.perksFlawsUI = new PerksFlawsUI(perksFlawsContainer, this.perksFlawsData, this.gameSettings[this.character.setting].flawPoints, () => {
            const pointsAdjustment = this.perksFlawsUI.perksFlawsManager.calculatePointsAdjustment();
            this.character.points.perksFlawsModifier = pointsAdjustment.netAdjustment;

            // Update skill points based on perks and flaws adjustment
            const adjustedMax = this.character.points.skillPoints.max + this.character.points.perksFlawsModifier;
            this.managers.skills.setMaxSkillPoints(adjustedMax);

            console.log('Perks & Flaws updated:', pointsAdjustment);
        });

        console.log('PerksFlawsUI initialized:', this.perksFlawsUI);
    }

    createSecondaryTraitsUI() {
        const secondaryTraitsContainer = document.querySelector('.secondary-traits-container');
        if (!secondaryTraitsContainer) {
            console.error('Secondary traits container not found in the DOM.');
            return;
        }

        this.secondaryTraitsUI = new SecondaryTraitsUI(secondaryTraitsContainer, {
            attributesManager: this.managers.attributes,
            skillsManager: this.managers.skills,
            onUpdate: () => {
                const traits = this.secondaryTraitsUI.getSecondaryTraits();
                console.log('Updated secondary traits:', traits);
            }
        });

        console.log('SecondaryTraitsUI initialized:', this.secondaryTraitsUI);
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
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jovianApp = new JovianCharacterCreator();
});
