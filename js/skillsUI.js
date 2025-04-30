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
     * @param {Object} config.skillsData - Skills data object
     * @param {number} config.maxSkillPoints - Maximum skill points
     * @param {function} config.onUpdate - Callback when skills change
     */
    constructor(container, config = {}) {
        this.container = container;
        this.skillsData = config.skillsData;
        this.onUpdateCallback = config.onUpdate || function() {};
        
        // Create skill manager
        this.skillManager = new SkillManager({
            skillsData: this.skillsData,
            maxSkillPoints: config.maxSkillPoints || 50,
            onUpdate: () => this.update()
        });
        
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
                <span id="skill-points-used">0/${this.skillManager.maxSkillPoints}</span>
            </div>
        `;
        skillsContainer.appendChild(header);
        
        // Create points tracker
        const pointsTracker = document.createElement('div');
        pointsTracker.className = 'points-tracker';
        pointsTracker.innerHTML = `
            <div>Skill Points:</div>
            <div id="skill-points-display">0/${this.skillManager.maxSkillPoints}</div>
        `;
        skillsContainer.appendChild(pointsTracker);
        
        // Create description
        const description = document.createElement('div');
        description.className = 'skills-description';
        description.innerHTML = `
            <p>Skills represent your character's training and experience in various fields. Each skill has a level (0-5 for most skills) 
            and a complexity (1-5) that represents the breadth of knowledge. Complex skills cost twice as much to increase in level.</p>
            
            <div class="info-box">
                <h4>Skill Cost Reference</h4>
                <p>Level: 1 (1 point), 2 (4 points), 3 (9 points)</p>
                <p>Complexity: 1 (free), 2 (4 points), 3 (9 points)</p>
                <p>Specialization: 5 points each</p>
            </div>
        `;
        skillsContainer.appendChild(description);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'skills-controls';
        controls.innerHTML = `
            <div class="filter-group">
                <label for="skill-category-filter">Category</label>
                <select id="skill-category-filter">
                    <option value="all">All Categories</option>
                    ${this.skillManager.getCategories().map(category => 
                        `<option value="${category.toLowerCase()}">${category}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="filter-group">
                <label for="skill-search">Search</label>
                <input type="text" id="skill-search" placeholder="Search skills...">
            </div>
            
            <div class="option-group">
                <label>Display Options</label>
                <div class="checkbox-group">
                    <input type="checkbox" id="show-active-only">
                    <label for="show-active-only">Show active skills only</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="show-details" checked>
                    <label for="show-details">Show skill details</label>
                </div>
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
        
        const showActiveOnly = controls.querySelector('#show-active-only');
        showActiveOnly.addEventListener('change', () => {
            this.currentPage = 1;
            this.update();
        });
        
        const showDetails = controls.querySelector('#show-details');
        showDetails.addEventListener('change', () => {
            this.update();
        });
        
        // Create skill list
        const skillList = document.createElement('div');
        skillList.className = 'skill-list';
        skillList.id = 'skill-list';
        skillsContainer.appendChild(skillList);
        this.skillList = skillList;
        
        // Create pagination
        const pagination = document.createElement('div');
        pagination.className = 'skill-pagination';
        pagination.id = 'skill-pagination';
        skillsContainer.appendChild(pagination);
        this.pagination = pagination;
        
        // Create active skills summary
        const summary = document.createElement('div');
        summary.className = 'skills-summary';
        summary.innerHTML = `
            <h3>Active Skills Summary</h3>
            <div class="skills-summary-list" id="skills-summary-list"></div>
        `;
        skillsContainer.appendChild(summary);
        this.skillsSummary = summary.querySelector('#skills-summary-list');
    }

    /**
     * Create a skill item element
     * @param {Object} skill - Skill data
     * @param {boolean} showDetails - Whether to show details
     * @returns {HTMLElement} Skill item element
     */
    createSkillItem(skill, showDetails) {
        const fullSkillData = this.skillsData.skills.find(s => s.id === skill.id);
        
        const item = document.createElement('div');
        item.className = `skill-item skill-${skill.category.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Create header with name and category
        const header = document.createElement('div');
        header.className = 'skill-header';
        header.innerHTML = `
            <div class="skill-name">${skill.name}${skill.complex ? 
                ' <span class="skill-complex-indicator">Complex</span>' : ''}</div>
            <div class="skill-category-badge">${skill.category}</div>
        `;
        item.appendChild(header);
        
        // Add description if details are shown
        if (showDetails) {
            const description = document.createElement('div');
            description.className = 'skill-description';
            description.textContent = fullSkillData.description;
            item.appendChild(description);
            
            // Add related attributes
            if (fullSkillData.relatedAttributes && fullSkillData.relatedAttributes.length > 0) {
                const attributes = document.createElement('div');
                attributes.className = 'skill-attributes';
                attributes.innerHTML = `<strong>Related Attributes:</strong> ${fullSkillData.relatedAttributes.join(', ')}`;
                item.appendChild(attributes);
            }
        }
        
        // Create level/complexity/cost section
        const levelSection = document.createElement('div');
        levelSection.className = 'skill-level-section';
        levelSection.innerHTML = `
            <div class="skill-level-display">
                <div class="skill-level-label">Level</div>
                <div class="skill-level-value" id="${skill.id}-level">${skill.level}</div>
            </div>
            <div class="skill-complexity-display">
                <div class="skill-complexity-label">Complexity</div>
                <div class="skill-complexity-value" id="${skill.id}-complexity">${skill.complexity}</div>
            </div>
            <div class="skill-cost-display">
                <div class="skill-cost-label">Cost</div>
                <div class="skill-cost-value" id="${skill.id}-cost">${skill.cost}</div>
            </div>
        `;
        item.appendChild(levelSection);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'skill-controls';
        
        // Level controls
        const levelControls = document.createElement('div');
        levelControls.className = 'skill-level-controls';
        levelControls.innerHTML = `
            <button class="skill-btn dec-btn" id="${skill.id}-level-decrease">-</button>
            <div>Level</div>
            <button class="skill-btn inc-btn" id="${skill.id}-level-increase">+</button>
        `;
        controls.appendChild(levelControls);
        
        // Complexity controls
        const complexityControls = document.createElement('div');
        complexityControls.className = 'skill-complexity-controls';
        complexityControls.innerHTML = `
            <button class="skill-btn dec-btn" id="${skill.id}-complexity-decrease">-</button>
            <div>Cpx</div>
            <button class="skill-btn inc-btn" id="${skill.id}-complexity-increase">+</button>
        `;
        controls.appendChild(complexityControls);
        
        item.appendChild(controls);
        
        // Add specializations if any and details are shown
        if (showDetails && (skill.specializations.length > 0 || fullSkillData.specializations)) {
            const specializationsSection = document.createElement('div');
            specializationsSection.className = 'skill-specializations';
            
            let specializationsContent = '<div class="skill-specializations-label">Specializations:</div>';
            
            // Current specializations
            if (skill.specializations.length > 0) {
                specializationsContent += `
                    <div class="specializations-list">
                        ${skill.specializations.map(spec => 
                            `<div class="specialization-tag">${spec}</div>`
                        ).join('')}
                    </div>
                `;
            }
            
            // Available specializations from skills data
            if (fullSkillData.specializations && fullSkillData.specializations.length > 0) {
                specializationsContent += `
                    <div class="skill-specialization-add">
                        <input type="text" id="${skill.id}-new-specialization" 
                            placeholder="Add specialization" list="${skill.id}-specializations">
                        <button class="add-specialization-btn" id="${skill.id}-add-specialization">Add</button>
                        <datalist id="${skill.id}-specializations">
                            ${fullSkillData.specializations.map(spec => 
                                `<option value="${spec}">${spec}</option>`
                            ).join('')}
                        </datalist>
                    </div>
                `;
            }
            
            specializationsSection.innerHTML = specializationsContent;
            item.appendChild(specializationsSection);
        }
        
        // Add event listeners
        this.addSkillItemEventListeners(item, skill.id);
        
        return item;
    }

    /**
     * Add event listeners to skill item
     * @param {HTMLElement} itemElement - Skill item element
     * @param {string} skillId - Skill ID
     */
    addSkillItemEventListeners(itemElement, skillId) {
        // Level controls
        const levelDecrease = itemElement.querySelector(`#${skillId}-level-decrease`);
        const levelIncrease = itemElement.querySelector(`#${skillId}-level-increase`);
        
        if (levelDecrease) {
            levelDecrease.addEventListener('click', () => {
                this.skillManager.decreaseSkillLevel(skillId);
            });
        }
        
        if (levelIncrease) {
            levelIncrease.addEventListener('click', () => {
                this.skillManager.increaseSkillLevel(skillId);
            });
        }
        
        // Complexity controls
        const complexityDecrease = itemElement.querySelector(`#${skillId}-complexity-decrease`);
        const complexityIncrease = itemElement.querySelector(`#${skillId}-complexity-increase`);
        
        if (complexityDecrease) {
            complexityDecrease.addEventListener('click', () => {
                this.skillManager.decreaseSkillComplexity(skillId);
            });
        }
        
        if (complexityIncrease) {
            complexityIncrease.addEventListener('click', () => {
                this.skillManager.increaseSkillComplexity(skillId);
            });
        }
        
        // Specialization controls
        const addSpecialization = itemElement.querySelector(`#${skillId}-add-specialization`);
        if (addSpecialization) {
            addSpecialization.addEventListener('click', () => {
                const input = itemElement.querySelector(`#${skillId}-new-specialization`);
                if (input && input.value.trim()) {
                    this.skillManager.addSpecialization(skillId, input.value.trim());
                    input.value = '';
                }
            });
        }
    }

    /**
     * Create pagination controls
     * @param {number} totalPages - Total number of pages
     */
    createPagination(totalPages) {
        this.pagination.innerHTML = '';
        
        if (totalPages <= 1) {
            return;
        }
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-btn';
        prevButton.textContent = '←';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.update();
            }
        });
        this.pagination.appendChild(prevButton);
        
        // Page buttons
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.update();
            });
            this.pagination.appendChild(pageButton);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-btn';
        nextButton.textContent = '→';
        nextButton.disabled = this.currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.update();
            }
        });
        this.pagination.appendChild(nextButton);
    }

    /**
     * Update the UI to reflect current skill values
     */
    update() {
        // Update points display
        const points = this.skillManager.getSkillPoints();
        document.getElementById('skill-points-display').textContent = `${points.used}/${points.max}`;
        document.getElementById('skill-points-used').textContent = `${points.used}/${points.max}`;
        
        // Get display options
        const showActiveOnly = document.getElementById('show-active-only').checked;
        const showDetails = document.getElementById('show-details').checked;
        
        // Filter skills
        let filteredSkills = this.skillManager.filterSkillsByCategory(this.currentCategory);
        
        // Apply search filter
        if (this.searchQuery) {
            filteredSkills = this.skillManager.searchSkills(this.searchQuery);
        }
        
        // Show only active skills if option is selected
        if (showActiveOnly) {
            filteredSkills = filteredSkills.filter(skill => 
                skill.level > 0 || skill.complexity > 1 || skill.specializations.length > 0
            );
        }
        
        // Sort skills: active skills first, then alphabetically
        filteredSkills.sort((a, b) => {
            const aActive = a.level > 0 || a.complexity > 1 || a.specializations.length > 0;
            const bActive = b.level > 0 || b.complexity > 1 || b.specializations.length > 0;
            
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            
            return a.name.localeCompare(b.name);
        });
        
        // Paginate skills
        const totalPages = Math.ceil(filteredSkills.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedSkills = filteredSkills.slice(startIndex, endIndex);
        
        // Update skill list
        this.skillList.innerHTML = '';
        
        if (paginatedSkills.length === 0) {
            this.skillList.innerHTML = '<div class="no-skills-message">No skills match your criteria.</div>';
        } else {
            paginatedSkills.forEach(skill => {
                const skillItem = this.createSkillItem(skill, showDetails);
                this.skillList.appendChild(skillItem);
            });
        }
        
        // Update pagination
        this.createPagination(totalPages);
        
        // Update buttons state
        this.updateButtonsState();
        
        // Update active skills summary
        this.updateSkillsSummary();
        
        // Call the update callback
        this.onUpdateCallback(this.skillManager.getSkillsForTraits());
    }

    /**
     * Update buttons state based on skill levels and points
     */
    updateButtonsState() {
        const points = this.skillManager.getSkillPoints();
        const remainingPoints = points.max - points.used;
        
        // Update all skill items
        this.skillManager.getCharacterSkills().forEach(skill => {
            // Level buttons
            