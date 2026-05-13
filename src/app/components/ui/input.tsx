import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888AA]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-[56px] bg-[#1E1E2A] rounded-xl text-[#F0F0F5] px-4 text-[16px] outline-none border-2 border-transparent focus:border-[#39FF6E] focus:bg-[#14141C] transition-all placeholder:text-[#8888AA]",
            icon && "pl-[48px]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
