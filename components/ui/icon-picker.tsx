"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_MAP, ICON_NAMES, DynamicIcon } from "@/lib/icons";
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

export { ICON_NAMES, type IconName } from "@/lib/icons";

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Safe cast for dynamically rendering icons from Lucide

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
              <DynamicIcon icon={value} className="h-4 w-4" />
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
                  const Icon = ICON_MAP[iconName];
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
                        value === iconName && "border-oreo-periwinkle bg-oreo-periwinkle",
                        "[&>svg:last-child]:hidden"
                      )}
                    >
                      <Icon className={cn("h-6 w-6", value === iconName ? "text-primary-foreground" : "text-foreground")} />
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
