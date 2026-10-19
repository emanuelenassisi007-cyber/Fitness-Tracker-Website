# Fitness Tracker

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A lightweight, privacy-focused **Fitness Tracker** web application. It allows users to log their daily calorie intake, track weight fluctuations, calculate their Basal Metabolic Rate (BMR), and visualize their weight journey over time.

 **[View Live Demo](https://emanuelenassisi007-cyber.github.io/Fitness-Tracker-Website/)**

---

## Features

-  **Daily Logging:** Easily track your daily weight, calorie consumption, and target weight goals.
-  **BMR Calculator:** Automatically estimates your recommended daily calorie intake using the professional *Mifflin-St Jeor* equation tailored for men and women.
-  **Dynamic Vanilla Charting:** Renders a smooth weight history line graph using native HTML5 Canvas API (zero external library overhead).
-  **Local Data Persistence:** Saves all data locally using the browser's `localStorage`—your data never leaves your device.
-  **Goal Tracking:** Dynamically computes how many kilograms are left to reach your target weight.

---

## Tech Stack

- **Frontend:** HTML5, CSS3 (System UI typography & clean layout)
- **Logic:** Vanilla JavaScript (ES6)
- **Storage:** Web Storage API (`localStorage`)
- **Graphics:** HTML5 Canvas API

---

## Project Structure

```text
├── README.md          
├── index.html          
├── script.js        
└── style.css          
```
---

##  How It Works (Under the Hood)

### 1. BMR Calculation
The app calculates your recommended daily calories based on the **Mifflin-St Jeor** formula:

*   **Men:** $BMR = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (years)} + 5$
*   **Women:** $BMR = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age (years)} - 161$

### 2. Custom Canvas Graph
Instead of loading heavy charting libraries, the application maps the minimum and maximum logged weights directly to the pixel coordinates of an HTML5 `<canvas>`, drawing an optimized vector line trend.

---

## Future Improvements

- [ ]  **Responsive Inputs:** Refine the CSS layout to better support smaller mobile screens.
- [ ]  **Dark Mode:** Add a modern dark theme toggle.
- [ ]  **Data Management:** Add a button to delete specific entries or clear the entire history.
- [ ]  **Advanced Graphics:** Add grid lines and dates to the canvas chart axes.
