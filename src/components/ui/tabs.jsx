// Tabs.js
import React from "react";
import { cn } from "../lib/utils";

export const Tabs = React.forwardRef(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [tabValue, setTabValue] = React.useState(value || defaultValue || "");

    React.useEffect(() => {
      if (value !== undefined) {
        setTabValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue) => {
      setTabValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    return (
      <div className={cn("tabs-root", className)} ref={ref} {...props}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          // Pass activeValue and onValueChange to all immediate children.
          return React.cloneElement(child, {
            activeValue: tabValue,
            onValueChange: handleValueChange,
          });
        })}
      </div>
    );
  }
);

export const TabsList = React.forwardRef(
  ({ className, children, activeValue, onValueChange, ...props }, ref) => {
    return (
      <div
        className={cn("flex space-x-1 rounded-lg bg-gray-100 p-1", className)}
        ref={ref}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          // Ensure each trigger gets activeValue and onValueChange
          return React.cloneElement(child, { activeValue, onValueChange });
        })}
      </div>
    );
  }
);

export const TabsTrigger = React.forwardRef(
  ({ className, value, onValueChange, activeValue, children, ...props }, ref) => {
    const isActive = activeValue === value;
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isActive
            ? "bg-white text-black shadow-sm"
            : "text-gray-600 hover:text-black",
          className
        )}
        onClick={() => onValueChange && onValueChange(value)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export const TabsContent = React.forwardRef(
  ({ className, value, activeValue, children, ...props }, ref) => {
    if (activeValue !== value) {
      return null;
    }
    return (
      <div className={cn("mt-2", className)} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
