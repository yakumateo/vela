import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "outline" | "ghost";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth = true, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "h-[56px] px-6 py-4 rounded-xl font-bold text-[16px] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2",
          fullWidth ? "w-full" : "w-auto",
          {
            "bg-[#39FF6E] text-[#0A0A0F] shadow-[0_0_16px_rgba(57,255,110,0.25)] hover:shadow-[0_0_24px_rgba(57,255,110,0.4)]":
              variant === "primary",
            "bg-[#1E1E2A] text-[#F0F0F5] hover:bg-[#2A2A38]": variant === "secondary",
            "bg-[#FF3B30] text-white shadow-[0_0_16px_rgba(255,59,48,0.3)] hover:shadow-[0_0_24px_rgba(255,59,48,0.5)]":
              variant === "danger",
            "bg-[#FFD700] text-[#0A0A0F] shadow-[0_0_16px_rgba(255,215,0,0.25)]":
              variant === "warning",
            "bg-transparent border-2 border-[#F0F0F5] text-[#F0F0F5] hover:bg-[#F0F0F5]/10":
              variant === "outline",
            "bg-transparent text-[#8888AA] hover:text-[#F0F0F5]": variant === "ghost",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
