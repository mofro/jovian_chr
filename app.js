// Jovian Chronicles Character Creator - Main Application
// This app handles attributes, secondary traits and integration with the skills module

import { initializeSkills, getCharacterSkills, setCharacterSkills } from './skillsUI.js';

// Define the attributes and their initial values
const attributes = {
  AGI: 0, // Agility
  APP: 0, // Appearance
  BLD: 0, // Build
  CRE: 0, // Creativity
  FIT: 0, // Fitness
  INF: 0, // Influence
  KNO: 0, // Knowledge
  PER: 0, // Perception
  PSY: 0, // Psyche
  WIL: 0  // Willpower
};

// Define the character points
const maxCharacterPoints = 50;
let usedCharacterPoints = 0;

// Define the secondary traits calculation functions
function calculateSecondaryTraits() {
  const secondaryTraits = {};
  
  // Strength = (Build + Fitness) / 2, round towards zero
  secondaryTraits.STR = Math.trunc((attributes.BLD + attributes.FIT) / 2);
  
  // Health = (Fitness + Psyche + Willpower) / 3, round off
  secondaryTraits.HLT = Math.round((attributes.FIT + attributes.PSY + attributes.WIL) / 3);
  
  // Stamina = (5 x (Build + Health)) + 25, minimum 1
  secondaryTraits.STA = Math.max(1, (5 * (attributes.BLD + secondaryTraits.HLT)) + 25);
  
  // Find Hand-to-Hand skill level from the skills module
  const characterSkills = getCharacterSkills();
  const handToHandSkill = characterSkills.find(skill => skill.name === "Hand-to-hand");
  const handToHandLevel = handToHandSkill ? handToHandSkill.level : 0;
  
  // Unarmed Damage = 3 + Strength + Build + Hand-to-Hand Skill level, minimum 1
  secondaryTraits.UnarmedDMG = Math.max(1, 3 + secondaryTraits.STR + attributes.BLD + handToHandLevel);
  
  return secondaryTraits;
}

// Function to update the UI with the current character state
function updateUI() {
  // Update attribute displays
  for (const attr in attributes) {
    const element = document.getElementById(`${attr.toLowerCase()}-value`);
    if (element) {
      element.textContent = attributes[attr];
    }
  }
  
  // Update points used displays
  document.getElementById('character-points-used').textContent = `${usedCharacterPoints}/${maxCharacterPoints}`;
  
  // Update secondary traits
  const secondaryTraits = calculateSecondaryTraits();
  for (const trait in secondaryTraits) {
    const element = document.getElementById(`${trait.toLowerCase()}-value`);
    if (element) {
      element.textContent = secondaryTraits[trait];
    }
  }
}

// Function to increase an attribute
function increaseAttribute(attr) {
  if (usedCharacterPoints < maxCharacterPoints && attributes[attr] < 3) {
    // Special case for BLD which can go up to +5
    if (attr === 'BLD' && attributes[attr] < 5) {
      attributes[attr]++;
      usedCharacterPoints++;
    } else if (attr !== 'BLD') {
      attributes[attr]++;
      usedCharacterPoints++;
    }
    updateUI();
  }
}

// Function to decrease an attribute
function decreaseAttribute(attr) {
  if (attributes[attr] > -3) {
    // Special case for BLD which can go down to -5
    if (attr === 'BLD' && attributes[attr] > -5) {
      attributes[attr]--;
      usedCharacterPoints--;
    } else if (attr !== 'BLD' && attributes[attr] > -3) {
      attributes[attr]--;
      usedCharacterPoints--;
    }
    updateUI();
  }
}

// Function to save character data (to localStorage for now)
function saveCharacter() {
  const characterName = document.getElementById('character-name').value;
  if (!characterName) {
    alert('Please enter a character name');
    return;
  }
  
  const character = {
    name: characterName,
    attributes: { ...attributes },
    skills: getCharacterSkills(),
    secondaryTraits: calculateSecondaryTraits(),
    characterPoints: {
      max: maxCharacterPoints,
      used: usedCharacterPoints
    }
  };
  
  const savedCharacters = JSON.parse(localStorage.getItem('jovianChroniclesCharacters') || '[]');
  savedCharacters.push(character);
  localStorage.setItem('jovianChroniclesCharacters', JSON.stringify(savedCharacters));
  
  alert(`Character ${characterName} saved!`);
  
  // Refresh the character select dropdown
  loadSavedCharacters();
}

// Function to load saved characters
function loadSavedCharacters() {
  const savedCharacters = JSON.parse(localStorage.getItem('jovianChroniclesCharacters') || '[]');
  const selectElement = document.getElementById('load-character-select');
  
  selectElement.innerHTML = '<option value="">Select a character</option>';
  
  savedCharacters.forEach((character, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = character.name;
    selectElement.appendChild(option);
  });
}

// Function to load a specific character
function loadCharacter() {
  const selectElement = document.getElementById('load-character-select');
  const index = selectElement.value;
  
  if (!index) return;
  
  const savedCharacters = JSON.parse(localStorage.getItem('jovianChroniclesCharacters') || '[]');
  const character = savedCharacters[index];
  
  if (character) {
    document.getElementById('character-name').value = character.name;
    
    // Load attributes
    for (const attr in character.attributes) {
      attributes[attr] = character.attributes[attr];
    }
    
    // Load skills using the new module
    setCharacterSkills(character.skills);
    
    // Load character points
    usedCharacterPoints = character.characterPoints.used;
    
    updateUI();
  }
}

// Set up attribute button event listeners
function setupAttributeButtons() {
  // For each attribute, set up increase/decrease buttons
  for (const attr in attributes) {
    const increaseBtn = document.getElementById(`${attr.toLowerCase()}-increase`);
    const decreaseBtn = document.getElementById(`${attr.toLowerCase()}-decrease`);
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => increaseAttribute(attr));
    }
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => decreaseAttribute(attr));
    }
  }
}

// Set up save/load buttons
function setupSaveLoadButtons() {
  const saveButton = document.getElementById('save-button');
  const loadButton = document.getElementById('load-button');
  
  if (saveButton) {
    saveButton.addEventListener('click', saveCharacter);
  }
  
  if (loadButton) {
    loadButton.addEventListener('click', loadCharacter);
  }
}

// Initialize the application
async function init() {
  // Set initial values
  for (const attr in attributes) {
    attributes[attr] = 0;
  }
  usedCharacterPoints = 0;
  
  // Set up UI event listeners
  setupAttributeButtons();
  setupSaveLoadButtons();
  
  // Update the attributes UI
  updateUI();
  
  // Initialize skills module
  await initializeSkills();
  
  // Load any saved characters
  loadSavedCharacters();
  
  console.log("Jovian Chronicles Character Creator initialized");
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
