import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ForecastChart() {
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/forecast')
      .then(res => {
        if (Array.isArray(res.data)) {
          setForecastData(res.data);
        } else {
          setError('⚠️ No forecast data received.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('❌ Failed to fetch forecast data.');
      });
  }, []);

  return (
    <div className="forecast-wrapper" style={{ padding: '20px', minHeight: '100vh', background: '#f9f9f9' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className="mb-4 text-center" style={{ fontWeight: 'bold', fontSize: '2rem' }}>
          📈 Demand Forecast for the Next 30 Days
        </h2>

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        {!error && forecastData.length > 0 && (
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer>
              <LineChart data={forecastData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="predicted_qty"
                  stroke="#007bff"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Predicted Quantity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="text-center mt-4">
          <a href="/records" className="btn btn-secondary">⬅ Back to Records</a>
        </div>
      </div>
    </div>
  );
}
