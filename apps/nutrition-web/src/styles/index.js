import './global.css';

// CSS Modules exports 
export { default as leaderboardStyles } from './Leaderboard.module.css';
export { default as mealCardStyles } from './MealCard.module.css';
export { default as authFormStyles } from './AuthForm.module.css';
export {default as levelUpModalStyles} from './LevelUpModal.module.css';
export {default as progressBarStyles} from './ProgressBar.module.css';
export {default as navbarStyles} from './Navbar.module.css';

export {default as dashboardStyles} from './Dashboard.module.css';
export {default as notFoundStyles} from './NotFound.module.css';
export {default as leaderboardPagestyles} from './LeaderboardPage.module.css';
export {default as homeStyles} from './Home.module.css';

export {default as petStyles} from './Pet.module.css';
export {default as settingsStyles} from './Settings.module.css';
export {default as buttonStyles} from './Button.module.css';
export {default as inputStyles} from './Input.module.css';


// Global utility exports
export const colors = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)'
};

export const spacing = {
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)'
};