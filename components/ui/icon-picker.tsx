"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

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
                  const Icon = (LucideIcons as any)[iconName];
                  if (!Icon) return null;
                  
                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={(currentValue) => {
                        onChange(iconName);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex aspect-square items-center justify-center cursor-pointer rounded-md border border-transparent hover:border-border hover:bg-muted/50 px-0 py-0 transition-colors",
                        value === iconName && "border-primary/50 bg-primary/10"
                      )}
                    >
                      <Icon className="h-6 w-6 text-foreground m-auto" />
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
