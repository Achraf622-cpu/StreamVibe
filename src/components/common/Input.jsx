import React from 'react';

export const Input = ({
    type = 'text',
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div className="input-wrapper">
                {Icon && <Icon className="input-icon" size={20} />}
                <input
                    type={type}
                    className={`input-field ${error ? 'input-error' : ''} ${Icon ? 'has-icon' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
};
