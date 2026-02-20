import React, { useState } from 'react';
import { Clock, Check, X, AlertCircle, FileText, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const SupplierOrderRequests = () => {
    // Dummy Pending Requests
    const initialRequests = [
        { id: 'REQ-001', date: '2025-10-25', shop: 'Methu Aquarium', items: 'Neon Tetra (x500), Guppy (x200)', urgency: 'High', status: 'Pending' },
        { id: 'REQ-002', date: '2025-10-26', shop: 'Methu Aquarium', items: 'Glass Tanks 30L (x10)', urgency: 'Normal', status: 'Pending' },
        { id: 'REQ-003', date: '2025-10-26', shop: 'Methu Aquarium', items: 'Fish Food Flakes Bulk (x20)', urgency: 'Normal', status: 'Pending' },
        { id: 'REQ-004', date: '2025-10-27', shop: 'Methu Aquarium', items: 'Canister Filters (x5)', urgency: 'High', status: 'Pending' },
    ];

    const [requests, setRequests] = useState(initialRequests);

    const handleAction = (id, action) => {
        if (action === 'accept') {
            setRequests(requests.filter(r => r.id !== id));
            Swal.fire({
                icon: 'success',
                title: 'Request Accepted!',
                text: `Request ${id} has been moved to processing.`,
                background: '#1a1f2e',
                color: '#fff',
                confirmButtonColor: '#4ecdc4',
            });
        } else {
            Swal.fire({
                title: 'Decline Request?',
                text: 'Are you sure you want to decline this request?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, decline',
                cancelButtonText: 'Cancel',
                background: '#1a1f2e',
                color: '#fff',
            }).then((result) => {
                if (result.isConfirmed) {
                    setRequests(requests.filter(r => r.id !== id));
                    Swal.fire({
                        icon: 'success',
                        title: 'Declined!',
                        text: 'The request has been declined.',
                        background: '#1a1f2e',
                        color: '#fff',
                        confirmButtonColor: '#4ecdc4',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                }
            });
        }
    };

    return (
        <div className="supplier-requests-container">
            <div className="req-header">
                <h2>New Order Requests</h2>
                <p>Manage incoming stock requests from the shop</p>
            </div>

            <div className="requests-list">
                {requests.length === 0 ? (
                    <div className="empty-state">
                        <Check size={48} />
                        <p>No new pending requests!</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="request-card">
                            <div className="req-info">
                                <div className="req-top">
                                    <span className="req-id">{req.id}</span>
                                    <div className="req-date">
                                        <Calendar size={14} /> {req.date}
                                    </div>
                                    {req.urgency === 'High' && <span className="badge-urgent">High Priority</span>}
                                </div>
                                <h3 className="req-shop">{req.shop}</h3>
                                <div className="req-items">
                                    <FileText size={16} />
                                    <p>{req.items}</p>
                                </div>
                            </div>

                            <div className="req-actions">
                                <button className="btn-decline" onClick={() => handleAction(req.id, 'decline')}>
                                    <X size={18} /> Decline
                                </button>
                                <button className="btn-accept" onClick={() => handleAction(req.id, 'accept')}>
                                    <Check size={18} /> Accept Request
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .supplier-requests-container {
                    padding-bottom: 2rem;
                    height: 100%;
                    overflow-y: auto;
                }
                
                .req-header { margin-bottom: 2rem; }
                .req-header h2 { font-size: 2rem; font-weight: 700; color: #fff; margin: 0 0 0.5rem 0; }
                .req-header p { color: rgba(255,255,255,0.6); margin: 0; }

                .requests-list {
                    display: flex; flex-direction: column; gap: 1rem;
                }

                .request-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.2s;
                }
                .request-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .req-info { flex: 1; }
                
                .req-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
                .req-id { font-family: monospace; color: var(--color-primary); font-weight: 600; background: rgba(78, 205, 196, 0.1); padding: 2px 6px; border-radius: 4px; }
                .req-date { display: flex; align-items: center; gap: 0.25rem; font-size: 0.85rem; color: rgba(255,255,255,0.5); }
                .badge-urgent { background: rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; }

                .req-shop { margin: 0 0 0.75rem 0; color: #fff; font-size: 1.1rem; }
                
                .req-items { display: flex; align-items: flex-start; gap: 0.5rem; color: rgba(255,255,255,0.8); }
                .req-items p { margin: 0; line-height: 1.4; }

                .req-actions {
                    display: flex; gap: 1rem; margin-left: 2rem;
                }
                
                .btn-accept, .btn-decline {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                
                .btn-accept {
                    background: var(--color-primary); color: #fff;
                }
                .btn-accept:hover { background: #3aa8a0; }
                
                .btn-decline {
                    background: transparent; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);
                }
                .btn-decline:hover { background: rgba(239, 68, 68, 0.1); }

                .empty-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 4rem; color: rgba(255,255,255,0.4); gap: 1rem;
                    border: 2px dashed rgba(255,255,255,0.1); border-radius: 1rem;
                }

                @media (max-width: 768px) {
                    .request-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                    .req-actions { margin-left: 0; width: 100%; justify-content: flex-end; }
                }
            `}</style>
        </div>
    );
};

export default SupplierOrderRequests;
