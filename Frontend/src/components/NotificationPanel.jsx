import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, CheckCircle2, AlertTriangle, CalendarClock, Package, Clock, X, Info } from 'lucide-react';
import { 
    getNotificationsAPI, 
    markNotificationReadAPI, 
    markAllNotificationsReadAPI, 
    deleteNotificationAPI,
    clearAllNotificationsAPI 
} from '../utils/api';
import '../index.css';

const NotificationPanel = ({ unreadCount, setUnreadCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getNotificationsAPI();
            if (response.success) {
                setNotifications(response.data);
                setUnreadCount(response.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            fetchNotifications(); // Refresh when opened
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Initial load of unread count
    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const res = await markNotificationReadAPI(id);
            if (res.success) {
                setNotifications(prev => 
                    prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await markAllNotificationsReadAPI();
            if (res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteNotificationAPI(id);
            if (res.success) {
                setNotifications(prev => prev.filter(n => n.notification_id !== id));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            const res = await clearAllNotificationsAPI();
            if (res.success) {
                setNotifications([]);
                setUnreadCount(0);
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Order': return <Package size={16} />;
            case 'Booking': return <CalendarClock size={16} />;
            case 'Alert': return <AlertTriangle size={16} />;
            case 'System': return <Info size={16} />;
            default: return <Bell size={16} />;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'Order': return 'rgba(59, 130, 246, 0.2)'; // Blue
            case 'Booking': return 'rgba(139, 92, 246, 0.2)'; // Purple
            case 'Alert': return 'rgba(239, 68, 68, 0.2)'; // Red
            default: return 'rgba(78, 205, 196, 0.2)'; // Teal
        }
    };

    const getIconTextColor = (type) => {
        switch (type) {
            case 'Order': return '#3b82f6';
            case 'Booking': return '#8b5cf6';
            case 'Alert': return '#ef4444';
            default: return 'var(--color-primary)';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-wrapper" ref={panelRef}>
            <button 
                className={`notification-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                <Bell size={18} className="notification-icon" />
                {unreadCount > 0 && (
                    <span className="notification-badge heartbeat">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <div>
                            <h3>Notifications</h3>
                            <span className="notification-count">{unreadCount} unread</span>
                        </div>
                        <div className="notification-actions">
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead} className="action-btn text-primary">
                                    <CheckCircle2 size={16} /> Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={handleClearAll} className="action-btn text-danger">
                                    <Trash2 size={16} /> Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="notification-body">
                        {loading && notifications.length === 0 ? (
                            <div className="notification-empty">
                                <span className="spin-icon"><Clock size={24} /></span>
                                <p>Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={32} />
                                <p>You're all caught up!</p>
                                <span>No new notifications at the moment.</span>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.notification_id} 
                                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                >
                                    <div 
                                        className="notification-item-icon"
                                        style={{ 
                                            backgroundColor: getIconColor(notification.type),
                                            color: getIconTextColor(notification.type)
                                        }}
                                    >
                                        {getIcon(notification.type)}
                                    </div>
                                    
                                    <div className="notification-content">
                                        <div className="notification-text">
                                            {notification.message}
                                        </div>
                                        <div className="notification-meta">
                                            <span className="notification-time">
                                                {formatTime(notification.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="notification-item-actions">
                                        {!notification.is_read && (
                                            <button 
                                                className="btn-icon read-btn" 
                                                onClick={() => handleMarkAsRead(notification.notification_id)}
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button 
                                            className="btn-icon delete-btn" 
                                            onClick={() => handleDelete(notification.notification_id)}
                                            title="Delete notification"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .notification-wrapper {
                    position: relative;
                }

                .notification-btn {
                    position: relative;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 8px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .notification-btn:hover, .notification-btn.has-unread {
                    color: var(--text-main);
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .notification-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                    box-shadow: 0 0 0 2px var(--color-bg);
                }

                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    14% { transform: scale(1.15); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.15); }
                    70% { transform: scale(1); }
                }

                .heartbeat {
                    animation: heartbeat 2s infinite;
                }

                /* Dropdown Panel */
                .notification-dropdown {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: -60px; /* Adjust based on navbar layout */
                    width: 380px;
                    background: rgba(17, 25, 40, 0.95);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
                    z-index: 1000;
                    overflow: hidden;
                    animation: slideDownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transform-origin: top right;
                }

                @keyframes slideDownFade {
                    from { opacity: 0; transform: translateY(-8px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .notification-header {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.02);
                }

                .notification-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .notification-count {
                    font-size: 0.75rem;
                    color: var(--color-primary);
                    font-weight: 500;
                }

                .notification-actions {
                    display: flex;
                    gap: 0.75rem;
                }

                .action-btn {
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .action-btn.text-primary { color: var(--color-primary); }
                .action-btn.text-primary:hover { background: rgba(78, 205, 196, 0.1); }
                
                .action-btn.text-danger { color: #ef4444; }
                .action-btn.text-danger:hover { background: rgba(239, 68, 68, 0.1); }

                /* Body list */
                .notification-body {
                    max-height: 420px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .notification-body::-webkit-scrollbar {
                    width: 6px;
                }
                .notification-body::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }

                .notification-empty {
                    padding: 3rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.3);
                }

                .notification-empty svg {
                    opacity: 0.5;
                    margin-bottom: 1rem;
                }

                .notification-empty p {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0 0 0.25rem 0;
                    color: var(--text-muted);
                }

                .notification-empty span {
                    font-size: 0.8rem;
                }

                .spin-icon svg {
                    animation: spin 1.5s linear infinite;
                }

                /* Individual Item */
                .notification-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    transition: background 0.2s;
                    position: relative;
                }

                .notification-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .notification-item.unread {
                    background: rgba(78, 205, 196, 0.04);
                }

                .notification-item.unread::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: var(--color-primary);
                }

                .notification-item-icon {
                    flex-shrink: 0;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-text {
                    font-size: 0.85rem;
                    line-height: 1.4;
                    color: var(--text-main);
                    margin-bottom: 0.4rem;
                    word-wrap: break-word;
                }
                
                .notification-item:not(.unread) .notification-text {
                    color: var(--text-muted);
                }

                .notification-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .notification-time {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .notification-item-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .notification-item:hover .notification-item-actions {
                    opacity: 1;
                }

                .btn-icon {
                    background: none;
                    border: none;
                    padding: 4px;
                    border-radius: 6px;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    background: rgba(255, 255, 255, 0.05);
                }

                .btn-icon:hover {
                    color: var(--text-main);
                    background: rgba(255, 255, 255, 0.1);
                }

                .btn-icon.read-btn:hover { color: var(--color-primary); background: rgba(78, 205, 196, 0.1); }
                .btn-icon.delete-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

                @media (max-width: 640px) {
                    .notification-dropdown {
                        position: fixed;
                        top: 72px; /* Below navbar */
                        left: 1rem;
                        right: 1rem;
                        width: auto;
                        max-height: calc(100vh - 100px);
                        transform-origin: top center;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotificationPanel;
