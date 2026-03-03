/** biome-ignore-all lint/suspicious/noArrayIndexKey: <index is fine here> */
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import * as React from "react";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  showNotches = false,
  ...props
}: SliderPrimitive.Root.Props & { showNotches?: boolean; step?: number }) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control className="grid grow data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-muted relative overflow-hidden rounded-full data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            )}
          />
          {showNotches && typeof step === "number" && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: Math.floor((max - min) / step) + 1 }).map(
                (_, i) => {
                  const percent = ((i * step) / (max - min)) * 100;
                  const isVertical = props.orientation === "vertical";
                  return (
                    <div
                      key={i}
                      className={cn(
                        "absolute bg-foreground/50 dark:bg-background/50",
                        isVertical ? "h-0.5 w-full" : "w-0.5 h-full",
                      )}
                      style={{
                        left: isVertical ? undefined : `${percent}%`,
                        bottom: isVertical ? `${percent}%` : undefined,
                        transform: isVertical
                          ? "translateY(50%)"
                          : "translateX(-50%)",
                      }}
                    />
                  );
                },
              )}
            </div>
          )}
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, i) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={i}
            className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 has-[:focus-visible]:ring-4 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
