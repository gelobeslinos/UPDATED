// Same imports as before
import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import logo from './logo.jpg';
import './Styles.css';
import axios from "axios";

function Dashboard() {
  const storedCompanyID = localStorage.getItem("companyID");
  if (!storedCompanyID) {
    window.location.href = "/";
    return null;
  }

  const [logoutDropdownOpen, setLogoutDropdownOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [rawMats, setRawMats] = useState([]);
  const [lowRawMatsCount, setLowRawMatsCount] = useState(0);
  const companyID = localStorage.getItem("companyID");

  const orders = [
    { date: "2025-06-01", type: "PO-001", delivery: "2025-06-05", status: "Pending", amount: "₱15,000" },
    { date: "2025-06-02", type: "PO-002", delivery: "2025-06-08", status: "Delivered", amount: "₱8,500" },
    { date: "2025-06-03", type: "PO-003", delivery: "2025-06-09", status: "Processing", amount: "₱12,000" },
  ];

  const isAllSelected = selectedRows.length === orders.length;

  const handleSelectAll = () => {
    setSelectedRows(isAllSelected ? [] : orders.map((_, index) => index));
  };

  const handleRowCheckbox = (index) => {
    setSelectedRows(
      selectedRows.includes(index)
        ? selectedRows.filter(i => i !== index)
        : [...selectedRows, index]
    );
  };

  const getFinishedGoodsColor = (item) => {
    const qty = item.quantity;
    if (item.item.includes("350ml")) {
      if (qty < 1001) return "text-danger";
      if (qty < 2000) return "text-warning";
    } else if (item.item.includes("500ml")) {
      if (qty < 1501) return "text-danger";
      if (qty < 2500) return "text-warning";
    } else if (item.item.includes("1L")) {
      if (qty < 1001) return "text-danger";
      if (qty < 2000) return "text-warning";
    } else if (item.item.includes("6L")) {
      if (qty < 501) return "text-danger";
      if (qty < 750) return "text-warning";
    }
    return "text-success";
  };

  const getRawMatsColor = (qty) => {
    if (qty < 150000) return "text-danger";
    if (qty < 160000) return "text-warning";
    return "text-success";
  };

  const lowStockCount = inventory.filter(item => {
    const qty = item.quantity;
    if (item.item.includes("350ml")) return qty < 1001;
    if (item.item.includes("500ml")) return qty < 1501;
    if (item.item.includes("1L")) return qty < 1001;
    if (item.item.includes("6L")) return qty < 501;
    return false;
  }).length;

  useEffect(() => {
    const fetchOrderCounts = async () => {
      try {
        const [pendingRes, processingRes, completedRes] = await Promise.all([
          axios.get("http://localhost:8000/api/orders/pending-count"),
          axios.get("http://localhost:8000/api/orders/processing-count"),
          axios.get("http://localhost:8000/api/orders/completed-count"),
        ]);

        setPendingOrders(pendingRes.data.count || 0);
        setProcessingOrders(processingRes.data.count || 0);
        setCompletedOrders(completedRes.data.count || 0);
      } catch (err) {
        console.error("Error fetching counts:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchInventory = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/inventory");
        setInventory(res.data || []);
      } catch (err) {
        console.error("Error loading inventory:", err);
      }
    };

    const fetchRawMats = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/inventory_rawmats");
        setRawMats(res.data || []);
        const lowCount = res.data.filter(item => item.quantity < 150000).length;
        setLowRawMatsCount(lowCount);
      } catch (err) {
        console.error("Error loading raw materials:", err);
      }
    };

    fetchOrderCounts();
    fetchInventory();
    fetchRawMats();
  }, []);

  return (
    <div className={`dashboard-container ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
                <li><NavLink to="/overview/sales" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Sales</NavLink></li>
                <li><NavLink to="/overview/demand" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Demand</NavLink></li>
              </ul>
            )}
          </li>
        </ul>
      </aside>

      <div className="main-content">
        <div className="topbar-card">
          <div className="topbar-comment">
            <h2 className="topbar-title">DASHBOARD</h2>
            <select
              className="nav-link logout-select"
              onChange={(e) => {
                const value = e.target.value;
                if (value === "logout") {
                  localStorage.clear();
                  window.location.href = "/";
                } else if (value === "settings") {
                  window.location.href = "/settings";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>{companyID}</option>
              <option value="settings">Settings</option>
              <option value="logout">Logout</option>
            </select>
          </div>

          <h4>Sales Activity</h4>
          <div className="topbar-grid mb-4">
            <NavLink to="/sales-order" className="topbar-card-box">
              <div className="topbar-card-title">PENDING CUSTOMER ORDERS</div>
              <div className="topbar-card-value">{loading ? "Loading..." : pendingOrders}</div>
            </NavLink>
            <NavLink to="/sales-order" className="topbar-card-box">
              <div className="topbar-card-title">PROCESSING CUSTOMER ORDERS</div>
              <div className="topbar-card-value">{loading ? "Loading..." : processingOrders}</div>
            </NavLink>
            <NavLink to="/sales-order" className="topbar-card-box">
              <div className="topbar-card-title">TO BE DELIVER</div>
              <div className="topbar-card-value">{loading ? "Loading..." : completedOrders}</div>
            </NavLink>
            <NavLink to="/sales-order" className="topbar-card-box">
              <div className="topbar-card-title">FOR BILLING</div>
              <div className="topbar-card-value">10</div>
            </NavLink>
          </div>

          <div className="topbar-grid-2col">
            <NavLink to="/inventory" className="topbar-card-box">
              <div className="topbar-inventory-box">
                <h5 className="topbar-section-title text-center">INVENTORY OVERVIEW</h5>
                <div className="d-flex justify-content-between gap-3">
                  <div style={{ width: "50%" }}>
                    <h6 className="fw-bold mb-2">Finished Goods</h6>
                    <p className="fst-italic mb-2">Low Stock: <span className="highlight-red">{lowStockCount}</span></p>
                    {inventory.map((item, index) => (
                      <p key={`fg-${index}`} className="fw-normal mb-1">
                        {item.item} - {item.unit}:{" "}
                        <span className={`fw-bold ${getFinishedGoodsColor(item)}`}>{item.quantity}</span>
                      </p>
                    ))}
                  </div>
                  <div style={{ width: "50%" }}>
                    <h6 className="fw-bold mb-2">Raw Materials</h6>
                    <p className="fst-italic mb-2">Low Stock: <span className="highlight-red">{lowRawMatsCount}</span></p>
                    {rawMats.map((item, index) => (
                      <p key={`rm-${index}`} className="fw-normal mb-1">
                        {item.item} - {item.unit}:{" "}
                        <span className={`fw-bold ${getRawMatsColor(item.quantity)}`}>{item.quantity}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="topbar-legend mt-3">
                  <div><span className="dot red"></span> Low Stock</div>
                  <div><span className="dot yellow"></span> Warning</div>
                  <div><span className="dot green"></span> Stable</div>
                </div>
              </div>
            </NavLink>

            <NavLink to="/purchase-order" className="topbar-card-box">
              <div className="topbar-inventory-box">
                <h5 className="topbar-section-title text-center">PURCHASE ORDER</h5>
                <table className="table table-bordered table-hover" style={{ width: '100%', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} /></th>
                      <th>Date</th>
                      <th>Purchase Order</th>
                      <th>Delivery Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={index}>
                        <td><input type="checkbox" checked={selectedRows.includes(index)} onChange={() => handleRowCheckbox(index)} /></td>
                        <td>{order.date}</td>
                        <td>{order.type}</td>
                        <td>{order.delivery}</td>
                        <td><strong>{order.status}</strong></td>
                        <td>{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
