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

// Define attribute descriptions
const attributeDescriptions = {
  AGI: "Physical coordination and dexterity",
  APP: "Physical attractiveness and presence",
  BLD: "Physical size and mass (-5 to +5)",
  CRE: "Mental agility and problem-solving",
  FIT: "Physical endurance and health",
  INF: "Leadership and diplomatic abilities",
  KNO: "Education and memory",
  PER: "Awareness of surroundings",
  PSY: "Mental stability and emotional resilience",
  WIL: "Mental fortitude and determination"
};

// Define the character points
const maxCharacterPoints = 50;
let usedCharacterPoints = 0;

// Character portrait
let characterPortrait = null;

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
  document.getElementById('character-points-used').textContent = `${usedCharacterPoints}/${maxCharacterPoints} Points`;
  
  // Update secondary traits
  const secondaryTraits = calculateSecondaryTraits();
  for (const trait in secondaryTraits) {
    const element = document.getElementById(`${trait.toLowerCase()}-value`);
    if (element) {
      element.textContent = secondaryTraits[trait];
    }
  }
  
  // Update faction badge based on selection
  updateFactionBadge();
}

// Function to increase an attribute
function increaseAttribute(attr) {
  const maxValue = attr === 'BLD' ? 5 : 3; // Build can go up to +5, others to +3
  
  if (usedCharacterPoints < maxCharacterPoints && attributes[attr] < maxValue) {
    attributes[attr]++;
    usedCharacterPoints++;
    updateUI();
  } else if (attributes[attr] >= maxValue) {
    showNotification(`${attr} cannot exceed +${maxValue}`);
  } else {
    showNotification("Not enough character points remaining");
  }
}

// Function to decrease an attribute
function decreaseAttribute(attr) {
  const minValue = attr === 'BLD' ? -5 : -3; // Build can go down to -5, others to -3
  
  if (attributes[attr] > minValue) {
    attributes[attr]--;
    usedCharacterPoints--;
    updateUI();
  } else {
    showNotification(`${attr} cannot be lower than ${minValue}`);
  }
}

// Simple notification system
function showNotification(message, type = 'info') {
  // Check if notification container exists, create if not
  let notificationContainer = document.getElementById('notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '1000';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.backgroundColor = type === 'error' ? 'var(--error-color)' : 'var(--secondary-color)';
  notification.style.color = 'white';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '4px';
  notification.style.marginBottom = '10px';
  notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  notification.style.transition = 'all 0.3s ease';
  notification.textContent = message;
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Remove after timeout
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notificationContainer.removeChild(notification);
    }, 300);
  }, 3000);
}

// Function to save character data
function saveCharacter() {
  const characterName = document.getElementById('character-name').value;
  const characterConcept = document.getElementById('character-concept').value;
  const characterFaction = document.getElementById('character-faction').value;
  
  if (!characterName) {
    showNotification('Please enter a character name', 'error');
    return;
  }
  
  const character = {
    name: characterName,
    concept: characterConcept,
    faction: characterFaction,
    portrait: characterPortrait,
    attributes: { ...attributes },
    skills: getCharacterSkills(),
    secondaryTraits: calculateSecondaryTraits(),
    characterPoints: {
      max: maxCharacterPoints,
      used: usedCharacterPoints
    }
  };
  
  const savedCharacters = JSON.parse(localStorage.getItem('jovianChroniclesCharacters') || '[]');
  
  // Check if character with same name exists
  const existingIndex = savedCharacters.findIndex(char => char.name === characterName);
  
  if (existingIndex >= 0) {
    if (confirm(`A character named "${characterName}" already exists. Do you want to overwrite it?`)) {
      savedCharacters[existingIndex] = character;
    } else {
      return;
    }
  } else {
    savedCharacters.push(character);
  }
  
  localStorage.setItem('jovianChroniclesCharacters', JSON.stringify(savedCharacters));
  
  showNotification(`Character ${characterName} saved!`);
  
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
    // Load basic info
    document.getElementById('character-name').value = character.name || '';
    document.getElementById('character-concept').value = character.concept || '';
    document.getElementById('character-faction').value = character.faction || '';
    
    // Load portrait if exists
    characterPortrait = character.portrait;
    if (characterPortrait) {
      const portraitElement = document.querySelector('.character-portrait');
      portraitElement.style.backgroundImage = `url(${characterPortrait})`;
      portraitElement.style.backgroundSize = 'cover';
      portraitElement.style.backgroundPosition = 'center';
      document.querySelector('.portrait-placeholder').style.display = 'none';
    }
    
    // Load attributes
    for (const attr in character.attributes) {
      attributes[attr] = character.attributes[attr];
    }
    
    // Load skills using the skills module
    setCharacterSkills(character.skills);
    
    // Load character points
    usedCharacterPoints = character.characterPoints.used;
    
    // Update UI
    updateUI();
    
    showNotification(`Character ${character.name} loaded!`);
  }
}

// Function to update faction badge based on selection
function updateFactionBadge() {
  const factionSelect = document.getElementById('character-faction');
  const factionBadge = document.getElementById('faction-badge');
  
  if (factionSelect && factionBadge) {
    const selectedIndex = factionSelect.selectedIndex;
    
    if (selectedIndex > 0) {
      const selectedText = factionSelect.options[selectedIndex].text;
      factionBadge.textContent = selectedText;
    } else {
      factionBadge.textContent = 'Unaffiliated';
    }
  }
}

// Setup portrait upload functionality
function setupPortraitUpload() {
  const uploadButton = document.getElementById('upload-portrait-btn');
  
  if (uploadButton) {
    uploadButton.addEventListener('click', function() {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      
      fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          
          reader.onload = function(event) {
            characterPortrait = event.target.result;
            const portraitElement = document.querySelector('.character-portrait');
            portraitElement.style.backgroundImage = `url(${characterPortrait})`;
            portraitElement.style.backgroundSize = 'cover';
            portraitElement.style.backgroundPosition = 'center';
            
            // Hide placeholder text
            document.querySelector('.portrait-placeholder').style.display = 'none';
          };
          
          reader.readAsDataURL(e.target.files[0]);
        }
      });
      
      fileInput.click();
    });
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

// Set up faction change listener
function setupFactionSelect() {
  const factionSelect = document.getElementById('character-faction');
  
  if (factionSelect) {
    factionSelect.addEventListener('change', updateFactionBadge);
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
  setupPortraitUpload();
  setupFactionSelect();
  
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
