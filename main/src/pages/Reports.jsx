import React from "react";
import { NavLink } from 'react-router-dom';
import { useState } from "react";
import logo from './logo.jpg';
import './Styles.css';

function Reports() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
          <h2 className="topbar-title">DASHBOARD</h2>
          <p className="topbar-welcome">Welcome, E12345</p>

          <div className="topbar-grid mb-4">
            <NavLink to="/inventory" className="topbar-card-box">
            <div className="topbar-card-title">Bottles to Receive</div>
              <div className="topbar-card-value">6,800 bottles</div>
            </NavLink>
            <NavLink to="/inventory" className="topbar-card-box">
              <div className="topbar-card-title">Bottles to Deliver</div>
              <div className="topbar-card-value">2,500 bottles</div>
            </NavLink>
            <NavLink to="/inventory" className="topbar-card-box">
              <strong>Inventory Summary</strong>
              <p className="topbar-placeholder">[Chart or summary here]</p>
            </NavLink>
          </div>

          <div className="topbar-grid-2col">
            <div className="topbar-inventory-box">
              <h5 className="topbar-section-title">Product Details</h5>
              <p>Low Stock Items: <span className="highlight-red">2</span></p>
              <div className="topbar-products">
                <p className="fw-semibold">Plastic Bottles</p>
                <p className="text-warning">350 ml: 1,012</p>
                <p className="text-danger">500 ml: 792</p>
                <p className="text-danger mb-3">1L: 521</p>
                <p className="fw-semibold">Plastic Caps</p>
                <p className="text-success">Blue Caps: 2,891</p>
              </div>

              <div className="topbar-legend">
                <div><span className="dot red"></span> Low Stock</div>
                <div><span className="dot yellow"></span> Warning</div>
                <div><span className="dot green"></span> Stable</div>
              </div>
            </div>

            <div className="topbar-inventory-box">
              <h5 className="topbar-section-title">Purchase Order</h5>
              <select className="topbar-select mt-2">
                <option>January 2025</option>
                <option>February 2025</option>
                <option>March 2025</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
