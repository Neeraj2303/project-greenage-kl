# GREENAGE-KL / MIKRA-EPIGEN-2026 Clinical Data Entry System & Multi-Omics Dashboard

This repository contains the software and clinical data components for the **GREENAGE-KL** study. The project is designed to address the early-onset cardiovascular crisis (Coronary Artery Disease) in Kerala through a multi-omics, cohort-based research platform.

---

## 📂 Repository Structure

The workspace is organized into two primary applications, supported by data resources and automation scripts:

```
PROJECT_GREENAGE-KL/
├── dashboard/                  # React & TypeScript Research Dashboard (Vite)
│   ├── src/                    # App source code (Components, Layouts, Pages, Store)
│   ├── public/                 # Static assets
│   ├── package.json            # Vite React dependencies and scripts
│   └── tsconfig.json           # TypeScript configuration
│
├── index.html                  # Root Clinical Data Entry System (Vanilla HTML SPA)
├── script.js                   # Application logic, clinical calculations & local storage caching
├── styles.css                  # Custom styling (HSL color palette, responsive forms, visual states)
│
├── convert_xlsx.py             # Python script for preprocessing & database conversion
├── update_geojson.py           # Python script for managing geographic/district layers
├── Kerala_CVD_MultiOmics_Database.xlsx  # Multi-omics study dataset (Private data)
│
├── Project_GREENAGE-KL.pdf      # Complete project description & scientific protocol
├── STRUCTURE ABSTRACT.docx     # Abstract outline
├── project_summary.txt         # Functional and technical documentation
└── excel_summary.txt           # Data dictionary and sheet shapes of the Excel database
```

---

## 🩺 1. Clinical Data Entry System (Root Level)

A lightweight, high-performance, single-page application (SPA) built using vanilla web technologies. It facilitates direct patient data entry across **16 modular clinical panels**:

*   **Demographics & Consent:** Age auto-calculation, socioeconomic status, and lifestyle variables.
*   **Anthropometry:** Body mass index (BMI Asian-specific category), waist-to-hip ratio (WHR), body composition.
*   **Cardiovascular Vitals:** Systolic/Diastolic averages, pulse pressure, mean arterial pressure (MAP), and AHA classification.
*   **Lab Profile:** Lipid ratios (Non-HDL-C, TC/HDL, LDL/HDL), glucose indices (HOMA-IR), liver and renal function.
*   **FABP-NIR Spectroscopy:** Near-infrared clinical biomarker category classification.
*   **Echocardiography:** LVEF, Global Longitudinal Strain (GLS) categories, and diastolic dysfunction parameters (E/A & E/e' ratios).
*   **CardioSense HRV:** Autonomic balance (LF/HF ratio & Shannon Entropy).
*   **SNP Genotyping:** Genotypes for cardiovascular risk genes, genomic risk scores, and clinical alerts (e.g., MTHFR action).
*   **Shannon Codon Resilience:** Calculations of codon degeneracy entropy ($J'$) across 21 families to trigger sulforaphane dose adjustments.
*   **Microgreen Compliance & Safety:** Consumed vs. delivered compliance index over 26 fortnights and Adverse Event (AE/SAE) monitoring.

### Data Storage & Portability
- **Storage:** Client-side persistence using browser `LocalStorage` (under key `greenage_data`).
- **Export:** Click **Export to CSV** to compile, parse, and export the database as a single aggregated cohort sheet.

---

## 📊 2. Research & Population Dashboard (`/dashboard`)

A modern, highly visual, React + TypeScript single-page application optimized for population analytics, cohort tracking, and research insights.

### Tech Stack
*   **Framework:** React 18, Vite, TypeScript
*   **State Management:** Zustand
*   **Charts:** Apache ECharts for rendering heavy multi-omics charts
*   **Styling:** TailwindCSS with a tailored medical/scientific dark mode
*   **Mapping:** Leaflet/Custom GeoJSON visualization for the 14 districts of Kerala

### Features
*   **Cohort Overview:** Overall enrollment, patient timelines, and clinical distribution metrics.
*   **District-level Analytics:** Heatmaps, case counts, and geographical risk distributions across Kerala.
*   **Clinical & Molecular Analytics:** In-depth cohort correlation plots, scatter plots, and biological data summaries.
*   **AI Analytics:** Pre-calculated predictive trends and outcome classifications.
*   **Intervention Compliance:** Interactive logs tracking patient cohort compliance with sulforaphane-rich cruciferous microgreen supplements.

---

## 🚀 How to Run Locally

### 1. Running the Clinical Data Entry System
Since the root level system is a static web application:
1. Open the root `index.html` directly in any web browser.
2. No local servers are required, but you can serve it using extensions like *Live Server* in VS Code or running `npx serve .` in the root directory.

### 2. Running the Research Dashboard
To start the React development server:
```bash
cd dashboard
npm install
npm run dev
```
The application will default to running on `http://localhost:5173`.

---

## 🛠️ Data & Preprocessing Python Scripts

- **`convert_xlsx.py`**: Extracts sheet data from `Kerala_CVD_MultiOmics_Database.xlsx` and formats it into clean JSON structures.
- **`update_geojson.py`**: Interlaces statistical district metrics with Kerala geographical GeoJSON data for the interactive map.

*Note: Ensure you have standard libraries (`pandas`, `openpyxl`) installed before executing these scripts.*
