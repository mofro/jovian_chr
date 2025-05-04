/**
 * File: js/characterState.js
 * Central state management for the Jovian Chronicles Character Creator
 */

export class CharacterState {
    /**
     * Initialize the CharacterState
     * @param {Object} eventBus - EventBus instance for communication
     * @param {Object} gameSettings - Game settings with power levels
     */
    constructor(eventBus, gameSettings) {
        this.eventBus = eventBus;
        this.gameSettings = gameSettings;
        
        // Initialize with default adventurous game
        const defaultSetting = 'adventurous';
        
        // Initialize state with default values
        this.state = {
            basic: {
                name: '',
                concept: '',
                faction: ''
            },
            setting: defaultSetting,
            attributes: {
                AGI: 0, APP: 0, BLD: 0, CRE: 0, FIT: 0,
                INF: 0, KNO: 0, PER: 0, PSY: 0, WIL: 0
            },
            skills: [],
            perksFlaws: {
                perks: [],
                flaws: []
            },
            points: {
                characterPoints: {
                    used: 0,
                    max: gameSettings[defaultSetting].characterPoints
                },
                skillPoints: {
                    used: 0,
                    max: gameSettings[defaultSetting].skillPoints
                },
                perksFlawsModifier: 0
            },
            secondaryTraits: {}
        };
    }
    
    /**
     * Get the entire character state
     * @returns {Object} Complete character state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Update basic character information
     * @param {Object} basicInfo - Basic character info (name, concept, faction)
     */
    updateBasic(basicInfo) {
        this.state.basic = { ...this.state.basic, ...basicInfo };
        this.eventBus.publish('basic:updated', this.state.basic);
    }
    
    /**
     * Change game setting (Gritty, Adventurous, Cinematic)
     * @param {string} setting - Game setting key
     */
    changeGameSetting(setting) {
        if (!this.gameSettings[setting]) return;
        
        this.state.setting = setting;
        
        // Update point limits based on new setting
        this.state.points.characterPoints.max = this.gameSettings[setting].characterPoints;
        this.state.points.skillPoints.max = this.gameSettings[setting].skillPoints;
        
        this.eventBus.publish('setting:changed', {
            setting,
            characterPoints: this.state.points.characterPoints.max,
            skillPoints: this.state.points.skillPoints.max
        });
    }
    
    /**
     * Update character attributes
     * @param {Object} attributes - Character attributes
     * @param {number} usedPoints - Character points used
     */
    updateAttributes(attributes, usedPoints) {
        this.state.attributes = { ...attributes };
        this.state.points.characterPoints.used = usedPoints;
        
        this.eventBus.publish('attributes:updated', {
            attributes: this.state.attributes,
            points: this.state.points.characterPoints
        });
    }
    
    /**
     * Update character skills
     * @param {Array} skills - Character skills
     * @param {number} usedPoints - Skill points used
     */
    updateSkills(skills, usedPoints) {
        this.state.skills = [...skills];
        this.state.points.skillPoints.used = usedPoints;
        
        this.eventBus.publish('skills:updated', {
            skills: this.state.skills,
            points: this.state.points.skillPoints
        });
    }
    
    /**
     * Update perks and flaws
     * @param {Array} perks - Character perks
     * @param {Array} flaws - Character flaws
     * @param {number} pointsModifier - Net skill points adjustment
     */
    updatePerksFlaws(perks, flaws, pointsModifier) {
        this.state.perksFlaws.perks = [...perks];
        this.state.perksFlaws.flaws = [...flaws];
        this.state.points.perksFlawsModifier = pointsModifier;
        
        // Calculate adjusted skill points max
        const baseMax = this.gameSettings[this.state.setting].skillPoints;
        const adjustedMax = baseMax + pointsModifier;
        this.state.points.skillPoints.max = adjustedMax;
        
        this.eventBus.publish('perksFlaws:updated', {
            perks: this.state.perksFlaws.perks,
            flaws: this.state.perksFlaws.flaws,
            pointsModifier: pointsModifier,
            adjustedSkillPoints: this.state.points.skillPoints
        });
    }
    
    /**
     * Update secondary traits
     * @param {Object} traits - Secondary traits
     */
    updateSecondaryTraits(traits) {
        this.state.secondaryTraits = { ...traits };
        this.eventBus.publish('secondaryTraits:updated', this.state.secondaryTraits);
    }
    
    /**
     * Set character armor points
     * @param {number} armorPoints - Armor points
     */
    setArmorPoints(armorPoints) {
        if (!this.state.secondaryTraits) {
            this.state.secondaryTraits = {};
        }
        
        this.state.secondaryTraits.armorPoints = armorPoints;
        this.eventBus.publish('armor:updated', armorPoints);
    }
    
    /**
     * Get used and maximum character points
     * @returns {Object} Character points info
     */
    getCharacterPoints() {
        return { ...this.state.points.characterPoints };
    }
    
    /**
     * Get used and maximum skill points (adjusted for perks/flaws)
     * @returns {Object} Skill points info
     */
    getSkillPoints() {
        return { ...this.state.points.skillPoints };
    }
    
    /**
     * Get perks and flaws skill point modifier
     * @returns {number} Points modifier
     */
    getPerksFlawsModifier() {
        return this.state.points.perksFlawsModifier;
    }
    
    /**
     * Save character to localStorage
     * @param {boolean} autoSave - Whether this is an auto-save
     * @returns {boolean} Whether the save was successful
     */
    saveCharacter(autoSave = false) {
        try {
            // Ensure character has a name for non-auto saves
            if (!autoSave && !this.state.basic.name) {
                return false;
            }
            
            const timestamp = new Date().toISOString();
            const character = {
                ...this.state,
                lastModified: timestamp
            };
            
            if (autoSave) {
                localStorage.setItem('jovianChronicles_autoSave', JSON.stringify(character));
            } else {
                // Get existing saved characters
                const savedCharacters = JSON.parse(localStorage.getItem('jovianChronicles_characters') || '[]');
                
                // Check if character with same name exists
                const existingIndex = savedCharacters.findIndex(c => c.basic.name === this.state.basic.name);
                
                if (existingIndex !== -1) {
                    // Update existing character
                    savedCharacters[existingIndex] = character;
                } else {
                    // Add new character
                    character.created = timestamp;
                    savedCharacters.push(character);
                }
                
                // Save to localStorage
                localStorage.setItem('jovianChronicles_characters', JSON.stringify(savedCharacters));
                
                this.eventBus.publish('character:saved', {
                    name: this.state.basic.name,
                    timestamp
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error saving character:', error);
            return false;
        }
    }
    
    /**
     * Load character from saved data
     * @param {Object} characterData - Character data to load
     * @returns {boolean} Whether the load was successful
     */
    loadCharacter(characterData) {
        try {
            if (!characterData) return false;
            
            // Update state with loaded data
            this.state = {
                ...characterData,
                // Ensure points structure is correct
                points: {
                    ...this.state.points,
                    ...characterData.points
                }
            };
            
            // Publish events for all components
            this.eventBus.publish('character:loaded', this.state);
            this.eventBus.publish('basic:updated', this.state.basic);
            this.eventBus.publish('attributes:updated', {
                attributes: this.state.attributes,
                points: this.state.points.characterPoints
            });
            this.eventBus.publish('skills:updated', {
                skills: this.state.skills,
                points: this.state.points.skillPoints
            });
            this.eventBus.publish('perksFlaws:updated', {
                perks: this.state.perksFlaws.perks,
                flaws: this.state.perksFlaws.flaws,
                pointsModifier: this.state.points.perksFlawsModifier,
                adjustedSkillPoints: this.state.points.skillPoints
            });
            this.eventBus.publish('secondaryTraits:updated', this.state.secondaryTraits);
            
            return true;
        } catch (error) {
            console.error('Error loading character:', error);
            return false;
        }
    }
    
    /**
     * Get list of saved characters
     * @returns {Array} List of saved characters (basic info only)
     */
    getSavedCharacters() {
        try {
            const savedCharacters = JSON.parse(localStorage.getItem('jovianChronicles_characters') || '[]');
            
            // Return just the basic info and timestamps
            return savedCharacters.map(char => ({
                name: char.basic.name,
                concept: char.basic.concept,
                faction: char.basic.faction,
                created: char.created,
                lastModified: char.lastModified
            }));
        } catch (error) {
            console.error('Error getting saved characters:', error);
            return [];
        }
    }
    
    /**
     * Load a specific saved character by name
     * @param {string} characterName - Character name to load
     * @returns {boolean} Whether the load was successful
     */
    loadSavedCharacter(characterName) {
        try {
            const savedCharacters = JSON.parse(localStorage.getItem('jovianChronicles_characters') || '[]');
            const character = savedCharacters.find(c => c.basic.name === characterName);
            
            if (!character) return false;
            
            return this.loadCharacter(character);
        } catch (error) {
            console.error('Error loading saved character:', error);
            return false;
        }
    }
    
    /**
     * Reset character to initial state
     */
    resetCharacter() {
        // Re-initialize with current setting
        const currentSetting = this.state.setting;
        
        this.state = {
            basic: {
                name: '',
                concept: '',
                faction: ''
            },
            setting: currentSetting,
            attributes: {
                AGI: 0, APP: 0, BLD: 0, CRE: 0, FIT: 0,
                INF: 0, KNO: 0, PER: 0, PSY: 0, WIL: 0
            },
            skills: [],
            perksFlaws: {
                perks: [],
                flaws: []
            },
            points: {
                characterPoints: {
                    used: 0,
                    max: this.gameSettings[currentSetting].characterPoints
                },
                skillPoints: {
                    used: 0,
                    max: this.gameSettings[currentSetting].skillPoints
                },
                perksFlawsModifier: 0
            },
            secondaryTraits: {}
        };
        
        this.eventBus.publish('character:reset', this.state);
    }
}