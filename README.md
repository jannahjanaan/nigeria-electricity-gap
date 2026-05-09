# Nigeria Electricity Gap Analysis

A web dashboard that visualises the gap between electricity demand and actual supply in Nigeria. The project takes national timeseries data and breaks it down to show where the power deficit is highest across different zones and states.

## What's in this project

I built this to look at the difference between "unsuppressed demand" (what people actually need) and "suppressed demand" (what is actually supplied to them). 

The dashboard includes:
- **Timeline Analysis**: A chart showing daily demand vs supply over time to highlight the gap.
- **Zonal Analysis**: Breaking down the power data into Nigeria's 6 geopolitical zones.
- **State Map Analysis**: An interactive choropleth map showing the electricity gap across different states.

## Tech Stack

- **Data Processing**: Python (Pandas) is used to clean and aggregate the raw Excel data into JSON files.
- **Frontend**: HTML, CSS, and vanilla JavaScript.
- **Visualisation**: Chart.js for the charts and Highmaps for the interactive state map.

## How to run it locally

1. Clone or download this repository to your computer.
2. The data is already processed into JSON files (`data.json`, `state_data.json`, `zone_data.json`).
3. If you want to re-process the raw data yourself, you need Python and Pandas installed. Just run:
   ```bash
   python process_data.py
   ```
4. To view the dashboard, you need to run a local web server (opening the HTML files directly might block the JSON data from loading).
   If you have Python installed, open your terminal in the project folder and run:
   ```bash
   python -m http.server
   ```
5. Open your browser and go to `http://localhost:8000`.

## Data Source

The project uses the "Nigeria National Demand Timeseries" dataset. *Note: While the national timeline data is exact, the state and zonal breakdowns use an estimated allocation model based on regional weightings for visualization purposes.*
