import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary:
          'bg-emerald-700 text-emerald-50 shadow-soft hover:bg-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400',
        gold: 'bg-gradient-to-b from-gold-300 to-gold-500 text-ink-950 shadow-glow-gold hover:from-gold-200 hover:to-gold-400',
        ghost:
          'bg-transparent text-ink-900 hover:bg-ink-900/5 dark:text-emerald-50 dark:hover:bg-white/8',
        outline:
          'border border-ink-900/12 text-ink-900 hover:bg-ink-900/5 dark:border-white/15 dark:text-emerald-50 dark:hover:bg-white/8',
        subtle: 'bg-emerald-900/6 text-emerald-800 hover:bg-emerald-900/10 dark:bg-white/8 dark:text-emerald-100 dark:hover:bg-white/12',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = 'Button';
