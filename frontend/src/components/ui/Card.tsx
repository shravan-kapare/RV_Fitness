import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverLift = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-[#111111] border border-[#292929] rounded-xl overflow-hidden text-[#F5F5F5]',
        hoverLift && 'transition-all duration-200 hover:border-[#383838] hover:bg-[#141414]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('px-6 py-4 border-b border-[#222222] flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={clsx('text-base font-bold text-[#F5F5F5] tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p className={clsx('text-xs text-[#A5A5A5] mt-0.5', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx('p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('px-6 py-4 border-t border-[#222222] bg-[#0E0E0E]', className)}
      {...props}
    >
      {children}
    </div>
  );
};
