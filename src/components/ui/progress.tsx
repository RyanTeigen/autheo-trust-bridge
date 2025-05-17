
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  variant?: 'default' | 'autheo';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, variant = 'default', ...props }, ref) => {
  const baseClasses = "relative h-4 w-full overflow-hidden rounded-full";
  const bgClass = variant === 'autheo' ? 'bg-muted' : 'bg-secondary';
  const indicatorBaseClasses = "h-full w-full flex-1 transition-all";
  const indicatorClass = variant === 'autheo' ? 'bg-gradient-to-r from-autheo-primary to-autheo-secondary' : 'bg-primary';
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(baseClasses, bgClass, className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(indicatorBaseClasses, indicatorClass, indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
