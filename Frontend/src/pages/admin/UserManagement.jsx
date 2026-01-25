import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit, Filter, MoreVertical, Shield, User, Truck, Briefcase } from 'lucide-react';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Dummy Data
    const [users, setUsers] = useState([
        { id: 1, name: 'Kasun Perera', email: 'kasun@gmail.com', role: 'customer', status: 'Active', date: '2025-10-12' },
        { id: 2, name: 'Nimali Silva', email: 'nimali@aquarium.com', role: 'staff', status: 'Active', date: '2025-09-01' },
        { id: 3, name: 'Aqua Supplies Ltd', email: 'contact@aquasupplies.com', role: 'supplier', status: 'Active', date: '2025-08-15' },
        { id: 4, name: 'Saman Kumara', email: 'saman@example.com', role: 'customer', status: 'Inactive', date: '2025-11-20' },
        { id: 5, name: 'Chathuri Bandara', email: 'chathuri@aquarium.com', role: 'staff', status: 'Active', date: '2025-07-10' },
    ]);

    // Handle Delete
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(user => user.id !== id));
        }
    };

    // Handle Filter
    const filteredUsers = users.filter(user => {
        const matchesTab = activeTab === 'all' || user.role === activeTab;
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Helper for Role Badge Color
    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'admin': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: Shield };
            case 'staff': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: Briefcase };
            case 'supplier': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: Truck };
            default: return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: User };
        }
    };

    return (
        <div className="user-management">
            {/* Header Section */}
            <div className="um-header">
                <div>
                    <h2 className="um-title">User Management</h2>
                    <p className="um-subtitle">Manage system users, roles and permissions</p>
                </div>
                <button className="btn-add-user" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    Add New User
                </button>
            </div>

            {/* Controls Section */}
            <div className="um-controls">
                {/* Tabs */}
                <div className="um-tabs">
                    {['all', 'customer', 'staff', 'supplier'].map(tab => (
                        <button
                            key={tab}
                            className={`um-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="um-search">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="um-table-container">
                <table className="um-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined Date</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => {
                                const roleStyle = getRoleBadgeStyle(user.role);
                                const RoleIcon = roleStyle.icon;
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="user-name">{user.name}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="role-badge" style={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}>
                                                <RoleIcon size={12} style={{ marginRight: '4px' }} />
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-dot ${user.status.toLowerCase()}`}></span>
                                            {user.status}
                                        </td>
                                        <td>{new Date(user.date).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="action-btn edit" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                title="Delete"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-state">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal (Simulated) */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New User</h3>
                        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>Enter user details below.</p>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="john@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select>
                                <option value="customer">Customer</option>
                                <option value="staff">Staff</option>
                                <option value="supplier">Supplier</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={() => {
                                alert('User added successfully! (Frontend Only)');
                                setShowAddModal(false);
                            }}>Add User</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .um-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                
                .um-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 0.25rem;
                }
                
                .um-subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }

                .btn-add-user {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--color-primary);
                    color: #fff;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-add-user:hover {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }

                .um-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .um-tabs {
                    display: flex;
                    gap: 0.5rem;
                    background: rgba(255,255,255,0.03);
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .um-tab {
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .um-tab.active {
                    background: var(--color-primary);
                    color: #fff;
                }

                .um-search {
                    position: relative;
                    min-width: 250px;
                }

                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .um-search input {
                    width: 100%;
                    padding: 0.6rem 1rem 0.6rem 2.5rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem;
                    color: var(--text-main);
                    outline: none;
                }

                .um-search input:focus {
                    border-color: var(--color-primary);
                }

                .um-table-container {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1rem;
                    overflow: hidden;
                }

                .um-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .um-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                }

                .um-table td {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: var(--text-main);
                }

                .um-table tr:last-child td {
                    border-bottom: none;
                }

                .user-cell {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                }

                .user-name {
                    font-weight: 500;
                    color: var(--text-main);
                }

                .user-email {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .status-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 0.5rem;
                }

                .status-dot.active { background-color: #10b981; }
                .status-dot.inactive { background-color: #ef4444; }

                .action-btn {
                    padding: 0.4rem;
                    border-radius: 0.4rem;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-left: 0.5rem;
                }

                .action-btn.edit { color: #60a5fa; }
                .action-btn.edit:hover { background: rgba(96, 165, 250, 0.1); }
                
                .action-btn.delete { color: #ef4444; }
                .action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-muted);
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: #1a1f2e;
                    padding: 2rem;
                    border-radius: 1rem;
                    width: 100%;
                    max-width: 450px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .form-group input, .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(0,0,0,0.2);
                    color: var(--text-main);
                    outline: none;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .btn-cancel, .btn-save {
                    flex: 1;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                }

                .btn-cancel {
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-muted);
                }

                .btn-save {
                    background: var(--color-primary);
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default UserManagement;
