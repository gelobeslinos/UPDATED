import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import logo from './logo.jpg';
import './Styles.css';
import { FaMinusCircle, FaPlusCircle, FaEdit } from 'react-icons/fa';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
    maxHeight: "90vh",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  }
};

function Inventory() {
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalQuantity, setModalQuantity] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [inventoryType, setInventoryType] = useState("normal");

  const getQuantityColor = (qty, itemName) => {
    if (inventoryType === "raw") {
      if (qty < 150001) return "text-danger";
      if (qty < 160001) return "text-warning";
      return "text-success";
    }

    const thresholds = {
      "350ml": { red: 1001, yellow: 2000 },
      "500ml": { red: 1501, yellow: 2500 },
      "1L": { red: 1001, yellow: 2000 },
      "6L": { red: 501, yellow: 750 },
    };

    const size = itemName.trim();
    const threshold = thresholds[size];

    if (!threshold) return "text-success";
    if (qty < threshold.red) return "text-danger";
    if (qty < threshold.yellow) return "text-warning";
    return "text-success";
  };

  const filteredItems = inventoryData.filter(i =>
    i.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const openModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setModalQuantity("");
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
    setSelectedItem(null);
    setModalQuantity("");
  };

  const handleConfirm = () => {
    if (!modalQuantity || isNaN(modalQuantity)) {
      alert("Please enter a valid numeric quantity.");
      return;
    }

    let currentQty = Number(selectedItem.quantity);
    let quantityToUpdate = Number(modalQuantity);
    let newQuantity;

    if (modalType === "add") {
      newQuantity = currentQty + quantityToUpdate;
    } else if (modalType === "deduct") {
      newQuantity = currentQty - quantityToUpdate;
    } else if (modalType === "edit") {
      newQuantity = quantityToUpdate;
    } else {
      alert("Invalid modal type.");
      return;
    }

    const endpoint = inventoryType === "raw"
      ? `http://localhost:8000/api/inventory_rawmats/${selectedItem.id}`
      : `http://localhost:8000/api/inventory/${selectedItem.id}`;

    console.log(`Sending PUT to ${endpoint} with quantity: ${newQuantity}`);

    axios.put(endpoint, { quantity: newQuantity })
      .then(() => {
        setInventoryData(prev =>
          prev.map(item =>
            item.id === selectedItem.id ? { ...item, quantity: newQuantity } : item
          )
        );
        closeModal();
      })
      .catch(err => {
        console.error("Update failed", err);
        alert("Failed to update inventory. Please check the server and try again.");
      });
  };

  useEffect(() => {
    const endpoint = inventoryType === "raw"
      ? "http://localhost:8000/api/inventory_rawmats"
      : "http://localhost:8000/api/inventory";

    axios.get(endpoint)
      .then(res => setInventoryData(res.data))
      .catch(err => console.error("Error fetching inventory:", err));
  }, [inventoryType]);

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
              Overview {overviewOpen ? "▲" : "▼"}
            </div>
            {overviewOpen && (
              <ul className="list-unstyled ps-3">
                <li><NavLink to="/overview/sales" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Sales</NavLink></li>
                <li><NavLink to="/overview/demand" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>Demand</NavLink></li>
              </ul>
            )}
          </li>
          <li>
            <div onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="nav-link logout-button" style={{ cursor: "pointer" }}>
              Logout
            </div>
          </li>
        </ul>
      </aside>

      <div className="main-content">
        <div className="topbar-card">
          <h2 className="topbar-title">INVENTORY</h2>

          <select
            className="form-select mb-3"
            style={{ width: "200px" }}
            value={inventoryType}
            onChange={(e) => setInventoryType(e.target.value)}
          >
            <option value="normal">Finished Goods</option>
            <option value="raw">Raw Materials</option>
          </select>

          <div className="topbar-inventory-box">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Items</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Deduct</th>
                  <th>Add</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.item}</td>
                    <td>{item.unit}</td>
                    <td className={getQuantityColor(item.quantity, item.item)}>{item.quantity}</td>
                    <td><FaMinusCircle style={{ cursor: 'pointer' }} onClick={() => openModal("deduct", item)} /></td>
                    <td><FaPlusCircle style={{ cursor: 'pointer' }} onClick={() => openModal("add", item)} /></td>
                    <td><FaEdit style={{ cursor: 'pointer' }} onClick={() => openModal("edit", item)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-between mt-2">
              <button className="btn btn-sm btn-light" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&larr; Previous</button>
              <button className="btn btn-sm btn-light" disabled={indexOfLastItem >= filteredItems.length} onClick={() => setCurrentPage(currentPage + 1)}>Next &rarr;</button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Inventory Modal"
        style={modalStyles}
      >
        <h4 className="mb-3">{modalType?.toUpperCase()} ITEM</h4>
        {selectedItem && (
          <>
            <p>Item: <strong>{selectedItem.item}</strong> ({selectedItem.unit})</p>
            <input
              type="number"
              placeholder="Enter quantity..."
              className="form-control my-2"
              value={modalQuantity}
              onChange={(e) => setModalQuantity(e.target.value)}
            />
            <div className="d-flex justify-content-end">
              <button onClick={closeModal} className="btn btn-secondary me-2">Cancel</button>
              <button onClick={handleConfirm} className="btn btn-primary">Confirm</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Inventory;
