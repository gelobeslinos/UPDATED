import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // ✅ Import navigation hook
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // ✅ Initialize navigate

  // Fetch completed orders
  useEffect(() => {
    axios.get('http://localhost:8000/api/sales-orders')
      .then(res => {
        const completedOrders = res.data.filter(order => order.status === "Completed");
        setRecords(completedOrders);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to fetch records.');
      });
  }, []);

  // Format order number
  const formatOrderNumber = (order) => {
    const datePart = order.date?.replace(/-/g, '') || '00000000';
    const idPart = String(order.id || 0).padStart(4, '0');
    return `SO-${datePart}-${idPart}`;
  };

  const formatQuantities = (quantities) => {
    if (typeof quantities !== 'object' || !quantities) return '';
    return Object.entries(quantities)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <div className="container my-4">
      {/* Sticky Header */}
      <div
        className="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm sticky-top"
        style={{ top: '70px', zIndex: 1000 }}
      >
        <h2 className="fw-bold text-dark m-0">📦 Completed Sales Orders</h2>
        <button
          className="btn btn-primary shadow"
          onClick={() => navigate('/forecast')}  // ✅ Navigate to ForecastChart
        >
          📈 Predict Demand
        </button>
      </div>

      {/* Completed Orders Table */}
      <div className="card shadow border-0 mt-4">
        <div className="card-body p-4" style={{ overflowX: 'auto' }}>
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-dark text-center">
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Products</th>
                <th>Quantities</th>
                <th>Qty 350ml</th>
                <th>Qty 500ml</th>
                <th>Qty 1L</th>
                <th>Qty 6L</th>
                <th>Amount</th>
                <th>Date Ordered</th>
                <th>Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((order, index) => (
                  <tr key={index}>
                    <td className="fw-semibold">{formatOrderNumber(order)}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.location}</td>
                    <td>{order.products}</td>
                    <td>{formatQuantities(order.quantities)}</td>
                    <td>{order.qty_350ml}</td>
                    <td>{order.qty_500ml}</td>
                    <td>{order.qty_1L}</td>
                    <td>{order.qty_6L}</td>
                    <td className="text-success fw-bold">
                      ₱{parseFloat(order.amount).toFixed(2)}
                    </td>
                    <td>{order.date}</td>
                    <td>{order.delivery_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center text-muted">
                    No completed orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
