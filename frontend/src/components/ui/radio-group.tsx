"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
        "aspect-square size-5 rounded-full",
        // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
        "border border-gray-300", // 1. По умолчанию рамка серая и видимая
        "text-primary ring-offset-background", // Стандартные цвета
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // Стили фокуса
        "disabled:cursor-not-allowed disabled:opacity-50",
        // 2. Стили для ВЫБРАННОГО состояния
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        {/* Увеличиваем точку, чтобы она выглядела пропорционально */}
        <CircleIcon className="fill-current size-2.5" /> 
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }