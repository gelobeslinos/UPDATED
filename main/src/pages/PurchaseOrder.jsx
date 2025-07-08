import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import logo from './logo.jpg';
import './Styles.css';
import { api, ensureCsrf } from '../axios';

function PurchaseOrder() {
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderItems, setOrderItems] = useState([]);

  const [formData, setFormData] = useState({
    po_number: `PO-${Date.now()}`,
    supplier_name: '',
    order_date: new Date().toISOString().split("T")[0],
    expected_date: '', // to be set below
    status: 'Pending',
    amount: ''
  });

  const [items, setItems] = useState([{ item_name: '', quantity: 0 }]);

  const itemPrices = {
    'McBride': {
      '350ml': 2.10,
      '500ml': 2.25,
      '1L': 4.05,
      '6L': 23,
      'Cap': 0.50,
      '6L Cap': 3,
    },
    'Filpet': {
      '500ml': 2.35,
      'Cap': 0.49
    }
  };

  const availableItems = {
    'McBride': ['350ml', '500ml', '1L', '6L', 'Cap', '6L Cap'],
    'Filpet': ['500ml', 'Cap']
  };

  const getFilteredItems = (supplier) => {
    return availableItems[supplier] || [];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const getExpectedRange = (orderDate) => {
    const [year, month, day] = orderDate.split('-').map(Number);
    const order = new Date(year, month - 1, day);

    const twoWeeksLater = new Date(order);
    twoWeeksLater.setDate(order.getDate() + 14);

    const oneMonthLater = new Date(order);
    oneMonthLater.setMonth(order.getMonth() + 1);

    const format = (d) => {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };

    return `${format(twoWeeksLater)} to ${format(oneMonthLater)}`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const total = items.reduce((acc, item) => {
      const price = itemPrices[formData.supplier_name]?.[item.item_name] || 0;
      return acc + price * (parseFloat(item.quantity) || 0);
    }, 0);
    setFormData(prev => ({ ...prev, amount: total.toFixed(2) }));
  }, [items, formData.supplier_name]);

  useEffect(() => {
    // Set expected_date as 14 days after order_date
    const [year, month, day] = formData.order_date.split('-').map(Number);
    const order = new Date(year, month - 1, day);
    order.setDate(order.getDate() + 14);
    const expected = order.toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, expected_date: expected }));
  }, [formData.order_date]);

  const fetchOrders = async () => {
    try {
      await ensureCsrf();
      const response = await api.get('/api/purchase-orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchOrderItems = async (purchaseOrderId) => {
  try {
    await ensureCsrf();
    const response = await api.get(`/api/purchase-order-items/${purchaseOrderId}`);
    setOrderItems(response.data);
  } catch (error) {
    console.error("Failed to fetch order items:", error);
    setOrderItems([]); // fallback
  }
};

  const handleFormSubmit = async () => {
    try {
      if (!formData.supplier_name || !formData.expected_date) {
        alert("Supplier and Expected Date are required.");
        return;
      }

      const validItems = items.filter(item => item.item_name && item.quantity > 0);
      if (validItems.length === 0) {
        alert("Please add at least one valid item.");
        return;
      }

      await ensureCsrf();

      const response = await api.post('/api/purchase-orders', formData);
      const poId = response.data.id;

      for (let item of validItems) {
        await api.post('/api/purchase-order-items', {
          purchase_order_id: poId,
          item_name: item.item_name,
          item_type: 'raw_material',
          quantity: item.quantity,
          received_quantity: 0
        });
      }

      setIsFormModalOpen(false);
      setFormData({
        po_number: `PO-${Date.now()}`,
        supplier_name: '',
        order_date: new Date().toISOString().split("T")[0],
        expected_date: '',
        status: 'Pending',
        amount: ''
      });
      setItems([{ item_name: '', quantity: 0 }]);
      fetchOrders();
    } catch (err) {
      console.error("Failed to submit purchase order", err);
      if (err.response && err.response.status === 422) {
        const errors = err.response.data.errors;
        const messages = Object.values(errors).flat().join('\n');
        alert("Validation Error:\n" + messages);
      } else {
        alert("Failed to submit purchase order. Please try again.");
      }
    }
  };

  const handleSupplierChange = (e) => {
    const supplier = e.target.value;
    setFormData({ ...formData, supplier_name: supplier, amount: '' });
    setItems([{ item_name: '', quantity: 0 }]);
  };

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? orders.map((_, i) => i) : []);
  };

  const handleRowCheckbox = (index) => {
    setSelectedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...items];
    if (key === 'item_name') {
      const allowed = getFilteredItems(formData.supplier_name);
      if (!allowed.includes(value)) {
        alert(`Choose only ${formData.supplier_name} offered materials.`);
        updatedItems[index][key] = '';
      } else {
        updatedItems[index][key] = value;
      }
    } else {
      updatedItems[index][key] = value;
    }
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { item_name: '', quantity: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const confirmDelete = async () => {
    const toDelete = selectedRows.map(index => orders[index].id);
    try {
      await ensureCsrf();
      await Promise.all(toDelete.map(id =>
        api.delete(`/api/purchase-orders/${id}`)
      ));
      const updatedOrders = orders.filter((_, index) => !selectedRows.includes(index));
      setOrders(updatedOrders);
      setSelectedRows([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete orders:", error);
      alert("Error deleting orders.");
      setShowDeleteConfirm(false);
    }
  };

  const isAllSelected = selectedRows.length === orders.length;

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
          <h2 className="topbar-title">PURCHASE ORDER</h2>
          <div className="topbar-inventory-box">
            <div className="d-flex justify-content-end mb-2">
              <button className="btn btn-primary btn-sm me-2" onClick={() => setIsFormModalOpen(true)}>➕ Send Request</button>
              <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)} disabled={selectedRows.length === 0}>🗑️ Delete Selected</button>
            </div>

            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} /></th>
                  <th>PO Number</th>
                  <th>Order Date</th>
                  <th>Expected Delivery</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
<tr key={index} onClick={() => {
  setSelectedOrder(order);
  fetchOrderItems(order.id);  // fetch items here
  setIsModalOpen(true);
}} style={{ cursor: 'pointer' }}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedRows.includes(index)} onChange={() => handleRowCheckbox(index)} />
                    </td>
                    <td>{order.po_number}</td>
                    <td>{formatDate(order.order_date)}</td>
                    <td>{formatDate(order.expected_date)}</td>
                    <td>{order.supplier_name}</td>
                    <td><strong>{order.status}</strong></td>
                    <td>₱{parseFloat(order.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5>Purchase Order Details</h5>
            <p><strong>PO Number:</strong> {selectedOrder.po_number}</p>
            <p><strong>Order Date:</strong> {selectedOrder.order_date}</p>
            <p><strong>Expected Date:</strong> {selectedOrder.expected_date}</p>
            <p><strong>Supplier:</strong> {selectedOrder.supplier_name}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Amount:</strong> ₱{parseFloat(selectedOrder.amount).toLocaleString()}</p>
            
            <h6>Ordered Items</h6>
<table className="table table-sm table-bordered">
  <thead>
    <tr>
      <th>Item Name</th>
      <th>Quantity</th>
    </tr>
  </thead>
  <tbody>
    {orderItems.length > 0 ? (
      orderItems.map((item, idx) => (
        <tr key={idx}>
          <td>{item.item_name}</td>
          <td>{item.quantity}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="2" className="text-center">No items found.</td>
      </tr>
    )}
  </tbody>
</table>
<div className="text-end">
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h5>Send Purchase Order Request</h5>

            <div className="mb-2">
              <label>PO Number:</label>
              <input className="form-control" type="text" value={formData.po_number} disabled />
            </div>

            <div className="mb-2">
              <label>Supplier:</label>
              <select className="form-control" value={formData.supplier_name} onChange={handleSupplierChange}>
                <option value="">-- Select Supplier --</option>
                <option value="McBride">McBride</option>
                <option value="Filpet">Filpet</option>
              </select>
            </div>

            <div className="mb-2">
              <label>Order Date:</label>
              <div className="form-control bg-light">
                {formatDate(formData.order_date)}
              </div>
            </div>

            <div className="mb-2">
              <label>Expected Delivery Date (Range):</label>
              <div className="form-control bg-light">
                {getExpectedRange(formData.order_date)}
              </div>
            </div>

            <div className="mb-3">
              <label>Total Amount (₱):</label>
              <input className="form-control" type="number" value={formData.amount} readOnly />
            </div>

            <hr />
            <h6>Items</h6>
            {items.map((item, index) => (
              <div key={index} className="d-flex align-items-center mb-2 gap-2">
                <select className="form-control" value={item.item_name} onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}>
                  <option value="">-- Select Item --</option>
                  {getFilteredItems(formData.supplier_name).map((itm, idx) => (
                    <option key={idx} value={itm}>{itm}</option>
                  ))}
                </select>
                <input className="form-control" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>🗑️</button>
              </div>
            ))}

            <div className="mb-3 text-start">
              <button className="btn btn-success btn-sm" onClick={addItem}>➕ Add Item</button>
            </div>

            <div className="text-end">
              <button className="btn btn-secondary btn-sm me-2" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleFormSubmit}>Submit</button>
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

export default PurchaseOrder;
