import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit, Filter, MoreVertical, Shield, User, Truck, Briefcase, Eye, EyeOff, X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Add User Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formTouched, setFormTouched] = useState({});

    // Dummy Data
    const [users, setUsers] = useState([
        { id: 1, name: 'Kasun Perera', email: 'kasun@gmail.com', role: 'customer', status: 'Active', date: '2025-10-12' },
        { id: 2, name: 'Nimali Silva', email: 'nimali@aquarium.com', role: 'staff', status: 'Active', date: '2025-09-01' },
        { id: 3, name: 'Aqua Supplies Ltd', email: 'contact@aquasupplies.com', role: 'supplier', status: 'Active', date: '2025-08-15' },
        { id: 4, name: 'Saman Kumara', email: 'saman@example.com', role: 'customer', status: 'Inactive', date: '2025-11-20' },
        { id: 5, name: 'Chathuri Bandara', email: 'chathuri@aquarium.com', role: 'staff', status: 'Active', date: '2025-07-10' },
    ]);

    // Form Validation
    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
                if (!value.trim()) return 'Full name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'email':
                if (!value.trim()) return 'Email address is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Password must be at least 6 characters';
                return '';
            case 'role':
                if (!value) return 'Please select a user role';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Validate on change if field was already touched
        if (formTouched[name]) {
            setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setFormTouched(prev => ({ ...prev, [name]: true }));
        setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const validateForm = () => {
        const errors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) errors[key] = error;
        });
        setFormErrors(errors);
        setFormTouched({ fullName: true, email: true, password: true, role: true });
        return Object.keys(errors).length === 0;
    };

    const handleAddUser = () => {
        if (!validateForm()) return;

        const newUser = {
            id: users.length + 1 + Date.now(),
            name: formData.fullName,
            email: formData.email,
            role: formData.role,
            status: 'Active',
            date: new Date().toISOString().split('T')[0],
        };
        setUsers(prev => [newUser, ...prev]);
        handleCloseModal();
        alert('✅ User added successfully! (Frontend Only)');
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setFormData({ fullName: '', email: '', password: '', role: '' });
        setFormErrors({});
        setFormTouched({});
        setShowPassword(false);
    };

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
                <button className="btn-add-user" id="btn-add-user" onClick={() => setShowAddModal(true)}>
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

            {/* ===== Add User Modal ===== */}
            {showAddModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
                    <div className="modal-content add-user-modal">
                        {/* Modal Header */}
                        <div className="modal-header">
                            <div className="modal-header-left">
                                <div className="modal-icon-wrapper">
                                    <UserPlus size={22} />
                                </div>
                                <div>
                                    <h3 className="modal-title">Add New User</h3>
                                    <p className="modal-description">Create a new user account for the system.</p>
                                </div>
                            </div>
                            <button className="modal-close-btn" onClick={handleCloseModal} title="Close">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Divider */}
                        <div className="modal-divider"></div>

                        {/* Form Body */}
                        <div className="modal-body">
                            {/* Full Name */}
                            <div className={`form-group ${formErrors.fullName && formTouched.fullName ? 'has-error' : ''}`}>
                                <label htmlFor="fullName">
                                    Full Name <span className="required-star"></span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    placeholder="e.g. Kasun Perera"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    autoFocus
                                />
                                {formErrors.fullName && formTouched.fullName && (
                                    <span className="field-error">
                                        <AlertCircle size={14} />
                                        {formErrors.fullName}
                                    </span>
                                )}
                            </div>

                            {/* Email Address */}
                            <div className={`form-group ${formErrors.email && formTouched.email ? 'has-error' : ''}`}>
                                <label htmlFor="email">
                                    Email Address <span className="required-star"></span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="e.g. kasun@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                />
                                {formErrors.email && formTouched.email && (
                                    <span className="field-error">
                                        <AlertCircle size={14} />
                                        {formErrors.email}
                                    </span>
                                )}
                            </div>

                            {/* Password */}
                            <div className={`form-group ${formErrors.password && formTouched.password ? 'has-error' : ''}`}>
                                <label htmlFor="password">
                                    Password <span className="required-star"></span>
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="Minimum 6 characters"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formErrors.password && formTouched.password && (
                                    <span className="field-error">
                                        <AlertCircle size={14} />
                                        {formErrors.password}
                                    </span>
                                )}
                            </div>

                            {/* User Role */}
                            <div className={`form-group ${formErrors.role && formTouched.role ? 'has-error' : ''}`}>
                                <label htmlFor="role">
                                    User Role <span className="required-star"></span>
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="supplier">Supplier</option>
                                    <option value="customer">Customer</option>
                                </select>
                                {formErrors.role && formTouched.role && (
                                    <span className="field-error">
                                        <AlertCircle size={14} />
                                        {formErrors.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Modal Divider */}
                        <div className="modal-divider"></div>

                        {/* Modal Footer / Actions */}
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleCloseModal}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleAddUser}>
                                <UserPlus size={16} />
                                Add User
                            </button>
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

                /* ===== ADD USER MODAL STYLES ===== */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: overlayFadeIn 0.25s ease;
                }

                @keyframes overlayFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .add-user-modal {
                    background: linear-gradient(180deg, #1e2538 0%, #171d2e 100%);
                    padding: 0;
                    border-radius: 1.25rem;
                    width: 100%;
                    max-width: 500px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
                    animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Modal Header */
                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem 1.75rem;
                }

                .modal-header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .modal-icon-wrapper {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(78, 205, 196, 0.05));
                    border: 1px solid rgba(78, 205, 196, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-primary);
                    flex-shrink: 0;
                }

                .modal-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0 0 0.15rem 0;
                }

                .modal-description {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin: 0;
                }

                .modal-close-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.03);
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .modal-close-btn:hover {
                    background: rgba(255, 107, 107, 0.1);
                    border-color: rgba(255, 107, 107, 0.3);
                    color: #FF6B6B;
                }

                .modal-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
                }

                /* Modal Body */
                .modal-body {
                    padding: 1.5rem 1.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group {
                    margin-bottom: 0;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .required-star {
                    color: #ef4444;
                    margin-left: 2px;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border-radius: 0.625rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.25);
                    color: var(--text-main);
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }

                .form-group input::placeholder {
                    color: rgba(255, 255, 255, 0.25);
                }

                .form-group input:focus,
                .form-group select:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
                    background: rgba(0, 0, 0, 0.35);
                }

                .form-group.has-error input,
                .form-group.has-error select {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }

                .form-group select {
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    padding-right: 2.5rem;
                }

                .form-group select option {
                    background: #1e2538;
                    color: var(--text-main);
                    padding: 0.5rem;
                }

                /* Password Input */
                .password-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .password-input-wrapper input {
                    padding-right: 3rem;
                }

                .password-toggle-btn {
                    position: absolute;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.35rem;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .password-toggle-btn:hover {
                    color: var(--color-primary);
                    background: rgba(78, 205, 196, 0.1);
                }

                /* Field Error */
                .field-error {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    margin-top: 0.45rem;
                    font-size: 0.8rem;
                    color: #ef4444;
                    animation: errorFadeIn 0.25s ease;
                }

                @keyframes errorFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Modal Actions */
                .modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1.25rem 1.75rem;
                    margin-top: 0;
                }

                .btn-cancel, .btn-save {
                    flex: 1;
                    padding: 0.8rem 1rem;
                    border-radius: 0.625rem;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .btn-cancel {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-muted);
                }

                .btn-cancel:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: var(--text-main);
                }

                .btn-save {
                    background: linear-gradient(135deg, var(--color-primary), #38b2ac);
                    color: white;
                    box-shadow: 0 4px 15px rgba(78, 205, 196, 0.25);
                }

                .btn-save:hover {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(78, 205, 196, 0.35);
                }

                .btn-save:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default UserManagement;
