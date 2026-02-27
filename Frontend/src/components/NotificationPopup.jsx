import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Package, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import {
    getNotificationsAPI,
    markNotificationReadAPI,
    markAllNotificationsReadAPI,
    deleteNotificationAPI,
} from '../utils/api';

const NotificationPopup = ({ accentColor = '#667eea' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const popupRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getNotificationsAPI();
            if (res.success) {
                setNotifications(res.data || []);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Poll for unread count every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleToggle = () => {
        if (!isOpen) fetchNotifications();
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationReadAPI(id);
            setNotifications((prev) =>
                prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsReadAPI();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotificationAPI(id);
            const deleted = notifications.find((n) => n.notification_id === id);
            setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
            if (deleted && !deleted.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Order':
                return <Package size={16} style={{ color: '#3b82f6' }} />;
            case 'Alert':
                return <AlertTriangle size={16} style={{ color: '#ef4444' }} />;
            case 'Success':
                return <CheckCircle size={16} style={{ color: '#10b981' }} />;
            default:
                return <Info size={16} style={{ color: '#8b5cf6' }} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Order':   return 'rgba(59,130,246,0.15)';
            case 'Alert':   return 'rgba(239,68,68,0.15)';
            case 'Success': return 'rgba(16,185,129,0.15)';
            default:        return 'rgba(139,92,246,0.15)';
        }
    };

    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notif-wrapper" ref={popupRef}>
            {/* Bell Button */}
            <button className="notification-btn" title="Notifications" onClick={handleToggle}>
                <Bell size={18} className="notification-icon" />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Popup Panel */}
            {isOpen && (
                <div className="notif-popup">
                    {/* Header */}
                    <div className="notif-popup-header">
                        <h3 className="notif-popup-title">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="notif-unread-pill">{unreadCount} new</span>
                            )}
                        </h3>
                        <div className="notif-header-actions">
                            {unreadCount > 0 && (
                                <button
                                    className="notif-action-btn"
                                    onClick={handleMarkAllRead}
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={15} />
                                    <span>Mark all read</span>
                                </button>
                            )}
                            <button
                                className="notif-close-btn"
                                onClick={() => setIsOpen(false)}
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="notif-popup-body">
                        {loading && notifications.length === 0 ? (
                            <div className="notif-empty">
                                <div className="notif-spinner" />
                                <p>Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty">
                                <Bell size={40} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
                                <p>No notifications yet</p>
                                <span>You're all caught up!</span>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.notification_id}
                                    className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                                    onClick={() => !notif.is_read && handleMarkAsRead(notif.notification_id)}
                                >
                                    <div
                                        className="notif-item-icon"
                                        style={{ background: getTypeColor(notif.type) }}
                                    >
                                        {getTypeIcon(notif.type)}
                                    </div>
                                    <div className="notif-item-content">
                                        <p className="notif-item-message">{notif.message}</p>
                                        <span className="notif-item-time">{timeAgo(notif.created_at)}</span>
                                    </div>
                                    <div className="notif-item-actions">
                                        {!notif.is_read && (
                                            <button
                                                className="notif-icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notif.notification_id);
                                                }}
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            className="notif-icon-btn delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notif.notification_id);
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    {!notif.is_read && <div className="notif-unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .notif-wrapper {
                    position: relative;
                }

                .notif-popup {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: -8px;
                    width: 400px;
                    max-height: 520px;
                    background: rgba(20, 28, 45, 0.98);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: notifSlideIn 0.2s ease-out;
                }

                @keyframes notifSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .notif-popup-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    flex-shrink: 0;
                }

                .notif-popup-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-main, #fff);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0;
                }

                .notif-unread-pill {
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 20px;
                    background: ${accentColor}22;
                    color: ${accentColor};
                    border: 1px solid ${accentColor}44;
                }

                .notif-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .notif-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.35rem 0.65rem;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.6);
                    border-radius: 8px;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.15s;
                    white-space: nowrap;
                }

                .notif-action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-main, #fff);
                }

                .notif-close-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.3rem;
                    border: none;
                    background: none;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .notif-close-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--text-main, #fff);
                }

                .notif-popup-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.5rem 0;
                }

                .notif-popup-body::-webkit-scrollbar {
                    width: 4px;
                }

                .notif-popup-body::-webkit-scrollbar-track {
                    background: transparent;
                }

                .notif-popup-body::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }

                .notif-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 1rem;
                    color: rgba(255, 255, 255, 0.4);
                    text-align: center;
                }

                .notif-empty p {
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .notif-empty span {
                    font-size: 0.8rem;
                    opacity: 0.6;
                }

                .notif-spinner {
                    width: 28px;
                    height: 28px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: ${accentColor};
                    border-radius: 50%;
                    animation: notifSpin 0.7s linear infinite;
                    margin-bottom: 0.75rem;
                }

                @keyframes notifSpin {
                    to { transform: rotate(360deg); }
                }

                .notif-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 0.85rem 1.25rem;
                    cursor: pointer;
                    transition: background 0.15s;
                    position: relative;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                }

                .notif-item:last-child {
                    border-bottom: none;
                }

                .notif-item:hover {
                    background: rgba(255, 255, 255, 0.04);
                }

                .notif-item.unread {
                    background: rgba(255, 255, 255, 0.02);
                }

                .notif-item.unread:hover {
                    background: rgba(255, 255, 255, 0.06);
                }

                .notif-item-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .notif-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .notif-item-message {
                    font-size: 0.85rem;
                    color: var(--text-main, #fff);
                    line-height: 1.45;
                    margin: 0 0 0.25rem 0;
                    word-break: break-word;
                }

                .notif-item.unread .notif-item-message {
                    font-weight: 600;
                }

                .notif-item-time {
                    font-size: 0.72rem;
                    color: rgba(255, 255, 255, 0.35);
                }

                .notif-item-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    flex-shrink: 0;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .notif-item:hover .notif-item-actions {
                    opacity: 1;
                }

                .notif-icon-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.5);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .notif-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: var(--text-main, #fff);
                }

                .notif-icon-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .notif-unread-dot {
                    position: absolute;
                    left: 6px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: ${accentColor};
                }

                @media (max-width: 480px) {
                    .notif-popup {
                        width: calc(100vw - 24px);
                        right: -60px;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotificationPopup;
