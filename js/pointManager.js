export default class PointManager {
    constructor({ characterPoints, skillPoints }) {
        this.totalCharacterPoints = characterPoints;
        this.usedCharacterPoints = 0;

        this.totalSkillPoints = skillPoints;
        this.usedSkillPoints = 0;

        this.listeners = [];
    }

    /**
     * Add points to a category (character or skill points)
     * @param {string} category - 'character' or 'skill'
     * @param {number} amount - Points to add
     */
    addPoints(category, amount) {
        if (category === 'character') {
            this.usedCharacterPoints += amount;
        } else if (category === 'skill') {
            this.usedSkillPoints += amount;
        }
        this.notifyListeners();
    }

    /**
     * Remove points from a category (character or skill points)
     * @param {string} category - 'character' or 'skill'
     * @param {number} amount - Points to remove
     */
    removePoints(category, amount) {
        if (category === 'character') {
            this.usedCharacterPoints -= amount;
        } else if (category === 'skill') {
            this.usedSkillPoints -= amount;
        }
        this.notifyListeners();
    }

    /**
     * Get remaining points for a category
     * @param {string} category - 'character' or 'skill'
     * @returns {number} Remaining points
     */
    getRemainingPoints(category) {
        if (category === 'character') {
            return this.totalCharacterPoints - this.usedCharacterPoints;
        } else if (category === 'skill') {
            return this.totalSkillPoints - this.usedSkillPoints;
        }
        return 0;
    }

    /**
     * Reset all points to their initial state
     */
    resetPoints() {
        this.usedCharacterPoints = 0;
        this.usedSkillPoints = 0;
        this.notifyListeners();
    }

    /**
     * Add a listener for point changes
     * @param {function} listener - Callback function
     */
    addListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * Notify all listeners of point changes
     */
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}