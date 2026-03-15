import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--primary)] text-white hover:bg-[#1b3f73] focus-visible:outline-[var(--primary)]",
  secondary:
    "bg-[color:rgba(34,76,135,0.08)] text-[var(--primary)] hover:bg-[color:rgba(34,76,135,0.14)] focus-visible:outline-[var(--primary)]",
  ghost:
    "bg-transparent text-[var(--text-900)] hover:bg-[color:rgba(145,144,144,0.12)] focus-visible:outline-[var(--neutral)]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
