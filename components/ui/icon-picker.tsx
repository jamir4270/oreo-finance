"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Curated list of finance/lifestyle icons
export const ICON_NAMES = [
  "Wallet", "Banknote", "CreditCard", "PiggyBank", "Landmark", "Receipt", "ShoppingCart",
  "Coffee", "Utensils", "Car", "Bus", "Train", "Plane", "Home", "Wrench",
  "Lightbulb", "Zap", "Smartphone", "Laptop", "Music", "Film", "Book",
  "GraduationCap", "Heart", "Smile", "Briefcase", "Gift", "Shirt", "Scissors",
  "Stethoscope", "Pill", "Baby", "Dog", "Cat", "Dumbbell", "Tent", "Trophy",
  "Gamepad2", "Tv", "Headphones", "Bitcoin", "Gem", "TrendingUp", "TrendingDown",
  "PieChart", "BarChart", "Activity", "Flame", "Droplet", "Umbrella", "Snowflake",
  "Sun", "Moon", "Star"
] as const;

export type IconName = typeof ICON_NAMES[number];

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Safe cast for dynamically rendering icons from Lucide
  const SelectedIcon = value ? (LucideIcons as Record<string, any>)[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          {value ? (
            <div className="flex items-center gap-2">
              {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select an icon...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      } />
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search icon..." />
          <CommandList>
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup>
              <div className="grid grid-cols-4 gap-2 p-2">
                {ICON_NAMES.map((iconName) => {
                  const Icon = (LucideIcons as Record<string, any>)[iconName];
                  if (!Icon) return null;
                  
                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={() => {
                        onChange(iconName);
                        setOpen(false);
                      }}
                      className={cn(
                        "relative flex aspect-square items-center justify-center cursor-pointer rounded-md border border-transparent px-0 py-0 transition-all duration-[--duration-sm] ease-[--ease-oreo]",
                        "hover:-translate-y-[1px] hover:shadow-oreo-sm hover:border-border hover:bg-muted/50",
                        value === iconName && "border-oreo-periwinkle bg-oreo-periwinkle"
                      )}
                    >
                      <Icon className={cn("h-6 w-6 m-auto", value === iconName ? "text-primary-foreground" : "text-foreground")} />
                      {value === iconName && (
                        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <span className="sr-only">{iconName}</span>
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
