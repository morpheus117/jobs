# US Salary Explorer (OEWS)

An interactive web application for exploring occupational wages across US states, built with React + Vite. Data is sourced from the Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program.

---

## Features

- **Occupation selector** — Searchable dropdown listing 15 major job categories
- **State selector** — Filter wages by any of 24 US states
- **Job image panel** — A full-bleed photo representing each occupation updates dynamically when you change the selected job
- **Wage display** — Annual mean wage and estimated hourly rate for the selected occupation/state pair
- **Top-10 bar chart** — Highest-paying states for the selected occupation; the currently selected state is highlighted in amber

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/morpheus117/jobs.git
cd jobs/us-salary-explorer

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

---

## How to Use

1. **Select an occupation** using the searchable dropdown on the left — type to filter the list.
2. **Select a state** using the native dropdown on the right.
3. The **wage card** updates instantly, showing:
   - A photo representative of the selected occupation
   - Annual mean wage for that occupation in the chosen state
   - Estimated hourly rate (annual wage ÷ 2,080 working hours)
4. The **bar chart** below shows the top 10 highest-paying states for the selected occupation. Your chosen state is highlighted in gold if it appears in the top 10.

---

## Job Image Feature

When a user selects an occupation, a relevant royalty-free photo is displayed as a hero image on the left side of the wage card. On mobile devices (≤ 700 px wide) the image appears above the wage data.

### How it works

| File | Role |
|------|------|
| `src/data/jobImages.js` | Maps every occupation title to a local image filename and Unsplash attribution metadata |
| `public/images/jobs/` | Directory holding all 15 JPEG images served as static assets |
| `src/components/WageDisplay.jsx` | Renders the image panel alongside the wage information |
| `src/App.jsx` | Resolves the image path from `jobImages` and passes it to `WageDisplay` |

### Adding or replacing an image

1. Place the new JPEG in `public/images/jobs/`.
2. Update the corresponding entry in `src/data/jobImages.js`:

```js
'Software Developers': {
  file: 'software-developers.jpg',   // filename in public/images/jobs/
  alt: 'Person coding on a laptop',  // accessible alt text
  photographer: 'Photographer Name',
  photographerUrl: 'https://unsplash.com/@handle',
  photoUrl: 'https://unsplash.com/photos/...',
},
```

---

## File Structure

```
jobs/
├── state_M2024_dl.xlsx          # Raw BLS OEWS data (May 2024)
└── us-salary-explorer/
    ├── public/
    │   ├── salaries.json                  # Pre-processed salary data (360 entries)
    │   └── images/
    │       └── jobs/                      # Job occupation photos (15 JPEGs)
    │           ├── software-developers.jpg
    │           ├── registered-nurses.jpg
    │           ├── general-operations-managers.jpg
    │           ├── accountants-auditors.jpg
    │           ├── elementary-school-teachers.jpg
    │           ├── retail-salespersons.jpg
    │           ├── customer-service-representatives.jpg
    │           ├── truck-drivers.jpg
    │           ├── lawyers.jpg
    │           ├── marketing-managers.jpg
    │           ├── financial-analysts.jpg
    │           ├── mechanical-engineers.jpg
    │           ├── electricians.jpg
    │           ├── construction-laborers.jpg
    │           └── physicians-surgeons.jpg
    ├── src/
    │   ├── data/
    │   │   └── jobImages.js               # Occupation -> image mapping + attribution
    │   ├── components/
    │   │   ├── WageDisplay.jsx            # Wage card with job image panel
    │   │   ├── SalaryBarChart.jsx         # Top-10 states bar chart
    │   │   └── SearchableSelect.jsx       # Filterable occupation dropdown
    │   ├── App.jsx                        # Root component and state management
    │   ├── App.css                        # All application styles
    │   └── main.jsx                       # React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Image Attribution

All images are sourced from [Unsplash](https://unsplash.com) under the **Unsplash License**, which permits free use for commercial and non-commercial purposes without attribution (though attribution is appreciated and provided here).
Full license: https://unsplash.com/license

| Occupation | Photographer | Unsplash Link |
|---|---|---|
| Software Developers | Christopher Gower | [View photo](https://unsplash.com/photos/m_HRfLhgABo) |
| Registered Nurses | National Cancer Institute | [View photo](https://unsplash.com/photos/701-FJcjLAQ) |
| General and Operations Managers | Brooke Cagle | [View photo](https://unsplash.com/photos/g1Kr4Ozfoac) |
| Accountants and Auditors | Towfiqu barbhuiya | [View photo](https://unsplash.com/photos/jpqyfK7GB4w) |
| Elementary School Teachers | National Cancer Institute | [View photo](https://unsplash.com/photos/BVr3XaBiM9Y) |
| Retail Salespersons | Artificial Photography | [View photo](https://unsplash.com/photos/zebS5p_MnYo) |
| Customer Service Representatives | Pavan Trikutam | [View photo](https://unsplash.com/photos/71CjSSB83Wo) |
| Heavy and Tractor-Trailer Truck Drivers | Rhys Moult | [View photo](https://unsplash.com/photos/2LJ4rqK2qfU) |
| Lawyers | Tingey Injury Law Firm | [View photo](https://unsplash.com/photos/DZpc4UY8ZtY) |
| Marketing Managers | Austin Distel | [View photo](https://unsplash.com/photos/744oGeqpxPQ) |
| Financial Analysts | Maxim Hopman | [View photo](https://unsplash.com/photos/IayKLkmz6g0) |
| Mechanical Engineers | ThisisEngineering RAEng | [View photo](https://unsplash.com/photos/8oR0ZiIuMpY) |
| Electricians | Tima Miroshnichenko | [View photo](https://unsplash.com/photos/5307663) |
| Construction Laborers | Scott Blake | [View photo](https://unsplash.com/photos/x-ghf9LjrVg) |
| Physicians and Surgeons | Olga Guryanova | [View photo](https://unsplash.com/photos/ft7vJxwl2RY) |

---

## Data Source

Salary data is derived from the **Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS)** program, May 2024 release.

- Source file: `state_M2024_dl.xlsx`
- Program page: https://www.bls.gov/oes/
- The dataset included in this project (`public/salaries.json`) is a curated sample of **15 occupations × 24 states = 360 data points** for illustrative purposes.

Each record in `salaries.json` contains:

| Field | Type | Description |
|-------|------|-------------|
| `occ_code` | string | BLS 6-digit occupation code (e.g. `"15-1252"`) |
| `occ_title` | string | Occupation title (e.g. `"Software Developers"`) |
| `state` | string | Full state name (e.g. `"California"`) |
| `state_abbr` | string | 2-letter abbreviation (e.g. `"CA"`) |
| `a_mean` | number | Annual mean wage in USD |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| [react](https://react.dev) | ^18.3.1 | UI library |
| [react-dom](https://react.dev) | ^18.3.1 | DOM rendering |
| [chart.js](https://www.chartjs.org) | ^4.4.3 | Chart engine |
| [react-chartjs-2](https://react-chartjs-2.js.org) | ^5.2.0 | React wrapper for Chart.js |
| [vite](https://vitejs.dev) | ^5.4.0 | Build tool and dev server |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | ^4.3.1 | Vite React plugin (Babel) |

---

## License

This project is released for educational and illustrative purposes. Salary data is public domain (BLS). Images are used under the Unsplash License.
