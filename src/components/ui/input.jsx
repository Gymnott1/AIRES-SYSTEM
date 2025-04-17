import React from 'react';
import { cn } from '../lib/utils'; // Assuming your simple cn is here

// Basic Input component
export const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      // Example classes - replace with your actual input styling classes
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm', // Basic styling
        'placeholder:text-muted-foreground', // Placeholder styling
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', // Focus styling
        'disabled:cursor-not-allowed disabled:opacity-50', // Disabled styling
        className // Allow overriding/adding classes
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input"; 