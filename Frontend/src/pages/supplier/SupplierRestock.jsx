import React, { useState } from 'react';
import { Package, Search, AlertCircle, Plus } from 'lucide-react';

const SupplierRestock = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy data for restock requests or low stock items
    const restockItems = [
        { id: 1, name: 'Goldfish Food Flakes', category: 'Food', currentStock: 5, status: 'Low Stock' },
        { id: 2, name: 'Neon Tetra', category: 'Live Fish', currentStock: 12, status: 'Low Stock' },
        { id: 3, name: 'Anti-Chlorine', category: 'Medicine', currentStock: 8, status: 'Low Stock' },
    ];

    return (
        <div className="restock-container">
            <div className="restock-header">
                <div>
                    <h2>Restock Management</h2>
                    <p>Manage inventory levels and restock requests</p>
                </div>
                <button className="add-stock-btn">
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
                                    <span className="status-badge low">
                                        <AlertCircle size={14} /> {item.status}
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
                    flex: 1; overflow-y: auto; background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;
                }
                .restock-table { width: 100%; border-collapse: collapse; }
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

                .restock-action-btn {
                    background: transparent; border: 1px solid var(--color-primary);
                    color: var(--color-primary); padding: 0.5rem 1rem; border-radius: 6px;
                    cursor: pointer; transition: all 0.2s; font-size: 0.85rem;
                }
                .restock-action-btn:hover {
                    background: var(--color-primary); color: white;
                }
            `}</style>
        </div>
    );
};

export default SupplierRestock;
