import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlined';
import { LineChart } from '@mui/x-charts';

// Función para formatear la fecha en MM/DD
const formatDate = (date) => {
  const month = date.getMonth() + 1; // Los meses son 0-indexados, por eso se suma 1
  const day = date.getDate();
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
};

const formatSensorType = (sensorType) => {
  switch (sensorType) {
    case 'temperatura':
      return 'Temperatura';
    case 'humedadrelativa':
      return 'Humedad Relativa';
    case 'ruido':
      return 'Ruido';
    default:
      return sensorType;
  }
};

function SensorSection({ sensorType, metrics, chart }) {
  return (
    <div className="sensor-section">
      <div className="sensor-metrics">
        <h2>{formatSensorType(sensorType)}</h2>
        <div className="metric-group">
          {metrics.map((metric, index) => (
            <div className="metric-card" key={`${sensorType}-${index}`}>
              <h3>{metric.title}</h3>
              <p>{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="sensor-chart">
        <h2>{chart.title}</h2>
        <LineChart
          xAxis={[
            {
              data: chart.xAxisData,
              scaleType: 'time',
              tickFormatter: (value) => formatDate(new Date(value)),
              tickMinStep: 3600 * 1000 * 24,
            },
          ]}
          series={chart.series}
          width={chart.width || 500}
          height={chart.height || 300}
        />
      </div>
    </div>
  );
}

function Dashboard() {
  const [metricsData, setMetricsData] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/globalmetrics');
        const data = await response.json();
        const filteredData = data.filter(
          (metric) => metric.maxima !== null && metric.minima !== null && metric.promedio !== null
        );
        setMetricsData(filteredData);

        const charts = filteredData.map((metric) => {
          const now = new Date();
          const dates = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            dates.push(date);
          }

          const min = parseFloat(metric.minima);
          const max = parseFloat(metric.maxima);
          const values = dates.map(() => (Math.random() * (max - min) + min).toFixed(2));

          return {
            title: `Tendencia de ${formatSensorType(metric.tipo_medicion)}`,
            xAxisData: dates,
            series: [{ data: values }],
          };
        });
        setChartData(charts);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchData();
  }, []);

  const openNewTab = () => {
    window.open(
      'http://10.38.32.137:3000/d/de15iqdns3gu8f/age-sensors?orgId=1&refresh=auto',
      '_blank'
    );
  };

  return (
    <div className="dashboard-container">
      <button className="open-dashboard-button" onClick={openNewTab}>
        <InsertChartOutlinedRoundedIcon />
      </button>
      <div className="header">
        <h1>Dashboard de Sensores</h1>
      </div>

      {/* <embed src="http://10.38.32.137:3000" style={{width: "1400px", height: "700px"}}/> */}

      <div className="sensor-sections">
        {metricsData.map((metricData, index) => {
          const sensorType = metricData.tipo_medicion;
          const metrics = [
            { title: 'Promedio Global', value: `${parseFloat(metricData.promedio).toFixed(2)}` },
            { title: 'Máximo', value: `${parseFloat(metricData.maxima).toFixed(2)}` },
            { title: 'Mínimo', value: `${parseFloat(metricData.minima).toFixed(2)}` },
          ];
          const chart = chartData[index];
          return (
            <SensorSection
              key={sensorType}
              sensorType={sensorType}
              metrics={metrics}
              chart={chart}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
