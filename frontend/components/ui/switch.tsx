import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(event.target.checked);
            onChange?.(event);
        };

        return (
            <label className={cn("relative inline-flex items-center cursor-pointer", className)}>
                <input
                    type="checkbox"
                    className="sr-only peer"
                    ref={ref}
                    checked={checked}
                    onChange={handleChange}
                    {...props}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
