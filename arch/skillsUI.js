// skillsUI.js - UI component for skills, perks, and flaws selection

import SkillManager from './skillManager.js';

/**
 * Class to manage the UI for skills, perks, and flaws selection
 */
class SkillsUI {
  constructor(containerElement, skillsData, perksFlawsData, maxSkillPoints) {
    this.containerElement = containerElement;
    this.skillManager = new SkillManager(skillsData, perksFlawsData, maxSkillPoints);
    
    // UI elements
    this.skillPointsDisplay = null;
    this.categoryFilter = null;
    this.searchInput = null;
    this.showDescriptionsCheckbox = null;
    this.showSpecializationsCheckbox = null;
    this.skillListElement = null;
    this.perkListElement = null;
    this.flawListElement = null;
    
    // Initialize UI
    this.initializeUI();
  }
  
  /**
   * Initialize the skills UI
   */
  initializeUI() {
    // Create UI structure
    this.createUIStructure();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Render initial lists
    this.renderSkillList();
    this.renderPerksList();
    this.renderFlawsList();
    this.updatePointsDisplay();
  }
  
  /**
   * Create the UI structure
   */
  createUIStructure() {
    // Main sections
    const skillsSection = document.createElement('div');
    skillsSection.className = 'section';
    
    // Points tracker
    const pointsTracker = document.createElement('div');
    pointsTracker.className = 'points-tracker';
    
    const pointsLabel = document.createElement('div');
    pointsLabel.textContent = 'Skill Points:';
    
    this.skillPointsDisplay = document.createElement('div');
    this.skillPointsDisplay.id = 'skill-points-used';
    
    pointsTracker.appendChild(pointsLabel);
    pointsTracker.appendChild(this.skillPointsDisplay);
    
    // Skills controls
    const skillsControls = document.createElement('div');
    skillsControls.className = 'skills-controls';
    
    // Category filter
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.htmlFor = 'skill-category-filter';
    categoryLabel.textContent = 'Category:';
    
    this.categoryFilter = document.createElement('select');
    this.categoryFilter.id = 'skill-category-filter';
    
    // Add "All Categories" option
    const allOption = document.createElement('option');
    allOption.value = 'All';
    allOption.textContent = 'All Categories';
    this.categoryFilter.appendChild(allOption);
    
    // Add category options
    this.skillManager.skillsData.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      this.categoryFilter.appendChild(option);
    });
    
    filterContainer.appendChild(categoryLabel);
    filterContainer.appendChild(this.categoryFilter);
    
    // Search
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    const searchLabel = document.createElement('label');
    searchLabel.htmlFor = 'skill-search';
    searchLabel.textContent = 'Search:';
    
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.id = 'skill-search';
    this.searchInput.placeholder = 'Search skills...';
    
    searchContainer.appendChild(searchLabel);
    searchContainer.appendChild(this.searchInput);
    
    // Display options
    const optionGroup = document.createElement('div');
    optionGroup.className = 'option-group';
    
    const optionsLabel = document.createElement('label');
    optionsLabel.textContent = 'Display Options';
    
    // Show descriptions
    const descCheckboxGroup = document.createElement('div');
    descCheckboxGroup.className = 'checkbox-group';
    
    this.showDescriptionsCheckbox = document.createElement('input');
    this.showDescriptionsCheckbox.type = 'checkbox';
    this.showDescriptionsCheckbox.id = 'show-descriptions';
    this.showDescriptionsCheckbox.checked = true;
    
    const descCheckboxLabel = document.createElement('label');
    descCheckboxLabel.htmlFor = 'show-descriptions';
    descCheckboxLabel.textContent = 'Show Descriptions';
    
    descCheckboxGroup.appendChild(this.showDescriptionsCheckbox);
    descCheckboxGroup.appendChild(descCheckboxLabel);
    
    // Show specializations
    const specCheckboxGroup = document.createElement('div');
    specCheckboxGroup.className = 'checkbox-group';
    
    this.showSpecializationsCheckbox = document.createElement('input');
    this.showSpecializationsCheckbox.type = 'checkbox';
    this.showSpecializationsCheckbox.id = 'show-specializations';
    
    const specCheckboxLabel = document.createElement('label');
    specCheckboxLabel.htmlFor = 'show-specializations';
    specCheckboxLabel.textContent = 'Show Specializations';
    
    specCheckboxGroup.appendChild(this.showSpecializationsCheckbox);
    specCheckboxGroup.appendChild(specCheckboxLabel);
    
    optionGroup.appendChild(optionsLabel);
    optionGroup.appendChild(descCheckboxGroup);
    optionGroup.appendChild(specCheckboxGroup);
    
    // Add all controls to skills controls
    skillsControls.appendChild(filterContainer);
    skillsControls.appendChild(searchContainer);
    skillsControls.appendChild(optionGroup);
    
    // Skills list
    this.skillListElement = document.createElement('div');
    this.skillListElement.className = 'skill-list';
    this.skillListElement.id = 'skill-list';
    
    // Tabs for skills, perks, and flaws
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    
    const skillsTab = document.createElement('div');
    skillsTab.className = 'tab active';
    skillsTab.dataset.tab = 'skills';
    skillsTab.textContent = 'Skills';
    
    const perksTab = document.createElement('div');
    perksTab.className = 'tab';
    perksTab.dataset.tab = 'perks';
    perksTab.textContent = 'Perks';
    
    const flawsTab = document.createElement('div');
    flawsTab.className = 'tab';
    flawsTab.dataset.tab = 'flaws';
    flawsTab.textContent = 'Flaws';
    
    tabsContainer.appendChild(skillsTab);
    tabsContainer.appendChild(perksTab);
    tabsContainer.appendChild(flawsTab);
    
    // Tab content containers
    const tabContents = document.createElement('div');
    tabContents.className = 'tab-contents';
    
    const skillsContent = document.createElement('div');
    skillsContent.className = 'tab-content active';
    skillsContent.dataset.content = 'skills';
    skillsContent.appendChild(skillsControls);
    skillsContent.appendChild(this.skillListElement);
    
    const perksContent = document.createElement('div');
    perksContent.className = 'tab-content';
    perksContent.dataset.content = 'perks';
    
    this.perkListElement = document.createElement('div');
    this.perkListElement.className = 'perk-list';
    perksContent.appendChild(this.perkListElement);
    
    const flawsContent = document.createElement('div');
    flawsContent.className = 'tab-content';
    flawsContent.dataset.content = 'flaws';
    
    this.flawListElement = document.createElement('div');
    this.flawListElement.className = 'flaw-list';
    flawsContent.appendChild(this.flawListElement);
    
    tabContents.appendChild(skillsContent);
    tabContents.appendChild(perksContent);
    tabContents.appendChild(flawsContent);
    
    // Add everything to the skills section
    skillsSection.appendChild(pointsTracker);
    skillsSection.appendChild(tabsContainer);
    skillsSection.appendChild(tabContents);
    
    // Add to container
    this.containerElement.appendChild(skillsSection);
  }
  
  /**
   * Set up event listeners for the UI elements
   */
  setupEventListeners() {
    // Category filter change
    this.categoryFilter.addEventListener('change', () => {
      this.renderSkillList();
    });
    
    // Search input
    this.searchInput.addEventListener('input', () => {
      this.renderSkillList();
    });
    
    // Display options
    this.showDescriptionsCheckbox.addEventListener('change', () => {
      this.renderSkillList();
    });
    
    this.showSpecializationsCheckbox.addEventListener('change', () => {
      this.renderSkillList();
    });
    
    // Tab switching
    const tabs = this.containerElement.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Update content visibility
        const tabContents = this.containerElement.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.dataset.content === tab.dataset.tab) {
            content.classList.add('active');
          }
        });
      });
    });
  }
  
  /**
   * Render the skill list based on current filters
   */
  renderSkillList() {
    // Clear the skill list
    this.skillListElement.innerHTML = '';
    
    // Get filter values
    const categoryFilter = this.categoryFilter.value;
    const searchTerm = this.searchInput.value.toLowerCase();
    const showDescriptions = this.showDescriptionsCheckbox.checked;
    const showSpecializations = this.showSpecializationsCheckbox.checked;
    
    // Get skills filtered by category
    let filteredSkills = categoryFilter === 'All' 
      ? this.skillManager.characterSkills 
      : this.skillManager.getSkillsByCategory(categoryFilter);
    
    // Filter by search term
    if (searchTerm) {
      filteredSkills = filteredSkills.filter(skill => 
        skill.name.toLowerCase().includes(searchTerm) ||
        this.skillManager.getSkillData(skill.id)?.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Render each skill
    filteredSkills.forEach(skill => {
      const skillData = this.skillManager.getSkillData(skill.id);
      if (!skillData) return;
      
      const skillElement = document.createElement('div');
      skillElement.className = 'skill-item';
      
      // Skill header
      const skillHeader = document.createElement('div');
      skillHeader.className = 'skill-header';
      
      const skillName = document.createElement('div');
      skillName.className = 'skill-name';
      skillName.textContent = `${skill.name}${skill.complex ? ' (Complex)' : ''}`;
      
      const skillCategory = document.createElement('div');
      skillCategory.className = 'skill-category';
      skillCategory.textContent = skillData.category;
      
      skillHeader.appendChild(skillName);
      skillHeader.appendChild(skillCategory);
      
      // Skill description
      if (showDescriptions && skillData.description) {
        const skillDescription = document.createElement('div');
        skillDescription.className = 'skill-description';
        skillDescription.textContent = skillData.description;
        skillElement.appendChild(skillDescription);
      }
      
      // Skill footer (level, cost, controls)
      const skillFooter = document.createElement('div');
      skillFooter.className = 'skill-footer';
      
      const skillLevelInfo = document.createElement('div');
      skillLevelInfo.className = 'skill-level-info';
      
      const skillLevel = document.createElement('div');
      skillLevel.className = 'skill-level';
      skillLevel.textContent = `Level: ${skill.level}`;
      
      const skillComplexity = document.createElement('div');
      skillComplexity.className = 'skill-complexity';
      skillComplexity.textContent = `Complexity: ${skill.complexity}`;
      
      const skillCost = document.createElement('div');
      skillCost.className = 'skill-cost';
      skillCost.textContent = `Cost: ${this.skillManager.calculateSkillCost(skill)}`;
      
      skillLevelInfo.appendChild(skillLevel);
      skillLevelInfo.appendChild(skillComplexity);
      skillLevelInfo.appendChild(skillCost);
      
      // Skill controls
      const skillControls = document.createElement('div');
      skillControls.className = 'skill-controls';
      
      // Level controls
      const levelControls = document.createElement('div');
      levelControls.className = 'level-controls';
      
      const levelDecrease = document.createElement('button');
      levelDecrease.className = 'dec-btn';
      levelDecrease.textContent = '-';
      levelDecrease.addEventListener('click', () => {
        const result = this.skillManager.decreaseSkillLevel(skill.id);
        if (result.success) {
          this.renderSkillList();
          this.updatePointsDisplay();
        } else {
          this.showNotification(result.message, 'error');
        }
      });
      
      const levelIncrease = document.createElement('button');
      levelIncrease.className = 'inc-btn';
      levelIncrease.textContent = '+';
      levelIncrease.addEventListener('click', () => {
        const result = this.skillManager.increaseSkillLevel(skill.id);
        if (result.success) {
          this.renderSkillList();
          this.updatePointsDisplay();
        } else {
          this.showNotification(result.message, 'error');
        }
      });
      
      // Complexity controls
      const complexityControls = document.createElement('div');
      complexityControls.className = 'complexity-controls';
      
      const complexityDecrease = document.createElement('button');
      complexityDecrease.className = 'dec-btn';
      complexityDecrease.textContent = '-';
      complexityDecrease.addEventListener('click', () => {
        const result = this.skillManager.decreaseSkillComplexity(skill.id);
        if (result.success) {
          this.renderSkillList();
          this.updatePointsDisplay();
        } else {
          this.showNotification(result.message, 'error');
        }
      });
      
      const complexityIncrease = document.createElement('button');
      complexityIncrease.className = 'inc-btn';
      complexityIncrease.textContent = '+';
      complexityIncrease.addEventListener('click', () => {
        const result = this.skillManager.increaseSkillComplexity(skill.id);
        if (result.success) {
          this.renderSkillList();
          this.updatePointsDisplay();
        } else {
          this.showNotification(result.message, 'error');
        }
      });
      
      // Add controls to containers
      levelControls.appendChild(levelDecrease);
      levelControls.appendChild(levelIncrease);
      
      complexityControls.appendChild(complexityDecrease);
      complexityControls.appendChild(complexityIncrease);
      
      // Control labels
      const levelLabel = document.createElement('div');
      levelLabel.className = 'control-label';
      levelLabel.textContent = 'Level:';
      
      const complexityLabel = document.createElement('div');
      complexityLabel.className = 'control-label';
      complexityLabel.textContent = 'Complexity:';
      
      // Group controls
      const levelGroup = document.createElement('div');
      levelGroup.className = 'control-group';
      levelGroup.appendChild(levelLabel);
      levelGroup.appendChild(levelControls);
      
      const complexityGroup = document.createElement('div');
      complexityGroup.className = 'control-group';
      complexityGroup.appendChild(complexityLabel);
      complexityGroup.appendChild(complexityControls);
      
      skillControls.appendChild(levelGroup);
      skillControls.appendChild(complexityGroup);
      
      // Add specialization button
      if (showSpecializations && skillData.specializations && skillData.specializations.length > 0) {
        const addSpecButton = document.createElement('button');
        addSpecButton.className = 'add-specialization-btn';
        addSpecButton.textContent = 'Add Specialization';
        addSpecButton.addEventListener('click', () => {
          this.showSpecializationDialog(skill.id, skillData.specializations);
        });
        
        skillControls.appendChild(addSpecButton);
      }
      
      skillFooter.appendChild(skillLevelInfo);
      skillFooter.appendChild(skillControls);
      
      // Current specializations
      if (skill.specializations && skill.specializations.length > 0) {
        const specializationsDiv = document.createElement('div');
        specializationsDiv.className = 'specializations';
        
        const specializationsLabel = document.createElement('div');
        specializationsLabel.className = 'specializations-label';
        specializationsLabel.textContent = 'Specializations:';
        
        const specializationsList = document.createElement('div');
        specializationsList.className = 'specializations-list';
        
        skill.specializations.forEach(spec => {
          const specElement = document.createElement('div');
          specElement.className = 'specialization';
          
          const specText = document.createElement('span');
          specText.textContent = spec;
          
          const removeButton = document.createElement('button');
          removeButton.className = 'remove-spec-btn';
          removeButton.textContent = '×';
          removeButton.addEventListener('click', () => {
            const result = this.skillManager.removeSpecialization(skill.id, spec);
            if (result.success) {
              this.renderSkillList();
              this.updatePointsDisplay();
            } else {
              this.showNotification(result.message, 'error');
            }
          });
          
          specElement.appendChild(specText);
          specElement.appendChild(removeButton);
          specializationsList.appendChild(specElement);
        });
        
        specializationsDiv.appendChild(specializationsLabel);
        specializationsDiv.appendChild(specializationsList);
        
        skillElement.appendChild(specializationsDiv);
      }
      
      // Assemble the skill element
      skillElement.appendChild(skillHeader);
      skillElement.appendChild(skillFooter);
      
      // Add to the list
      this.skillListElement.appendChild(skillElement);
    });
  }
  
  /**
   * Show dialog for selecting a specialization
   * @param {string} skillId - The ID of the skill
   * @param {Array} availableSpecializations - List of available specializations
   */
  showSpecializationDialog(skillId, availableSpecializations) {
    // Create a dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    
    const dialogContent = document.createElement('div');
    dialogContent.className = 'dialog-content';
    
    const dialogTitle = document.createElement('h3');
    dialogTitle.textContent = 'Select Specialization';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    const specializationSelect = document.createElement('select');
    specializationSelect.className = 'specialization-select';
    
    // Add specialization options
    availableSpecializations.forEach(spec => {
      const option = document.createElement('option');
      option.value = spec;
      option.textContent = spec;
      specializationSelect.appendChild(option);
    });
    
    // Custom specialization input
    const customContainer = document.createElement('div');
    customContainer.className = 'custom-spec-container';
    
    const customCheckbox = document.createElement('input');
    customCheckbox.type = 'checkbox';
    customCheckbox.id = 'custom-spec-checkbox';
    
    const customLabel = document.createElement('label');
    customLabel.htmlFor = 'custom-spec-checkbox';
    customLabel.textContent = 'Custom Specialization:';
    
    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.id = 'custom-spec-input';
    customInput.placeholder = 'Enter custom specialization...';
    customInput.disabled = true;
    
    customCheckbox.addEventListener('change', () => {
      customInput.disabled = !customCheckbox.checked;
      specializationSelect.disabled = customCheckbox.checked;
    });
    
    customContainer.appendChild(customCheckbox);
    customContainer.appendChild(customLabel);
    customContainer.appendChild(customInput);
    
    // Add and cancel buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'dialog-buttons';
    
    const addButton = document.createElement('button');
    addButton.className = 'dialog-button add-button';
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => {
      let specialization;
      
      if (customCheckbox.checked) {
        specialization = customInput.value.trim();
        if (!specialization) {
          this.showNotification('Please enter a custom specialization', 'error');
          return;
        }
      } else {
        specialization = specializationSelect.value;
      }
      
      const result = this.skillManager.addSpecialization(skillId, specialization);
      if (result.success) {
        this.renderSkillList();
        this.updatePointsDisplay();
        document.body.removeChild(dialog);
      } else {
        this.showNotification(result.message, 'error');
      }
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'dialog-button cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    buttonContainer.appendChild(addButton);
    buttonContainer.appendChild(cancelButton);
    
    // Assemble the dialog
    dialogContent.appendChild(dialogTitle);
    dialogContent.appendChild(closeButton);
    dialogContent.appendChild(specializationSelect);
    dialogContent.appendChild(customContainer);
    dialogContent.appendChild(buttonContainer);
    
    dialog.appendChild(dialogContent);
    
    // Add dialog to the body
    document.body.appendChild(dialog);
  }
  
  /**
   * Render the perks list
   */
  renderPerksList() {
    // Clear the perks list
    this.perkListElement.innerHTML = '';
    
    // Create an "Add Perk" button
    const addPerkButton = document.createElement('button');
    addPerkButton.className = 'add-perk-button';
    addPerkButton.textContent = 'Add Perk';
    addPerkButton.addEventListener('click', () => {
      this.showPerkDialog();
    });
    
    this.perkListElement.appendChild(addPerkButton);
    
    // Add selected perks
    const perksHeading = document.createElement('h3');
    perksHeading.textContent = 'Selected Perks';
    this.perkListElement.appendChild(perksHeading);
    
    const selectedPerks = this.skillManager.characterPerks;
    
    if (selectedPerks.length === 0) {
      const noneSelected = document.createElement('p');
      noneSelected.className = 'none-selected';
      noneSelected.textContent = 'No perks selected';
      this.perkListElement.appendChild(noneSelected);
    } else {
      const perksList = document.createElement('div');
      perksList.className = 'selected-perks-list';
      
      selectedPerks.forEach(perk => {
        const perkData = this.skillManager.perksFlawsData.perks.find(p => p.id === perk.id);
        if (!perkData) return;
        
        const perkElement = document.createElement('div');
        perkElement.className = 'perk-item';
        
        const perkHeader = document.createElement('div');
        perkHeader.className = 'perk-header';
        
        const perkName = document.createElement('div');
        perkName.className = 'perk-name';
        perkName.textContent = perkData.name;
        
        const perkCost = document.createElement('div');
        perkCost.className = 'perk-cost';
        perkCost.textContent = `Cost: ${this.skillManager.getPerkCost(perk)}`;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-perk-btn';
        removeButton.textContent = '×';
        removeButton.addEventListener('click', () => {
          const result = this.skillManager.removePerk(perk.id);
          if (result.success) {
            this.renderPerksList();
            this.updatePointsDisplay();
          } else {
            this.showNotification(result.message, 'error');
          }
        });
        
        perkHeader.appendChild(perkName);
        perkHeader.appendChild(perkCost);
        perkHeader.appendChild(removeButton);
        
        const perkDescription = document.createElement('div');
        perkDescription.className = 'perk-description';
        perkDescription.textContent = perkData.description;
        
        if (perk.level) {
          const perkLevel = document.createElement('div');
          perkLevel.className = 'perk-level';
          perkLevel.textContent = `Level: ${perk.level}`;
          perkElement.appendChild(perkLevel);
        }
        
        perkElement.appendChild(perkHeader);
        perkElement.appendChild(perkDescription);
        
        perksList.appendChild(perkElement);
      });
      
      this.perkListElement.appendChild(perksList);
    }
  }
  
  /**
   * Show dialog for selecting a perk
   */
  showPerkDialog() {
    // Create a dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    
    const dialogContent = document.createElement('div');
    dialogContent.className = 'dialog-content';
    
    const dialogTitle = document.createElement('h3');
    dialogTitle.textContent = 'Select Perk';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    // Create a list of available perks
    const perkSelect = document.createElement('select');
    perkSelect.className = 'perk-select';
    
    // Get available perks (excluding already selected ones)
    const selectedPerkIds = this.skillManager.characterPerks.map(p => p.id);
    const availablePerks = this.skillManager.perksFlawsData.perks.filter(
      p => !selectedPerkIds.includes(p.id)
    );
    
    // Add perk options
    availablePerks.forEach(perk => {
      const option = document.createElement('option');
      option.value = perk.id;
      option.textContent = perk.name;
      perkSelect.appendChild(option);
    });
    
    // Perk description
    const perkDescription = document.createElement('div');
    perkDescription.className = 'perk-description-dialog';
    
    // Level selection for variable-cost perks
    const levelContainer = document.createElement('div');
    levelContainer.className = 'level-container';
    levelContainer.style.display = 'none';
    
    const levelLabel = document.createElement('label');
    levelLabel.htmlFor = 'perk-level-select';
    levelLabel.textContent = 'Level:';
    
    const levelSelect = document.createElement('select');
    levelSelect.id = 'perk-level-select';
    levelSelect.className = 'perk-level-select';
    
    levelContainer.appendChild(levelLabel);
    levelContainer.appendChild(levelSelect);
    
    // Update description and level options when perk selection changes
    perkSelect.addEventListener('change', () => {
      const selectedPerk = availablePerks.find(p => p.id === perkSelect.value);
      if (!selectedPerk) return;
      
      perkDescription.textContent = selectedPerk.description;
      
      // Check if perk has variable cost (levels)
      if (typeof selectedPerk.cost === 'object') {
        levelContainer.style.display = 'block';
        levelSelect.innerHTML = ''; // Clear previous options
        
        // Add level options
        Object.keys(selectedPerk.cost).forEach(level => {
          const option = document.createElement('option');
          option.value = level;
          option.textContent = `${level} (Cost: ${selectedPerk.cost[level]})`;
          levelSelect.appendChild(option);
        });
      } else {
        levelContainer.style.display = 'none';
      }
    });
    
    // Set initial description
    if (availablePerks.length > 0) {
      const initialPerk = availablePerks[0];
      perkDescription.textContent = initialPerk.description;
      
      // Set up level select if needed
      if (typeof initialPerk.cost === 'object') {
        levelContainer.style.display = 'block';
        
        // Add level options
        Object.keys(initialPerk.cost).forEach(level => {
          const option = document.createElement('option');
          option.value = level;
          option.textContent = `${level} (Cost: ${initialPerk.cost[level]})`;
          levelSelect.appendChild(option);
        });
      }
    }
    
    // Add and cancel buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'dialog-buttons';
    
    const addButton = document.createElement('button');
    addButton.className = 'dialog-button add-button';
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => {
      const perkId = perkSelect.value;
      const selectedPerk = availablePerks.find(p => p.id === perkId);
      
      if (!selectedPerk) {
        this.showNotification('Please select a valid perk', 'error');
        return;
      }
      
      let level = null;
      if (typeof selectedPerk.cost === 'object') {
        level = levelSelect.value;
      }
      
      const result = this.skillManager.addPerk(perkId, level);
      if (result.success) {
        this.renderPerksList();
        this.updatePointsDisplay();
        document.body.removeChild(dialog);
      } else {
        this.showNotification(result.message, 'error');
      }
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'dialog-button cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    buttonContainer.appendChild(addButton);
    buttonContainer.appendChild(cancelButton);
    
    // Assemble the dialog
    dialogContent.appendChild(dialogTitle);
    dialogContent.appendChild(closeButton);
    dialogContent.appendChild(perkSelect);
    dialogContent.appendChild(perkDescription);
    dialogContent.appendChild(levelContainer);
    dialogContent.appendChild(buttonContainer);
    
    dialog.appendChild(dialogContent);
    
    // Add dialog to the body
    document.body.appendChild(dialog);
  }
  
  /**
   * Render the flaws list
   */
  renderFlawsList() {
    // Clear the flaws list
    this.flawListElement.innerHTML = '';
    
    // Create an "Add Flaw" button
    const addFlawButton = document.createElement('button');
    addFlawButton.className = 'add-flaw-button';
    addFlawButton.textContent = 'Add Flaw';
    addFlawButton.addEventListener('click', () => {
      this.showFlawDialog();
    });
    
    this.flawListElement.appendChild(addFlawButton);
    
    // Add selected flaws
    const flawsHeading = document.createElement('h3');
    flawsHeading.textContent = 'Selected Flaws';
    this.flawListElement.appendChild(flawsHeading);
    
    const selectedFlaws = this.skillManager.characterFlaws;
    
    if (selectedFlaws.length === 0) {
      const noneSelected = document.createElement('p');
      noneSelected.className = 'none-selected';
      noneSelected.textContent = 'No flaws selected';
      this.flawListElement.appendChild(noneSelected);
    } else {
      const flawsList = document.createElement('div');
      flawsList.className = 'selected-flaws-list';
      
      selectedFlaws.forEach(flaw => {
        const flawData = this.skillManager.perksFlawsData.flaws.find(f => f.id === flaw.id);
        if (!flawData) return;
        
        const flawElement = document.createElement('div');
        flawElement.className = 'flaw-item';
        
        const flawHeader = document.createElement('div');
        flawHeader.className = 'flaw-header';
        
        const flawName = document.createElement('div');
        flawName.className = 'flaw-name';
        flawName.textContent = flawData.name;
        
        const flawValue = document.createElement('div');
        flawValue.className = 'flaw-value';
        flawValue.textContent = `Value: ${this.skillManager.getFlawValue(flaw)}`;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-flaw-btn';
        removeButton.textContent = '×';
        removeButton.addEventListener('click', () => {
          const result = this.skillManager.removeFlaw(flaw.id);
          if (result.success) {
            this.renderFlawsList();
            this.updatePointsDisplay();
          } else {
            this.showNotification(result.message, 'error');
          }
        });
        
        flawHeader.appendChild(flawName);
        flawHeader.appendChild(flawValue);
        flawHeader.appendChild(removeButton);
        
        const flawDescription = document.createElement('div');
        flawDescription.className = 'flaw-description';
        flawDescription.textContent = flawData.description;
        
        if (flaw.level) {
          const flawLevel = document.createElement('div');
          flawLevel.className = 'flaw-level';
          flawLevel.textContent = `Level: ${flaw.level}`;
          flawElement.appendChild(flawLevel);
        }
        
        flawElement.appendChild(flawHeader);
        flawElement.appendChild(flawDescription);
        
        flawsList.appendChild(flawElement);
      });
      
      this.flawListElement.appendChild(flawsList);
    }
  }
  
  /**
   * Show dialog for selecting a flaw
   */
  showFlawDialog() {
    // Create a dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    
    const dialogContent = document.createElement('div');
    dialogContent.className = 'dialog-content';
    
    const dialogTitle = document.createElement('h3');
    dialogTitle.textContent = 'Select Flaw';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    // Create a list of available flaws
    const flawSelect = document.createElement('select');
    flawSelect.className = 'flaw-select';
    
    // Get available flaws (excluding already selected ones)
    const selectedFlawIds = this.skillManager.characterFlaws.map(f => f.id);
    const availableFlaws = this.skillManager.perksFlawsData.flaws.filter(
      f => !selectedFlawIds.includes(f.id)
    );
    
    // Add flaw options
    availableFlaws.forEach(flaw => {
      const option = document.createElement('option');
      option.value = flaw.id;
      option.textContent = flaw.name;
      flawSelect.appendChild(option);
    });
    
    // Flaw description
    const flawDescription = document.createElement('div');
    flawDescription.className = 'flaw-description-dialog';
    
    // Level selection for variable-value flaws
    const levelContainer = document.createElement('div');
    levelContainer.className = 'level-container';
    levelContainer.style.display = 'none';
    
    const levelLabel = document.createElement('label');
    levelLabel.htmlFor = 'flaw-level-select';
    levelLabel.textContent = 'Level:';
    
    const levelSelect = document.createElement('select');
    levelSelect.id = 'flaw-level-select';
    levelSelect.className = 'flaw-level-select';
    
    levelContainer.appendChild(levelLabel);
    levelContainer.appendChild(levelSelect);
    
    // Update description and level options when flaw selection changes
    flawSelect.addEventListener('change', () => {
      const selectedFlaw = availableFlaws.find(f => f.id === flawSelect.value);
      if (!selectedFlaw) return;
      
      flawDescription.textContent = selectedFlaw.description;
      
      // Check if flaw has variable value (levels)
      if (typeof selectedFlaw.value === 'object') {
        levelContainer.style.display = 'block';
        levelSelect.innerHTML = ''; // Clear previous options
        
        // Add level options
        Object.keys(selectedFlaw.value).forEach(level => {
          const option = document.createElement('option');
          option.value = level;
          option.textContent = `${level} (Value: ${Math.abs(selectedFlaw.value[level])})`;
          levelSelect.appendChild(option);
        });
      } else {
        levelContainer.style.display = 'none';
      }
    });
    
    // Set initial description
    if (availableFlaws.length > 0) {
      const initialFlaw = availableFlaws[0];
      flawDescription.textContent = initialFlaw.description;
      
      // Set up level select if needed
      if (typeof initialFlaw.value === 'object') {
        levelContainer.style.display = 'block';
        
        // Add level options
        Object.keys(initialFlaw.value).forEach(level => {
          const option = document.createElement('option');
          option.value = level;
          option.textContent = `${level} (Value: ${Math.abs(initialFlaw.value[level])})`;
          levelSelect.appendChild(option);
        });
      }
    }
    
    // Add and cancel buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'dialog-buttons';
    
    const addButton = document.createElement('button');
    addButton.className = 'dialog-button add-button';
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => {
      const flawId = flawSelect.value;
      const selectedFlaw = availableFlaws.find(f => f.id === flawId);
      
      if (!selectedFlaw) {
        this.showNotification('Please select a valid flaw', 'error');
        return;
      }
      
      let level = null;
      if (typeof selectedFlaw.value === 'object') {
        level = levelSelect.value;
      }
      
      const result = this.skillManager.addFlaw(flawId, level);
      if (result.success) {
        this.renderFlawsList();
        this.updatePointsDisplay();
        document.body.removeChild(dialog);
      } else {
        this.showNotification(result.message, 'error');
      }
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'dialog-button cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    buttonContainer.appendChild(addButton);
    buttonContainer.appendChild(cancelButton);
    
    // Assemble the dialog
    dialogContent.appendChild(dialogTitle);
    dialogContent.appendChild(closeButton);
    dialogContent.appendChild(flawSelect);
    dialogContent.appendChild(flawDescription);
    dialogContent.appendChild(levelContainer);
    dialogContent.appendChild(buttonContainer);
    
    dialog.appendChild(dialogContent);
    
    // Add dialog to the body
    document.body.appendChild(dialog);
  }
  
  /**
   * Update the skill points display
   */
  updatePointsDisplay() {
    const usedPoints = this.skillManager.usedSkillPoints;
    const maxPoints = this.skillManager.maxSkillPoints;
    this.skillPointsDisplay.textContent = `${usedPoints}/${maxPoints}`;
    
    // Highlight if over limit
    if (usedPoints > maxPoints) {
      this.skillPointsDisplay.classList.add('exceeded');
    } else {
      this.skillPointsDisplay.classList.remove('exceeded');
    }
  }
  
  /**
   * Show a notification message
   * @param {string} message - The message to display
   * @param {string} type - The type of notification (success, error, warning)
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Create close button
    const closeButton = document.createElement('span');
    closeButton.className = 'notification-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(notification);
    });
    
    notification.appendChild(closeButton);
    
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
   * Get the character's skills, perks, and flaws data
   * @returns {Object} Character data
   */
  getCharacterData() {
    return this.skillManager.exportData();
  }
  
  /**
   * Set the character's skills, perks, and flaws data
   * @param {Object} data - Character data
   */
  setCharacterData(data) {
    this.skillManager.importData(data);
    this.renderSkillList();
    this.renderPerksList();
    this.renderFlawsList();
    this.updatePointsDisplay();
  }
}

export default SkillsUI;