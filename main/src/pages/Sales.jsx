import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import LineChartSales from './LineChartSales'; // ✔️ Match the filename
import logo from './logo.jpg';
import './Styles.css';

function Sales() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const [overviewOpen, setOverviewOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/overview/sales') || location.pathname.includes('/overview/demand')) {
      setOverviewOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className={`dashboard-container ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <button
        className="sidebar-toggle-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '⟨' : '⟩'}
      </button>

      <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'} ${overviewOpen ? 'scrollable' : ''}`}>
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>
        <ul className="list-unstyled">
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Dashboard</NavLink></li>
          <li><NavLink to="/inventory" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Inventory</NavLink></li>
          <li><NavLink to="/sales-order" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Sales Order</NavLink></li>
          <li><NavLink to="/purchase-order" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Purchase Order</NavLink></li>
          <li><NavLink to="/reports" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Reports</NavLink></li>
          <li>
            <div className="nav-link" onClick={() => setOverviewOpen(!overviewOpen)} style={{ cursor: "pointer" }}>
              {isSidebarOpen ? `Overview ${overviewOpen ? "▲" : "▼"}` : '≡'}
            </div>
            {overviewOpen && isSidebarOpen && (
              <ul className="list-unstyled ps-3">
                <li>
                  <NavLink to="/overview/sales" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Sales</NavLink>
                </li>
                <li>
                  <NavLink to="/overview/demand" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Demand</NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <div
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="nav-link logout-button"
              style={{ cursor: "pointer" }}
            >
              Logout
            </div>
          </li>
        </ul>
      </aside>

      <div className="main-content">
        <div className="topbar-card">
          <div className="mt-4">
            <h2 className="text-2xl font-semibold mb-4">SALES</h2>
            <div style={{ maxWidth: "700px", margin: "auto" }}>
              <LineChartSales />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
