import React from 'react';
import { cn } from '../lib/utils'; 

export const Card = ({ children, className = '', ...props }) => (
  <div className={cn('shadow rounded bg-card text-card-foreground', className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('border-b pb-2 p-6', className)} {...props}> 
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  
  <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
);


export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props}>
    {children}
  </p>
);


export const CardContent = ({ children, className = '', ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props}> 
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props}> 
    {children}
  </div>
);
