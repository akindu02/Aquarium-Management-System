import React, { useState } from 'react';
import { Package, Search, AlertCircle, Plus, X } from 'lucide-react';

const SupplierRestock = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStock, setNewStock] = useState({
        name: '',
        category: 'Food',
        quantity: '',
        threshold: ''
    });

    // Dummy data for restock requests or low stock items
    const [restockItems, setRestockItems] = useState([
        { id: 1, name: 'Goldfish Food Flakes', category: 'Food', currentStock: 5, status: 'Low Stock' },
        { id: 2, name: 'Neon Tetra', category: 'Live Fish', currentStock: 12, status: 'Low Stock' },
        { id: 3, name: 'Anti-Chlorine', category: 'Medicine', currentStock: 8, status: 'Low Stock' },
    ]);

    const handleAddStock = () => {
        if (newStock.name && newStock.quantity) {
            const newItem = {
                id: restockItems.length + 1,
                name: newStock.name,
                category: newStock.category,
                currentStock: parseInt(newStock.quantity),
                status: 'In Stock'
            };
            setRestockItems([...restockItems, newItem]);
            setShowAddModal(false);
            setNewStock({ name: '', category: 'Food', quantity: '', threshold: '' });
        }
    };

    return (
        <div className="restock-container">
            <div className="restock-header">
                <div>
                    <h2>Restock Management</h2>
                    <p>Manage inventory levels and restock requests</p>
                </div>
                <button className="add-stock-btn" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} /> Add Stock
                </button>
            </div>

            <div className="restock-toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="restock-list">
                <table className="restock-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restockItems.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td className="stock-cell">{item.currentStock}</td>
                                <td>
                                    <span className={`status-badge ${item.status === 'Low Stock' ? 'low' : 'good'}`}>
                                        {item.status === 'Low Stock' ? <AlertCircle size={14} /> : <Package size={14} />} {item.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="restock-action-btn">Restock Now</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Stock Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Stock</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter item name"
                                    value={newStock.name}
                                    onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newStock.category}
                                    onChange={(e) => setNewStock({ ...newStock, category: e.target.value })}
                                >
                                    <option>Food</option>
                                    <option>Live Fish</option>
                                    <option>Tanks</option>
                                    <option>Equipment</option>
                                    <option>Medicine</option>
                                    <option>Decor</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newStock.quantity}
                                        onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Low Stock Alert</label>
                                    <input
                                        type="number"
                                        placeholder="Threshold"
                                        value={newStock.threshold}
                                        onChange={(e) => setNewStock({ ...newStock, threshold: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="save-btn" onClick={handleAddStock}>Add to Inventory</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .restock-container {
                    display: flex; flex-direction: column; height: 100%;
                }
                .restock-header {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    margin-bottom: 2rem;
                }
                .restock-header h2 { font-size: 2rem; font-weight: 700; color: white; margin: 0 0 0.5rem 0; }
                .restock-header p { color: rgba(255,255,255,0.6); margin: 0; }
                
                .add-stock-btn {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: var(--color-primary); color: white; border: none;
                    padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                }
                .add-stock-btn:hover { background: #3aa8a0; }

                .restock-toolbar { margin-bottom: 1.5rem; }
                .search-box {
                    display: flex; align-items: center; gap: 0.75rem;
                    background: rgba(0,0,0,0.2); padding: 0.75rem 1rem;
                    border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
                    width: 350px;
                }
                .search-box input {
                    background: transparent; border: none; outline: none;
                    color: white; width: 100%; font-size: 0.95rem;
                }

                .restock-list {
                    flex: 1; overflow-x: auto; overflow-y: auto; background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;
                    width: 100%;
                }
                .restock-table { width: 100%; border-collapse: collapse; min-width: 600px; }
                .restock-table th {
                    text-align: left; padding: 1rem 1.5rem; background: rgba(0,0,0,0.2);
                    color: rgba(255,255,255,0.5); font-size: 0.85rem; text-transform: uppercase;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .restock-table td {
                    padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.9); vertical-align: middle;
                }
                
                .stock-cell { font-family: monospace; font-size: 1.1rem; }
                
                .status-badge.low {
                    display: inline-flex; align-items: center; gap: 0.25rem;
                    color: #f59e0b; background: rgba(245, 158, 11, 0.15);
                    padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;
                }
                .status-badge.good {
                    display: inline-flex; align-items: center; gap: 0.25rem;
                    color: #10b981; background: rgba(16, 185, 129, 0.15);
                    padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;
                }

                .restock-action-btn {
                    background: transparent; border: 1px solid var(--color-primary);
                    color: var(--color-primary); padding: 0.5rem 1rem; border-radius: 6px;
                    cursor: pointer; transition: all 0.2s; font-size: 0.85rem;
                }
                .restock-action-btn:hover {
                    background: var(--color-primary); color: white;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    background: #1a1f2e; width: 450px; border-radius: 1rem;
                    border: 1px solid rgba(255,255,255,0.1); overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .modal-header {
                    padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .close-btn {
                    background: transparent; border: none; color: rgba(255,255,255,0.5);
                    cursor: pointer; padding: 0.25rem;
                }
                .close-btn:hover { color: white; }
                
                .modal-body { padding: 1.5rem; }
                
                .form-group { margin-bottom: 1.25rem; }
                .form-group label {
                    display: block; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; font-size: 0.9rem;
                }
                .form-group input, .form-group select {
                    width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.75rem; border-radius: 0.5rem; color: white; outline: none;
                }
                .form-group input:focus, .form-group select:focus { border-color: var(--color-primary); }
                .form-group select option { background: #1a1f2e; }

                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

                .modal-actions {
                    display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;
                }
                .cancel-btn {
                    background: transparent; border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.7); padding: 0.75rem 1.5rem; border-radius: 0.5rem;
                    cursor: pointer; font-weight: 600;
                }
                .save-btn {
                    background: var(--color-primary); border: none;
                    color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem;
                    cursor: pointer; font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default SupplierRestock;
