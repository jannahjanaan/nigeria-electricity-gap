import pandas as pd
import json
import math

# Load exactly the relevant rows
df = pd.read_excel('Nigeria National Demand Timeseries.xlsx', header=3)

# Make sure datetime is correctly parsed
df['date time'] = pd.to_datetime(df['date time'])
df['Date'] = df['date time'].dt.date

# Convert string values to numeric where needed, handling NaNs
df['National Unsuppressed Demand'] = pd.to_numeric(df['National Unsuppressed Demand'], errors='coerce')
df['National Suppressed Demand'] = pd.to_numeric(df['National Suppressed Demand'], errors='coerce')

# Aggregate the hourly data into daily averages
daily_avg = df.groupby('Date').agg({
    'National Unsuppressed Demand': 'mean',
    'National Suppressed Demand': 'mean'
}).reset_index()

# Drop rows where everything is NaN (if any)
daily_avg = daily_avg.dropna()

# Convert dates to string for JSON serialization
# Also calculate the gap for ease of plotting
data = []
for index, row in daily_avg.iterrows():
    unsup = row['National Unsuppressed Demand']
    sup = row['National Suppressed Demand']
    
    # Avoid sending NaNs in JSON
    if math.isnan(unsup) or math.isnan(sup):
        continue
        
    data.append({
        'date': str(row['Date']),
        'unsuppressed': round(unsup, 2),
        'suppressed': round(sup, 2),
        'gap': round(unsup - sup, 2)
    })

with open('data.json', 'w') as f:
    json.dump(data, f)

# --- MOCK DATA GENERATION FOR ZONES AND STATES ---
# Calculate overall averages for the mock data distribution
avg_unsuppressed = daily_avg['National Unsuppressed Demand'].mean()
avg_suppressed = daily_avg['National Suppressed Demand'].mean()

# Define zones, states, and their approximate load allocation weights (sum to 1.0)
zones = {
    'South West': {
        'weight': 0.35, 
        'states': {'Lagos': 0.60, 'Ogun': 0.15, 'Oyo': 0.10, 'Osun': 0.05, 'Ondo': 0.05, 'Ekiti': 0.05}
    },
    'North Central': {
        'weight': 0.20,
        'states': {'Federal Capital Territory': 0.50, 'Niger': 0.10, 'Kogi': 0.10, 'Kwara': 0.10, 'Nasarawa': 0.10, 'Plateau': 0.05, 'Benue': 0.05}
    },
    'South South': {
        'weight': 0.15,
        'states': {'Rivers': 0.40, 'Delta': 0.25, 'Edo': 0.15, 'Akwa Ibom': 0.10, 'Cross River': 0.05, 'Bayelsa': 0.05}
    },
    'North West': {
        'weight': 0.12,
        'states': {'Kano': 0.40, 'Kaduna': 0.30, 'Sokoto': 0.10, 'Katsina': 0.05, 'Kebbi': 0.05, 'Zamfara': 0.05, 'Jigawa': 0.05}
    },
    'South East': {
        'weight': 0.10,
        'states': {'Anambra': 0.30, 'Enugu': 0.25, 'Abia': 0.20, 'Imo': 0.15, 'Ebonyi': 0.10}
    },
    'North East': {
        'weight': 0.08,
        'states': {'Borno': 0.30, 'Bauchi': 0.25, 'Gombe': 0.15, 'Adamawa': 0.15, 'Yobe': 0.10, 'Taraba': 0.05}
    }
}

zone_data = []
state_data = []

for zone_name, zone_info in zones.items():
    z_weight = zone_info['weight']
    z_unsuppressed = avg_unsuppressed * z_weight
    z_suppressed = avg_suppressed * z_weight
    z_gap = z_unsuppressed - z_suppressed
    
    zone_data.append({
        'zone': zone_name,
        'unsuppressed': round(z_unsuppressed, 2),
        'suppressed': round(z_suppressed, 2),
        'gap': round(z_gap, 2)
    })
    
    for state_name, s_weight in zone_info['states'].items():
        s_unsuppressed = z_unsuppressed * s_weight
        s_suppressed = z_suppressed * s_weight
        s_gap = s_unsuppressed - s_suppressed
        
        state_data.append({
            'state': state_name,
            'zone': zone_name,
            'unsuppressed': round(s_unsuppressed, 2),
            'suppressed': round(s_suppressed, 2),
            'gap': round(s_gap, 2)
        })

with open('zone_data.json', 'w') as f:
    json.dump(zone_data, f)
    
with open('state_data.json', 'w') as f:
    json.dump(state_data, f)

print(f"Successfully generated data.json, zone_data.json ({len(zone_data)} zones), and state_data.json ({len(state_data)} states).")
