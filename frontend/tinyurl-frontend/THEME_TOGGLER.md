# Theme Toggler Implementation

## Overview
A custom animated theme toggler component that switches between light and dark themes with smooth transitions.

## Features
- **Smooth Animation**: The toggle button slides smoothly between light and dark positions
- **Visual Feedback**: Sun icon for light mode, moon icon for dark mode
- **Persistent State**: Theme preference is saved to localStorage
- **System Preference**: Respects user's system color scheme preference
- **Accessible**: Proper ARIA labels and keyboard support

## How it Works

### Theme Detection
1. Checks localStorage for saved theme preference
2. Falls back to system preference if no saved theme
3. Applies the appropriate theme class to document.documentElement

### Theme Switching
When the toggle is clicked:
1. Toggles the `dark` class on the document element
2. Updates all CSS custom properties for colors
3. Saves the new preference to localStorage
4. Animates the toggle button position and icons

### CSS Variables
The theme system uses CSS custom properties that change based on the `.dark` class:

**Light Mode:**
- Background: #ffffff (white)
- Foreground: #000000 (black)
- Secondary: #f9fafb (light gray)

**Dark Mode:**
- Background: #000000 (black)
- Foreground: #ffffff (white)
- Secondary: #1a1a1a (dark gray)

### Integration
The ThemeToggler component is added to all main navigation bars:
- LandingPage
- TinyURL (main app)
- Login
- Signup

## Usage
Simply click the toggle button to switch between light and dark themes. The theme preference will be remembered for future visits.

## Technical Details
- Uses React hooks (useState, useEffect) for state management
- Leverages Tailwind CSS for styling and transitions
- Compatible with existing shadcn/ui components
- Smooth 300ms transitions for all color changes