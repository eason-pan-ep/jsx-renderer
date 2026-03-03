import React, { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

const SESSION_KEY = 'jsx-renderer-mobile-dismissed';

export const MobileGate: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [dismissed, setDismissed] = useState(() => {
        return sessionStorage.getItem(SESSION_KEY) === 'true';
    });

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const hasTouchScreen = navigator.maxTouchPoints > 0;

        const check = () => setIsMobile(mq.matches && hasTouchScreen);
        check();

        mq.addEventListener('change', check);
        return () => mq.removeEventListener('change', check);
    }, []);

    if (!isMobile || dismissed) return null;

    const handleDismiss = () => {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setDismissed(true);
    };

    return (
        <div className="mobile-gate">
            <div className="mobile-gate-card">
                <img
                    src="/jsx_renderer_icon.png"
                    alt="JSX Renderer"
                    className="mobile-gate-icon"
                />
                <h1 className="mobile-gate-title">JSX Renderer</h1>

                <div className="mobile-gate-divider" />

                <div className="mobile-gate-message">
                    <Monitor size={28} strokeWidth={2.5} />
                    <p>This app is designed for <strong>desktop and laptop</strong> browsers.</p>
                    <p className="mobile-gate-sub">
                        For the best experience, please visit on a larger screen.
                    </p>
                </div>

                <button className="mobile-gate-dismiss" onClick={handleDismiss}>
                    Continue Anyway →
                </button>
            </div>
        </div>
    );
};
