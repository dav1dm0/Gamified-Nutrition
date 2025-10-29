/**
 * =================================================================
 * Reusable Enumerated Types
 * =================================================================
 */

/**
 * Defines the available pet types.
 * @typedef {'cat' | 'dog'} PetType
 */

/**
 * =================================================================
 * Core Data Models
 * =================================================================
 */

/**
 * Represents a User's full profile, combining data from the
 * `users` table, including preferences.
 * @typedef {object} User
 * @property {string} id
 * @property {string} username
 * @property {number} level
 * @property {number} points
 * @property {PetType} petType
 * @property {boolean} hideLeaderboard
 * @property {boolean} hidePet
 */

/**
 * Represents a single ingredient for a meal suggestion.
 * @typedef {object} MealIngredient
 * @property {string} title
 * @property {string[]} allergies
 */

/**
 * Represents a Meal suggestion from the static `meals.json` file.
 * This is what the user browses and selects from.
 * @typedef {object} MealSuggestion
 * @property {number} id
 * @property {string} title
 * @property {number} readyInMinutes
 * @property {'Breakfast' | 'Lunch' | 'Dinner'} timeOfDay
 * @property {string} image
 * @property {MealIngredient[]} ingredients
 * @property {string} diet
 */



/**
 * =================================================================
 * API Response Shapes
 * =================================================================
 */

/**
 * Represents a single row from the leaderboard API response.
 * @typedef {object} LeaderboardEntry
 * @property {string} rank - (Note: rank is a string, as it comes from a DB RANK() function)
 * @property {string} username
 * @property {number} level
 * @property {number} points
 */

/**
 * Represents the user's configurable settings, used in the
 * preferences API request and response.
 * @typedef {object} UserPreferences
 * @property {PetType} petType
 * @property {boolean} hideLeaderboard
 * @property {boolean} hidePet
 */

/**
 * A simple object for returning updated points and level
 * after completing a meal.
 * @typedef {object} PointsAndLevel
 * @property {number} points
 * @property {number} level
 */



export default {};