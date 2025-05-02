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
        this.onUpdateCallback = config.onUpdate || function () {};

        // Create skill manager
        this.skillManager = new SkillManager({
            skillsData: this.skillsData,
            maxSkillPoints: config.maxSkillPoints || 50,
            onUpdate: () => this.update(),
        });
        // console.log('this.skillsManager: ',this.skillManager);

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
        skillList.id = 'skill-list';
        skillsContainer.appendChild(skillList);
        this.skillList = skillList;

        // Create pagination
        const pagination = document.createElement('div');
        pagination.className = 'skill-pagination';
        pagination.id = 'skill-pagination';
        skillsContainer.appendChild(pagination);
        this.pagination = pagination;
    }

    /**
     * Update the UI to reflect current skill values
     */
    update() {
        // Update points display
        const points = this.skillManager.getSkillPoints();
        const pointsDisplay = document.getElementById('skill-points-display');
        const pointsUsed = document.getElementById('skill-points-used');

        if (pointsDisplay) {
            pointsDisplay.textContent = `${points.used}/${points.max}`;
        } else {
            console.error('Element with ID "skill-points-display" not found.');
        }

        if (pointsUsed) {
            pointsUsed.textContent = `${points.used}/${points.max}`;
        } else {
            console.error('Element with ID "skill-points-used" not found.');
        }

        // Update skill list and other UI elements
        this.updateSkillList();
        this.updateButtonsState();
    }

    /**
     * Update the skill list based on filters and pagination
     */
    updateSkillList() {
        this.skillList.innerHTML = 'hello world';

        // Filter and paginate skills
        const filteredSkills = this.skillManager
            .getCharacterSkills()
            .filter((skill) => {
                const matchesCategory =
                    this.currentCategory === 'all' ||
                    skill.category.toLowerCase() === this.currentCategory;
                const matchesSearch =
                    this.searchQuery === '' ||
                    skill.name.toLowerCase().includes(this.searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            });

        const totalPages = Math.ceil(filteredSkills.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedSkills = filteredSkills.slice(
            startIndex,
            startIndex + this.itemsPerPage
        );

        // Render skills
        paginatedSkills.forEach((skill) => {
            const skillItem = this.createSkillItem(skill, true);
            this.skillList.appendChild(skillItem);
        });

        // Update pagination
        this.createPagination(totalPages);
    }

    /**
     * Create a skill item element
     * @param {Object} skill - Skill data
     * @param {boolean} showDetails - Whether to show details
     * @returns {HTMLElement} Skill item element
     */
    createSkillItem(skill, showDetails) {
        const item = document.createElement('div');
        item.className = 'skill-item';

        // Skill header
        const header = document.createElement('div');
        header.className = 'skill-header';
        header.innerHTML = `
            <div class="skill-name">${skill.name}</div>
            <div class="skill-category">${skill.category}</div>
        `;
        item.appendChild(header);

        // Skill details
        if (showDetails) {
            const details = document.createElement('div');
            details.className = 'skill-details';
            details.innerHTML = `
                <div>Level: ${skill.level}</div>
                <div>Complexity: ${skill.complexity}</div>
                <div>Cost: ${skill.cost}</div>
            `;
            item.appendChild(details);
        }

        return item;
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
     * Update buttons state based on skill levels and points
     */
    updateButtonsState() {
        const points = this.skillManager.getSkillPoints();
        const remainingPoints = points.max - points.used;

        // Update all skill items
        this.skillManager.getCharacterSkills().forEach((skill) => {
            // Logic to enable/disable buttons based on remaining points
        });
    }
}
