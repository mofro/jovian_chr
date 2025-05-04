/**
 * File: js/skillsUI.js
 * UI component for skills management
 */

import SkillManager from './skillManager.js';

/**
 * SkillsUI Class
 * Handles the UI elements for skills section
 */
export default class SkillsUI {
    /**
     * Initialize the SkillsUI
     * @param {HTMLElement} container - Container element for the skills UI
     * @param {Object} config - Configuration object
     * @param {Object} config.skillsData - Skills data object containing categories and skills arrays
     * @param {number} config.maxSkillPoints - Maximum skill points
     * @param {function} config.onUpdate - Callback when skills change
     */
    constructor(container, config = {}) {
        this.container = container;
        this.onUpdateCallback = config.onUpdate || function () {};
    
        // Create skill manager with correct parameters
        this.skillManager = new SkillManager(
            config.skillsData, // Pass the skills data directly
            config.perksFlawsData, // Pass perks/flaws data
            config.maxSkillPoints || 50 // Default to 50 if not provided
        );
    
        // Pagination state
        this.currentPage = 1;
        this.itemsPerPage = 6;
    
        // Filter state
        this.currentCategory = 'all';
        this.searchQuery = '';
    
        // Initialize UI
        this.createUI();
        this.update();
    }

    /**
     * Create the initial UI elements
     */
    createUI() {
        // Create skills container
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'skills-container';
        this.container.appendChild(skillsContainer);
        this.skillsContainer = skillsContainer;

        // Create header
        const header = document.createElement('div');
        header.className = 'skills-header';
        header.innerHTML = `
            <h2>Skills</h2>
            <div class="points">
                <span id="skill-points-used">0</span>
            </div>
        `;
        skillsContainer.appendChild(header);

        // Create controls
        const controls = document.createElement('div');
        controls.className = 'skills-controls';
        controls.innerHTML = `
            <div class="filter-group">
                <label for="skill-category-filter">Category</label>
                <select id="skill-category-filter">
                    <option value="all">All Categories</option>
                    ${this.skillManager.getCategories()
                        .map(
                            (category) =>
                                `<option value="${category.toLowerCase()}">${category}</option>`
                        )
                        .join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="skill-search">Search</label>
                <input type="text" id="skill-search" placeholder="Search skills...">
            </div>
        `;
        skillsContainer.appendChild(controls);
        
        // Add event listeners for controls
        const categoryFilter = controls.querySelector('#skill-category-filter');
        categoryFilter.addEventListener('change', () => {
            this.currentCategory = categoryFilter.value;
            this.currentPage = 1;
            this.update();
        });

        const searchInput = controls.querySelector('#skill-search');
        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value;
            this.currentPage = 1;
            this.update();
        });

        // Create skill list
        const skillList = document.createElement('div');
        skillList.className = 'skill-list';
        skillsContainer.appendChild(skillList);
        this.skillList = skillList;

        // Create pagination
        const pagination = document.createElement('div');
        pagination.className = 'skill-pagination';
        skillsContainer.appendChild(pagination);
        this.pagination = pagination;
    }

    /**
     * Update the skill list based on filters and pagination
     */
    updateSkillList() {
        // Clear the existing content
        this.skillList.innerHTML = '';
    
        // Filter and paginate skills
        let filteredSkills = this.skillManager.getCharacterSkills()
            .filter((skill) => {
                const matchesCategory =
                    this.currentCategory === 'all' ||
                    skill.category.toLowerCase() === this.currentCategory;
                const matchesSearch =
                    this.searchQuery === '' ||
                    skill.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    (skill.description && skill.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
                
                return matchesCategory && matchesSearch;
            });
    
        // Sort skills by category and name
        filteredSkills.sort((a, b) => {
            if (a.category === b.category) {
                return a.name.localeCompare(b.name);
            }
            return a.category.localeCompare(b.category);
        });
    
        const totalPages = Math.ceil(filteredSkills.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedSkills = filteredSkills.slice(
            startIndex,
            startIndex + this.itemsPerPage
        );
    
        // Render skills
        if (paginatedSkills.length === 0) {
            const noSkillsMessage = document.createElement('div');
            noSkillsMessage.className = 'no-skills-message';
            noSkillsMessage.textContent = 'No skills match your criteria.';
            this.skillList.appendChild(noSkillsMessage);
        } else {
            // Create skill items
            paginatedSkills.forEach(skill => {
                const skillItem = this.createSkillItem(skill);
                this.skillList.appendChild(skillItem);
            });
        }
    
        // Update pagination
        this.createPagination(totalPages);
        
        // Update buttons state
        this.updateButtonsState();
    }
    
    createSkillItem(skill) {
        const item = document.createElement('div');
        item.className = 'skill-item';
        if (skill.level > 0) {
            item.classList.add('active-skill');
        }
    
        // Skill header
        const header = document.createElement('div');
        header.className = 'skill-header';
        
        const nameContainer = document.createElement('div');
        nameContainer.className = 'skill-name-container';
        
        const nameEl = document.createElement('span');
        nameEl.className = 'skill-name';
        nameEl.textContent = skill.name;
        
        nameContainer.appendChild(nameEl);
        
        // Add 'Complex' tag if applicable
        if (skill.complex) {
            const complexTag = document.createElement('span');
            complexTag.className = 'complex-tag';
            complexTag.textContent = 'Complex';
            nameContainer.appendChild(complexTag);
        }
        
        const categoryEl = document.createElement('div');
        categoryEl.className = 'skill-category';
        categoryEl.textContent = skill.category;
        
        header.appendChild(nameContainer);
        header.appendChild(categoryEl);
        item.appendChild(header);
    
        // Skill description
        if (skill.description) {
            const description = document.createElement('div');
            description.className = 'skill-description';
            description.textContent = skill.description;
            item.appendChild(description);
        }
    
        // Skill stats and controls
        const statsControls = document.createElement('div');
        statsControls.className = 'skill-stats-controls';
        
        // Level controls
        const levelSection = document.createElement('div');
        levelSection.className = 'skill-stat-section';
        
        const levelLabel = document.createElement('div');
        levelLabel.className = 'skill-stat-label';
        levelLabel.textContent = 'Level';
        
        const levelControls = document.createElement('div');
        levelControls.className = 'skill-controls';
        
        const decreaseLevelBtn = document.createElement('button');
        decreaseLevelBtn.className = 'skill-btn dec-btn';
        decreaseLevelBtn.textContent = '-';
        decreaseLevelBtn.dataset.skillId = skill.id;
        decreaseLevelBtn.dataset.action = 'decrease-level';
        
        const levelValue = document.createElement('span');
        levelValue.className = 'skill-stat-value';
        levelValue.textContent = skill.level;
        
        const increaseLevelBtn = document.createElement('button');
        increaseLevelBtn.className = 'skill-btn inc-btn';
        increaseLevelBtn.textContent = '+';
        increaseLevelBtn.dataset.skillId = skill.id;
        increaseLevelBtn.dataset.action = 'increase-level';
        
        // Add event listeners
        decreaseLevelBtn.addEventListener('click', () => {
            this.skillManager.decreaseSkillLevel(skill.id);
            this.update();
        });
        
        increaseLevelBtn.addEventListener('click', () => {
            this.skillManager.increaseSkillLevel(skill.id);
            this.update();
        });
        
        levelControls.appendChild(decreaseLevelBtn);
        levelControls.appendChild(levelValue);
        levelControls.appendChild(increaseLevelBtn);
        levelSection.appendChild(levelLabel);
        levelSection.appendChild(levelControls);
        statsControls.appendChild(levelSection);
        
        // Complexity controls
        const complexitySection = document.createElement('div');
        complexitySection.className = 'skill-stat-section';
        
        const complexityLabel = document.createElement('div');
        complexityLabel.className = 'skill-stat-label';
        complexityLabel.textContent = 'Complexity';
        
        const complexityControls = document.createElement('div');
        complexityControls.className = 'skill-controls';
        
        const decreaseComplexityBtn = document.createElement('button');
        decreaseComplexityBtn.className = 'skill-btn dec-btn';
        decreaseComplexityBtn.textContent = '-';
        decreaseComplexityBtn.dataset.skillId = skill.id;
        decreaseComplexityBtn.dataset.action = 'decrease-complexity';
        
        const complexityValue = document.createElement('span');
        complexityValue.className = 'skill-stat-value';
        complexityValue.textContent = skill.complexity;
        
        const increaseComplexityBtn = document.createElement('button');
        increaseComplexityBtn.className = 'skill-btn inc-btn';
        increaseComplexityBtn.textContent = '+';
        increaseComplexityBtn.dataset.skillId = skill.id;
        increaseComplexityBtn.dataset.action = 'increase-complexity';
        
        // Add event listeners
        decreaseComplexityBtn.addEventListener('click', () => {
            this.skillManager.decreaseSkillComplexity(skill.id);
            this.update();
        });
        
        increaseComplexityBtn.addEventListener('click', () => {
            this.skillManager.increaseSkillComplexity(skill.id);
            this.update();
        });
        
        complexityControls.appendChild(decreaseComplexityBtn);
        complexityControls.appendChild(complexityValue);
        complexityControls.appendChild(increaseComplexityBtn);
        complexitySection.appendChild(complexityLabel);
        complexitySection.appendChild(complexityControls);
        statsControls.appendChild(complexitySection);
        
        // Cost display
        const costSection = document.createElement('div');
        costSection.className = 'skill-stat-section';
        
        const costLabel = document.createElement('div');
        costLabel.className = 'skill-stat-label';
        costLabel.textContent = 'Cost';
        
        const costDisplay = document.createElement('div');
        costDisplay.className = 'skill-cost-display';
        costDisplay.innerHTML = `<span class="skill-cost-value">${skill.cost}</span> SP`;
        
        costSection.appendChild(costLabel);
        costSection.appendChild(costDisplay);
        statsControls.appendChild(costSection);
        
        item.appendChild(statsControls);
        
        // Specializations section (simplified for now)
        if (skill.level > 0) {
            const specsSection = document.createElement('div');
            specsSection.className = 'skill-specializations';
            
            const specsLabel = document.createElement('div');
            specsLabel.className = 'specs-label';
            specsLabel.textContent = 'Specializations';
            
            const specsList = document.createElement('div');
            specsList.className = 'specs-list';
            
            // Add existing specializations
            if (skill.specializations && skill.specializations.length > 0) {
                skill.specializations.forEach(spec => {
                    const specTag = document.createElement('div');
                    specTag.className = 'spec-tag';
                    specTag.textContent = spec;
                    specsList.appendChild(specTag);
                });
            } else {
                const noSpecsMsg = document.createElement('div');
                noSpecsMsg.className = 'no-specs-message';
                noSpecsMsg.textContent = 'No specializations';
                specsList.appendChild(noSpecsMsg);
            }
            
            specsSection.appendChild(specsLabel);
            specsSection.appendChild(specsList);
            item.appendChild(specsSection);
        }
        
        return item;
    }

    /**
     * Update the state of buttons based on skill points and levels
     * @returns {void}
     */
    updateButtonsState() {
        const points = this.skillManager.getSkillPoints();
        const skills = this.skillManager.getCharacterSkills();
        
        // Find all skill buttons in the DOM
        const skillButtons = this.skillList.querySelectorAll('.skill-btn');
        
        skillButtons.forEach(button => {
            const skillId = button.dataset.skillId;
            const action = button.dataset.action;
            
            if (!skillId || !action) return;
            
            const skill = skills.find(s => s.id === skillId);
            if (!skill) return;
            
            switch (action) {
                case 'decrease-level':
                    button.disabled = skill.level <= 0;
                    break;
                    
                case 'increase-level':
                    button.disabled = !this.skillManager.canIncreaseSkillLevel(skillId);
                    break;
                    
                case 'decrease-complexity':
                    button.disabled = skill.complexity <= 1;
                    break;
                    
                case 'increase-complexity':
                    button.disabled = !this.skillManager.canIncreaseSkillComplexity(skillId);
                    break;
            }
        });
    }

    /**
     * Create pagination controls
     * @param {number} totalPages - Total number of pages
     */
    createPagination(totalPages) {
        this.pagination.innerHTML = '';

        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.className = `pagination-btn ${
                i === this.currentPage ? 'active' : ''
            }`;
            button.textContent = i;
            button.addEventListener('click', () => {
                this.currentPage = i;
                this.update();
            });
            this.pagination.appendChild(button);
        }
    }

    /**
     * Update the UI to reflect current skill values
     */
    update() {
        this.updateSkillList();
    }

    /**
     * Set character skills
     * @param {Array} skills - Character skills array
     */
    setCharacterSkills(skills) {
        if (!skills || !Array.isArray(skills)) return;
        this.skillManager.setCharacterSkills(skills);
        this.update();
    }

    /**
     * Set maximum skill points
     * @param {number} max - Maximum skill points
     */
    setMaxSkillPoints(max) {
        this.skillManager.setMaxSkillPoints(max);
        this.update();
    }

    /**
     * Reset all skills to initial state
     */
    resetSkills() {
        if (this.skillManager) {
            this.skillManager.resetSkills();
            this.update();
        }
    }

    /**
     * Get the skill manager instance
     * @returns {SkillManager} The skill manager
     */
    getSkillManager() {
        return this.skillManager;
    }

}
