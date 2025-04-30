/**
 * File: js/app.js
 * Main application script for the Jovian Chronicles Character Creator
 */

import SkillsUI from './skillsUI.js';

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
        // Character data
        this.character = {
            basic: {
                name: "",
                concept: "",
                faction: ""
            },
            attributes: {},
            skills: [],
            secondaryTraits: {},
            perksFlaws: [],
            setting: "adventurous"
        };
        
        // UI components
        this.skillsUI = null;
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Load data files
            const skillsData = await this.loadJSON('data/skills.json');
            const perksFlawsData = await this.loadJSON('data/perks-flaws.json');
            
            // Initialize components once data is loaded
            this.initializeComponents(skillsData, perksFlawsData);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load any saved characters
            this.loadSavedCharacters();
            
            console.log("Jovian Chronicles Character Creator initialized successfully");
        } catch (error) {
            console.error("Error initializing application:", error);
            this.showError("Failed to initialize application. Please refresh the page.");
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
     * Initialize UI components
     * @param {Object} skillsData - Skills data
     * @param {Object} perksFlawsData - Perks and flaws data
     */
    initializeComponents(skillsData, perksFlawsData) {
        // Initialize skills UI
        const skillsContainer = document.getElementById('skills-section');
        if (skillsContainer) {
            this.skillsUI = new SkillsUI(
                skillsContainer, 
                skillsData, 
                perksFlawsData,
                gameSettings[this.character.setting].skillPoints
            );
        }
        
        // Initialize other components (attributes, secondary traits, etc.)
        // This will be implemented in future phases
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
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jovianApp = new JovianCharacterCreator();
});
