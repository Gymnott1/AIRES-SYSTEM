import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { cn } from '../lib/utils'; // Assuming your simple cn is here

// 1. Create Context
const DropdownContext = createContext({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
});

// Custom hook to use the context
const useDropdown = () => useContext(DropdownContext);

// 2. DropdownMenu Root Component (Provider)
export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggle = () => setIsOpen(prev => !prev);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <div ref={dropdownRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

// 3. DropdownMenuTrigger Component
export const DropdownMenuTrigger = ({ children, className = '', asChild = false, ...props }) => {
  const { toggle, isOpen } = useDropdown();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        toggle();
        if (children.props.onClick) {
          children.props.onClick(e);
        }
      },
      'aria-haspopup': 'menu',
      'aria-expanded': isOpen,
      ...props
    });
  }

  return (
    <button
      type="button"
      className={cn('dropdown-trigger-base-styles', className)}
      onClick={toggle}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </button>
  );
};

// 4. DropdownMenuContent Component
export const DropdownMenuContent = ({ children, className = '', align = 'start', ...props }) => {
  const { isOpen } = useDropdown();

  const alignmentClasses = {
    start: 'origin-top-left left-0',
    end: 'origin-top-right right-0',
    center: 'origin-top left-1/2 -translate-x-1/2'
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        alignmentClasses[align] || alignmentClasses.start,
        className
      )}
      role="menu"
      aria-orientation="vertical"
      {...props}
    >
      {children}
    </div>
  );
};

// 5. DropdownMenuItem Component
export const DropdownMenuItem = ({ children, className = '', onSelect, disabled, ...props }) => {
  const { setIsOpen } = useDropdown();

  const handleClick = (e) => {
    if (disabled) return;
    if (onSelect) {
      onSelect(e);
    }
    setIsOpen(false);
  };

  return (
    <button
      type="button"
      className={cn(
        'block w-full text-left px-2 py-1.5 text-sm rounded-sm',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:outline-none',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-default',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};

// 6. DropdownMenuLabel Component
export const DropdownMenuLabel = ({ children, className = '', ...props }) => (
  <div className={cn('px-2 py-1.5 text-sm font-semibold text-muted-foreground', className)} {...props}>
    {children}
  </div>
);

// 7. DropdownMenuSeparator Component
export const DropdownMenuSeparator = ({ className = '', ...props }) => (
  <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
);

// --- Other Dropdown Components (Placeholders/Not Implemented Simply) ---
export const DropdownMenuGroup = ({ children, ...props }) => <div {...props}>{children}</div>;
export const DropdownMenuSub = ({ children }) => { console.warn("Simple DropdownMenu does not support Submenus"); return <>{children}</>; };
export const DropdownMenuSubTrigger = ({ children }) => { console.warn("Simple DropdownMenu does not support Submenus"); return <>{children}</>; };
export const DropdownMenuSubContent = ({ children }) => { console.warn("Simple DropdownMenu does not support Submenus"); return null; };
export const DropdownMenuCheckboxItem = ({ children }) => { console.warn("Simple DropdownMenu does not support CheckboxItems"); return <DropdownMenuItem>{children}</DropdownMenuItem>; };
export const DropdownMenuRadioGroup = ({ children }) => { console.warn("Simple DropdownMenu does not support RadioGroup"); return <>{children}</>; };
export const DropdownMenuRadioItem = ({ children }) => { console.warn("Simple DropdownMenu does not support RadioItem"); return <DropdownMenuItem>{children}</DropdownMenuItem>; };
export const DropdownMenuShortcut = ({ children, className = '', ...props }) => <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props}>{children}</span>;
export const DropdownMenuPortal = ({ children }) => <>{children}</>;
