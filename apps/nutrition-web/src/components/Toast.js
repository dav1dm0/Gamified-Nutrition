import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => onClose && onClose(), duration);
        return () => clearTimeout(t);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className={`toast toast-${type}`} role="status" aria-live="polite">
            {message}
        </div>
    );
}
