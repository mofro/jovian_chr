# Jovian Chronicles Character Creator

A web-based character creation tool for the **Jovian Chronicles** tabletop role-playing game, built using the **SilCORE system**. This application allows players and Game Masters (GMs) to create, customize, and manage characters with ease, supporting multiple game modes and dynamic data-driven customization.

## Features

- **Character Attributes**: Allocate points to primary attributes like Agility (AGI), Fitness (FIT), and Willpower (WIL) based on the selected game mode.
- **Skills Management**: Add and customize skills, including levels, complexity, and specializations, with an intuitive UI.
- **Perks & Flaws**: Select perks (benefits) and flaws (drawbacks) to further define your character, with point validation.
- **Game Modes**: Supports multiple game settings (e.g., Gritty, Adventurous, Cinematic) with predefined point limits.
- **Secondary Traits**: Automatically calculates derived stats based on primary attributes and skills.
- **Save & Load**: Save characters locally and load them later. Export and import character data for sharing or backup.
- **Dynamic Data**: Uses JSON files for skills, perks, and flaws, making it easy to update or expand the system.

## Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge).
- (Optional) A local development environment with Node.js and npm for running the project locally.

### Installation

1. Clone the repository:

> ```bash
> git clone https://github.com/your-username/jovian-character-creator.git
> cd jovian-character-creator

2. Open the project in your browser:

   - If no build tools are required, simply open index.html in your browser.

3. (Optional) Run a local development server:

- Install dependencies:

> ```bash
> npm install

- Start the development server:

> ```bash
> npm start

4. Access the application at 

> ```bash
> http://localhost:3000


### Usage

1. **Select a Game Mode**: Choose between Gritty, Adventurous, or Cinematic modes to set point limits.
2. **Allocate Attributes**: Distribute character points across primary attributes.
3. **Add Skills**: Select and customize skills, including levels and specializations.
4. **Choose Perks & Flaws**: Add perks and flaws to further define your character.
5. **Review Summary**: View a detailed summary of your character, including secondary traits.
6. **Save or Export**: Save your character locally or export it for sharing.

### File Structure

**index.html**: Main entry point for the application.
``css/``: Contains CSS files for styling the UI.
``js/``: JavaScript files for handling UI logic and data processing.
``data/``: JSON files for skills, perks, and flaws.
``.gitignore``: Specifies files and directories to ignore in version control.

```bash
Jovian Chronicles Character Creator/
│
├── index.html                # Main HTML file
│
├── css/                      # CSS styles directory
│   ├── base.css              # Base styling
│   ├── attributesStyles.css  # Attributes component styling
│   ├── secondaryTraitsStyles.css  # Secondary traits styling
│   ├── skillsStyles.css      # Skills component styling (to be added)
│   └── perksFlawsStyles.css  # Perks & Flaws styling (to be added)
│
├── js/                       # JavaScript files directory
│   ├── app.js                # Main application script
│   ├── attributeManager.js   # Attributes data management
│   ├── attributesUI.js       # Attributes UI management
│   ├── secondaryTraitsManager.js  # Secondary traits calculations
│   ├── secondaryTraitsUI.js  # Secondary traits UI management
│   ├── skillManager.js       # Skills data management (to be added)
│   ├── skillsUI.js           # Skills UI management (to be added)
│   ├── perksFlawsManager.js  # Perks & Flaws management (to be added)
│   └── perksFlawsUI.js       # Perks & Flaws UI (to be added)
│
└── data/                     # Data files directory
    ├── skills.json           # Skills data
    └── perks-flaws.json      # Perks and Flaws data
```



### Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch: ``git checkout -b feature/your-feature-name``
3. Commit your changes: ``git commit -m "Add your feature description"``
4. Push to your branch: ``git push origin feature/your-feature-name``
5. Open a pull request.

#### License

This project is licensed under the MIT License.

### Acknowledgments

- Inspired by the Jovian Chronicles RPG and the SilCORE system.
- Special thanks to the tabletop RPG community for their support and feedback.

### Contact

For questions or feedback, please contact [g.mofro@gmail.com].
