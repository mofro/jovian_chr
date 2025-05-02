/**
 * File: js/skillsUI.js
 * UI component for skills management
 */

import SkillsStore from './skillManager.js';

/**
 * SkillsUI Class
 * Handles the UI elements for skills section
 */
export default class SkillsUI {
    /**
     * Initialize the SkillsUI
     * @param {HTMLElement} container - Container element for the skills UI
     * @param {Object} config - Configuration object
     * @param {Object} config.skillsStore - Skills store instance
     * @param {number} config.maxSkillPoints - Maximum skill points
     * @param {function} config.onUpdate - Callback when skills change
     */
    constructor(container, config = {}) {
        this.container = container;
        this.skillsStore = config.skillsStore;
        this.onUpdateCallback = config.onUpdate || function () {};

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
                    ${this.skillsStore.getCategories()
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
        this.skillList.innerHTML = ''; // Clear the skill list

        // Fetch all skills from SkillsStore
        const allSkills = this.skillsStore.getStaticSkills();

        // Apply category filter
        const filteredByCategory = this.currentCategory === 'all'
            ? allSkills
            : allSkills.filter(skill => skill.category.toLowerCase() === this.currentCategory);

        // Apply search filter
        const filteredSkills = this.searchQuery
            ? filteredByCategory.filter(skill =>
                  skill.name.toLowerCase().includes(this.searchQuery.toLowerCase())
              )
            : filteredByCategory;

        // Paginate the filtered skills
        const totalPages = Math.ceil(filteredSkills.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedSkills = filteredSkills.slice(startIndex, startIndex + this.itemsPerPage);

        // Render skills
        if (paginatedSkills.length === 0) {
            const noSkillsMessage = document.createElement('div');
            noSkillsMessage.className = 'no-skills-message';
            noSkillsMessage.textContent = 'No skills match your criteria.';
            this.skillList.appendChild(noSkillsMessage);
        } else {
            paginatedSkills.forEach((skill) => {
                const skillItem = this.createSkillItem(skill);
                this.skillList.appendChild(skillItem);
            });
        }

        // Update pagination
        this.createPagination(totalPages);
    }

    /**
     * Create a skill item element
     * @param {Object} skill - Skill data
     * @returns {HTMLElement} Skill item element
     */
    createSkillItem(skill) {
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
        const details = document.createElement('div');
        details.className = 'skill-details';
        details.innerHTML = `
            <div>Description: ${skill.description}</div>
            <div>Complex: ${skill.complex}</div>
        `;
        item.appendChild(details);

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
     * Update the UI to reflect current skill values
     */
    update() {
        this.updateSkillList();
    }
}
