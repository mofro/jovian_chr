# Jovian Chronicles Character Creator

## Overview

This application is a basic character creator for the Jovian Chronicles tabletop role-playing game. It's built as a web application using HTML, CSS, and JavaScript, allowing users to create, save, and load characters using the SilCORE system that powers Jovian Chronicles.

## Game System Implementation

The Jovian Chronicles RPG uses the Silhouette Core (SilCORE) system, which is a point-buy system with separate pools for attributes and skills.

### Character Points and Power Level

This implementation uses:
- 50 Character Points for attributes
- 70 Skill Points for skills

This corresponds to the "Cinematic Game" power level in SilCORE, which is the highest of the three available power levels. This power level is specifically designed to simulate the anime-inspired setting of Jovian Chronicles.

### Attributes

The character creator implements all 10 base attributes used in the SilCORE system:

1. **Agility (AGI)**: Physical coordination and dexterity
2. **Appearance (APP)**: Physical attractiveness and presence
3. **Build (BLD)**: Physical size and mass (-5 to +5 range)
4. **Creativity (CRE)**: Mental agility and problem-solving
5. **Fitness (FIT)**: Physical endurance and health
6. **Influence (INF)**: Leadership and diplomatic abilities
7. **Knowledge (KNO)**: Education and memory
8. **Perception (PER)**: Awareness of surroundings
9. **Psyche (PSY)**: Mental stability and emotional resilience
10. **Willpower (WIL)**: Mental fortitude and determination

Most attributes range from -3 to +3 for human characters, with Build being the exception with a range of -5 to +5.

### Skills

The implementation includes a representative selection of skills commonly used in Jovian Chronicles, particularly focusing on the exo-armor (mecha) operation skills that are central to the game.

Skills are divided into:
- **Regular skills**: Base cost
- **Complex skills**: Double cost

The skill costs follow a progressive curve:
- Level 1: 1 point (2 for complex)
- Level 2: 4 points (8 for complex)
- Level 3: 9 points (18 for complex)

This progressive cost curve discourages players from min-maxing by dumping all their points into a single skill, encouraging more balanced character builds.

### Secondary Traits

The system calculates several derived traits based on the primary attributes:

1. **Strength (STR)**: (Build + Fitness) / 2, rounded toward zero
2. **Health (HLT)**: (Fitness + Psyche + Willpower) / 3, rounded off
3. **Stamina (STA)**: (5 × (Build + Health)) + 25, minimum 1
4. **Unarmed Damage**: 3 + Strength + Build + Hand-to-Hand skill level, minimum 1

These secondary traits represent the character's physical capabilities and are automatically updated whenever relevant attributes or skills change.

## User Interface Features

The application provides a clean, user-friendly interface for character creation:

1. **Character Information**: Basic identification for your character
2. **Attributes Section**: Interactive grid of the 10 primary attributes with increment/decrement controls
3. **Secondary Traits Display**: Automatically calculated derived statistics
4. **Skills Section**: List of available skills with level controls and cost display
5. **Save/Load System**: Ability to save characters to browser storage and reload them later

The interface tracks the usage of Character Points and Skill Points in real-time, preventing users from exceeding their allocation.

## Technical Implementation

### Data Structure

The application uses several key data structures:

1. **Attributes Object**: Stores the current value of each attribute
2. **Skills Array**: Contains objects representing each skill, including:
   - Name
   - Complexity flag
   - Current level
   - Complexity level

3. **Points Tracking**: Variables for tracking point allocation

### Storage

The current implementation uses browser localStorage for character persistence, which allows:
- Saving multiple characters
- Loading saved characters
- Characters to persist between sessions

### Future Enhancements

This basic implementation could be extended in several ways:

1. **Server-Side Storage**: Moving from localStorage to a database
2. **Equipment System**: Adding support for purchasing and tracking equipment
3. **Character Export**: Functionality to export characters as PDF or printable sheets
4. **Advanced Skill Options**: Adding skill specializations and more granular complexity settings
5. **Full Skill List**: Implementing the complete skill list from the rulebook
