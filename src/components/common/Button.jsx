// using simple string concatenation for classes

// Using clsx/tailwind-merge pattern for manual class handling if we wanted, 
// but since we are using Vanilla CSS primarily, we will use scoped classes or BEM-ish modules.
// However, the user didn't ban utils, and for a modern React app, utility classes are handy.
// Since I installed lucide-react but NOT tailwind, I should stick to my CSS variables and usage of standard classes.
// I will not use tailwind-merge if I don't use tailwind. 
// I'll just use a `className` prop and pure CSS modules or global styles.
// Wait, I didn't install tailwind. So `twMerge` is useless. I will remove it and `clsx` from imports if I don't need them.
// I'll use standard CSS classes defined in index.css or a new specific CSS file.
// Let's create `Button.css` content inline or just use `index.css` utilities.
// I'll stick to `index.css` global classes for buttons to keep it simple.

/*
  Classes expected in index.css or to be added:
  .btn { display: inline-flex; align-items: center; justify-content: center; transition... }
  .btn-primary { background: var(--primary); ... }
  .btn-secondary { ... }
  .btn-outline { ... }
  .btn-ghost { ... }
  .btn-sm, .btn-md, .btn-lg
*/

// Let's Add Button Styles to a new file `src/styles/components.css` and import it in index.css
// Or just inline styles for specific things? No, separated is better.
// I'll create `src/styles/components.css` and write the Button component.

import React from 'react';
import '../../styles/components.css'; // We will create this

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    icon: Icon,
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? <span className="spinner"></span> : Icon && <Icon size={18} className="btn-icon" />}
            {children}
        </button>
    );
};
