document.addEventListener("DOMContentLoaded", async () => {
  // Fetch the data
  try {
    const [response, zoneResponse, stateResponse] = await Promise.all([
      fetch('data.json'),
      fetch('zone_data.json'),
      fetch('state_data.json')
    ]);
    
    const data = await response.json();
    const zoneData = await zoneResponse.json();
    const stateData = await stateResponse.json();
    
    // Calculate KPIs
    let totalUnsuppressed = 0;
    let totalSuppressed = 0;
    let totalGap = 0;
    
    const dates = [];
    const unsuppressedData = [];
    const suppressedData = [];
    const gapData = [];
    
    data.forEach(item => {
      totalUnsuppressed += item.unsuppressed;
      totalSuppressed += item.suppressed;
      totalGap += item.gap;
      
      dates.push(item.date);
      unsuppressedData.push(item.unsuppressed);
      suppressedData.push(item.suppressed);
      gapData.push(item.gap);
    });
    
    // Formatting numbers
    const formatNumber = (num) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
    const count = data.length;
    
    document.getElementById('kpi-unsuppressed').innerText = formatNumber(totalUnsuppressed / count);
    document.getElementById('kpi-suppressed').innerText = formatNumber(totalSuppressed / count);
    document.getElementById('kpi-gap').innerText = formatNumber(totalGap / count);
    
    // Initialize Charts selectively based on current page
    if (document.getElementById('demandChart')) initChart(dates, unsuppressedData, suppressedData);
    if (document.getElementById('zoneChart')) initZoneChart(zoneData);
    if (document.getElementById('mapContainer')) initMapChart(stateData);
    
  } catch (error) {
    console.error("Error loading data:", error);
  }
});

function initChart(labels, unsuppressed, suppressed) {
  const ctx = document.getElementById('demandChart').getContext('2d');
  
  // Custom Gradients
  const bgUnsuppressed = ctx.createLinearGradient(0, 0, 0, 400);
  bgUnsuppressed.addColorStop(0, 'rgba(0, 119, 187, 0.1)');
  bgUnsuppressed.addColorStop(1, 'rgba(0, 119, 187, 0)');

  const bgGap = ctx.createLinearGradient(0, 0, 0, 400);
  bgGap.addColorStop(0, 'rgba(238, 119, 51, 0.25)'); // Gap Red Glow
  bgGap.addColorStop(1, 'rgba(238, 119, 51, 0)');
  
  // Chart.js Configuration
  Chart.defaults.color = '#4A5568';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Real Demand (Unsuppressed)',
          data: unsuppressed,
          borderColor: '#1A3A5C',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#1A3A5C',
          fill: '+1', // Fill down to the next dataset (Suppressed) to show the gap
          backgroundColor: bgGap, // Gives the gap that red glow
          tension: 0.4 // Smooth curves
        },
        {
          label: 'Supplied (Suppressed)',
          data: suppressed,
          borderColor: '#0077BB',
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0077BB',
          fill: 'origin', // Fill down to bottom
          backgroundColor: bgUnsuppressed,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false // Using custom HTML legend instead
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1A202C',
          bodyColor: '#4A5568',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y + ' MW';
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 12,
            maxRotation: 0,
            color: '#4A5568'
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          },
          ticks: { color: '#4A5568' },
          beginAtZero: true
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  });
}

function initZoneChart(zoneData) {
  const ctx = document.getElementById('zoneChart').getContext('2d');
  
  const labels = zoneData.map(d => d.zone);
  const unsuppressed = zoneData.map(d => d.unsuppressed);
  const suppressed = zoneData.map(d => d.suppressed);
  const gap = zoneData.map(d => d.gap);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Demand (Unsuppressed)',
          data: unsuppressed,
          backgroundColor: '#1A3A5C',
          borderRadius: 4
        },
        {
          label: 'Supply (Suppressed)',
          data: suppressed,
          backgroundColor: '#0077BB',
          borderRadius: 4
        },
        {
          label: 'Waste (Gap)',
          data: gap,
          backgroundColor: '#EE7733',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#4A5568' }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1A202C',
          bodyColor: '#4A5568',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y + ' MW';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#4A5568' }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { color: '#4A5568' }
        }
      }
    }
  });
}

function initMapChart(stateData) {
  // Map our state data to Highcharts map format
  const mapData = stateData.map(d => ({
    name: d.state,
    value: d.gap, // color by gap (waste)
    unsuppressed: d.unsuppressed,
    suppressed: d.suppressed
  }));

  Highcharts.mapChart('mapContainer', {
    chart: {
      backgroundColor: 'transparent',
      style: { fontFamily: "'DM Sans', sans-serif" }
    },
    title: { text: '' },
    mapNavigation: {
      enabled: true,
      buttonOptions: { verticalAlign: 'bottom' }
    },
    colorAxis: {
      min: 0,
      minColor: 'rgba(238, 119, 51, 0.05)',
      maxColor: '#EE7733',
      labels: { style: { color: '#4A5568' } }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      style: { color: '#1A202C' },
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      formatter: function () {
        if (!this.point.value) return this.point.name + ': No data';
        return `<b>${this.point.name}</b><br/>
                Demand: ${this.point.unsuppressed.toLocaleString()} MW<br/>
                Supplied: ${this.point.suppressed.toLocaleString()} MW<br/>
                Waste/Gap: ${this.point.value.toLocaleString()} MW`;
      }
    },
    series: [{
      data: mapData,
      mapData: Highcharts.maps['countries/ng/ng-all'],
      joinBy: ['name', 'name'],
      name: 'Power Gap',
      states: {
        hover: { color: '#0077BB' }
      },
      dataLabels: {
        enabled: true,
        format: '{point.name}',
        style: { color: '#1A202C', textOutline: 'none', fontWeight: '400', fontSize: '10px' },
        nullColor: '#4A5568'
      },
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 0.5
    }],
    credits: { enabled: false }
  });
}
