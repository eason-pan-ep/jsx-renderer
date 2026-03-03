import React from 'react';

interface PaneProps {
    /** Title text displayed in the pane header */
    title: React.ReactNode;
    /** Optional action element (e.g. a Button) rendered on the right side of the header */
    headerAction?: React.ReactNode;
    /** Style overrides for the outer pane container */
    style?: React.CSSProperties;
    /** Style overrides for the pane-content container */
    contentStyle?: React.CSSProperties;
    /** Extra props to spread on the pane-content div (e.g. onDragLeave) */
    contentProps?: React.HTMLAttributes<HTMLDivElement>;
    /** Easter egg: click handler for the red window dot */
    onRedDotClick?: () => void;
    /** Easter egg: click handler for the green window dot */
    onGreenDotClick?: () => void;
    children: React.ReactNode;
}

export const Pane: React.FC<PaneProps> = ({
    title,
    headerAction,
    style,
    contentStyle,
    contentProps,
    onRedDotClick,
    onGreenDotClick,
    children,
}) => {
    return (
        <div className="pane" style={style}>
            <div className="pane-header">
                <div className="window-controls">
                    <div
                        className={`window-dot dot-red ${onRedDotClick ? 'dot-clickable' : ''}`}
                        onClick={onRedDotClick}
                        title={onRedDotClick ? 'Close' : undefined}
                    ></div>
                    <div className="window-dot dot-yellow"></div>
                    <div
                        className={`window-dot dot-green ${onGreenDotClick ? 'dot-clickable' : ''}`}
                        onClick={onGreenDotClick}
                        title={onGreenDotClick ? 'Full Screen' : undefined}
                    ></div>
                </div>
                <span className="pane-header-title">
                    {title}
                </span>
                {headerAction}
            </div>
            <div className="pane-content" style={contentStyle} {...contentProps}>
                {children}
            </div>
        </div>
    );
};
