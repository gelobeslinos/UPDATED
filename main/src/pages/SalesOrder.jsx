import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from 'react-router-dom';
import logo from './logo.jpg';
import { FaTrashAlt } from 'react-icons/fa';
import './Styles.css';

function SalesOrder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [newOrder, setNewOrder] = useState({
    products: [],
    quantities: { '350ml': 0, '500ml': 0, '1L': 0, '6L': 0 },
    location: '',
    customer_name: '',
    delivery_date: '',
    status: 'Pending'
  });

  useEffect(() => {
    axios.get("http://localhost:8000/api/sales-orders")
      .then(res => setOrders(res.data))
      .catch(() => showMessage("Failed to fetch orders."));
  }, []);

  const showMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? orders.map((_, i) => i) : []);
  };

  const handleRowCheckbox = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const confirmDelete = () => {
    const idsToDelete = selectedRows.map(index => orders[index].id);
    axios.delete("http://localhost:8000/api/sales-orders", {
      data: { ids: idsToDelete },
    }).then(() => {
      const remainingOrders = orders.filter((_, i) => !selectedRows.includes(i));
      setOrders(remainingOrders);
      setSelectedRows([]);
      setShowDeleteConfirm(false);
      showMessage("Selected order(s) deleted successfully!");
    }).catch(() => {
      setShowDeleteConfirm(false);
      showMessage("Failed to delete order(s).");
    });
  };

  const handleDelete = () => {
    if (!selectedRows.length) return;
    setShowDeleteConfirm(true);
  };

  const isAllSelected = selectedRows.length === orders.length;

  const openModal = (index) => {
    setSelectedOrderIndex(index);
    setTempStatus(orders[index].status);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    const selectedOrder = orders[selectedOrderIndex];
    axios.put(`http://localhost:8000/api/sales-orders/${selectedOrder.id}`, {
      status: tempStatus,
    }).then(() => {
      const updatedOrders = [...orders];
      updatedOrders[selectedOrderIndex].status = tempStatus;
      setOrders(updatedOrders);
      setIsModalOpen(false);
      showMessage("Status updated successfully!");
    }).catch(() => {
      setIsModalOpen(false);
      showMessage("Failed to update order status.");
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const formatOrderNumber = (order) => {
    const datePart = order.date.replace(/-/g, '');
    const idPart = String(order.id).padStart(4, '0');
    return `SO-${datePart}-${idPart}`;
  };

  const calculateAmount = () => {
    const qty350 = parseInt(newOrder.quantities['350ml']) || 0;
    const qty500 = parseInt(newOrder.quantities['500ml']) || 0;
    const qty1l  = parseInt(newOrder.quantities['1L'])    || 0;
    const qty6l  = parseInt(newOrder.quantities['6L'])    || 0;
    const total = (qty350 * 130) + (qty500 * 155) + (qty1l * 130) + (qty6l * 60);
    return total.toFixed(2);
};

  const handleAddOrder = () => {
    const productsList = ['350ml', '500ml', '1L', '6L'].filter(size => newOrder.quantities[size] > 0);
    const payload = {
      customer_name: newOrder.customer_name,
      location: newOrder.location,
      delivery_date: newOrder.delivery_date,
      status: newOrder.status,
      quantities: newOrder.quantities,
      amount: calculateAmount(),
      date: new Date().toISOString().slice(0, 10),
      products: productsList.join(', '),
      qty_350ml: newOrder.quantities['350ml'],
      qty_500ml: newOrder.quantities['500ml'],
      qty_1L: newOrder.quantities['1L'],
      qty_6L: newOrder.quantities['6L']
    };

    axios.post("http://localhost:8000/api/sales-orders", payload)
      .then(res => {
        setOrders([...orders, res.data]);
        setIsAddModalOpen(false);
        setNewOrder({
          products: [],
          quantities: { '350ml': '', '500ml': '', '1L': '', '6L': ''},
          location: '',
          customer_name: '',
          delivery_date: '',
          status: 'Pending'
        });
        showMessage("Sales order successfully added!");
      })
      .catch(err => {
        if (err.response?.data?.errors) {
          const errorList = Object.values(err.response.data.errors).flat().join(' ');
          showMessage("Failed to add order: " + errorList);
        } else {
          showMessage("An unexpected error occurred.");
        }
      });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed": return "text-success";
      case "Processing": return "text-warning";
      case "Pending": return "text-danger";
      default: return "";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatOrderNumber(order).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <h2 className="topbar-title">SALES ORDER</h2>
          
<div className="d-flex gap-2 mb-3 align-items-center flex-wrap">
  <input
    type="text"
    placeholder="Search..."
    className="form-control form-control-sm"
    style={{ maxWidth: '300px' }}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
<select
  className="form-select form-select-sm"
  style={{ width: 'auto', cursor: 'pointer' }}
  value={filterStatus}
  onChange={(e) => setFilterStatus(e.target.value)}
>
  <option value="All" disabled hidden>
    Select Status
  </option>
  <option value="All">All</option>
  <option value="Pending">Pending</option>
  <option value="Processing">Processing</option>
  <option value="Completed">Completed</option>
</select>
</div>
            <div className="buttons d-flex mb-2">
              <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>+ Add Order</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={selectedRows.length === 0}><FaTrashAlt /> Delete</button>
              {successMessage && (
  <div className="alert alert-info py-1 px-2 mb-2" role="alert">
    {successMessage}
  </div>
)}
            </div>
          <div className="topbar-inventory-box">
            <table className="table table-bordered table-hover" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} /></th>
                  <th>Order #</th>
                  <th>Customer Name</th>
                  <th>Date Ordered</th>
                  <th>Delivery Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const index = orders.findIndex(o => o.id === order.id);
                  return (
                    <tr key={order.id} onClick={() => openModal(index)} style={{ cursor: 'pointer' }}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(index)}
                          onChange={() => handleRowCheckbox(index)}
                        />
                      </td>
                      <td>{formatOrderNumber(order)}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.date}</td>
                      <td>{order.delivery_date}</td>
                      <td><strong className={getStatusClass(order.status)}>{order.status}</strong></td>
                      <td>{order.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5>Add New Order</h5>
            <div className="mb-2">
              <label>Customer Name:</label>
              <input className="form-control" value={newOrder.customer_name} onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })} />
            </div>
            <div className="mb-2">
              <label>Location:</label>
              <input className="form-control" value={newOrder.location} onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })} />
            </div>
            <div className="mb-2">
              <label>Products:</label>
              {['350ml', '500ml', '1L', '6L'].map(size => (
                <div key={size} className="d-flex align-items-center mb-1">
                  <span className="me-2" style={{ width: '50px' }}>{size}</span>
                  <input type="number" min="0" value={newOrder.quantities[size]} onChange={(e) => setNewOrder({...newOrder, quantities: {...newOrder.quantities, [size]: e.target.value}})}className="form-control form-control-sm"style={{ width: '80px' }}/>
                  <span className="ms-2">× ₱{size === '350ml' ? 130 : size === '500ml' ? 155 : size === '1L' ? 130 : 60}</span>
                </div>
              ))}
            </div>
            <div className="mb-2">
              <label>Delivery Date:</label>
              <input type="date" className="form-control" value={newOrder.delivery_date} onChange={(e) => setNewOrder({ ...newOrder, delivery_date: e.target.value })} />
            </div>
            <div className="mb-2">
              <label>Amount:</label>
              <input className="form-control" value={calculateAmount()} readOnly />
            </div>
            <div className="mb-3">
              <label>Status:</label>
              <select className="form-select" value={newOrder.status} onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="text-end">
              <button className="btn btn-primary btn-sm me-2" onClick={handleAddOrder}>Submit</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedOrderIndex !== null && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5>Order Details</h5>
            <p><strong>Order #:</strong> {formatOrderNumber(orders[selectedOrderIndex])}</p>
            <p><strong>Customer Name:</strong> {orders[selectedOrderIndex].customer_name}</p>
            <p><strong>Location:</strong> {orders[selectedOrderIndex].location}</p>
            <p><strong>Product/s:</strong> {orders[selectedOrderIndex].products}</p>
            <p><strong>Quantities:</strong></p>
              <ul>
                <li>350ml: {orders[selectedOrderIndex]?.quantities?.['350ml'] || 0}</li>
                <li>500ml: {orders[selectedOrderIndex]?.quantities?.['500ml'] || 0}</li>
                <li>1L: {orders[selectedOrderIndex]?.quantities?.['1L'] || 0}</li>
                <li>6L: {orders[selectedOrderIndex]?.quantities?.['6L'] || 0}</li>
              </ul>
            <p><strong>Date Ordered:</strong> {orders[selectedOrderIndex].date}</p>
            <p><strong>Delivery Date:</strong> {orders[selectedOrderIndex].delivery_date}</p>
            <p><strong>Amount:</strong> {orders[selectedOrderIndex].amount}</p>
            <div className="mb-3">
              <label><strong>Status:</strong></label>
              <select className="form-select mt-1" value={tempStatus} onChange={(e) => setTempStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="text-end">
              <button className="btn btn-primary btn-sm me-2" onClick={handleOk}>OK</button>
              <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
  <div className="custom-modal-backdrop">
    <div className="custom-modal">
      <h5>Confirm Delete</h5>
      <p>Are you sure you want to delete the selected order(s)?</p>
      <div className="text-end">
        <button className="btn btn-danger btn-sm me-2" onClick={confirmDelete}>Yes</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)}>No</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default SalesOrder;