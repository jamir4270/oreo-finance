import {
  Wallet, Banknote, CreditCard, PiggyBank, Landmark, Receipt, ShoppingCart,
  Coffee, Utensils, Car, Bus, Train, Plane, Home, Wrench,
  Lightbulb, Zap, Smartphone, Laptop, Music, Film, Book,
  GraduationCap, Heart, Smile, Briefcase, Gift, Shirt, Scissors,
  Stethoscope, Pill, Baby, Dog, Cat, Dumbbell, Tent, Trophy,
  Gamepad2, Tv, Headphones, Bitcoin, Gem, TrendingUp, TrendingDown,
  PieChart, BarChart, Activity, Flame, Droplet, Umbrella, Snowflake,
  Sun, Moon, Star, Tag,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement } from "react";

// Named imports only: `import * as LucideIcons` ships every icon to the browser.
export const ICON_MAP = {
  Wallet, Banknote, CreditCard, PiggyBank, Landmark, Receipt, ShoppingCart,
  Coffee, Utensils, Car, Bus, Train, Plane, Home, Wrench,
  Lightbulb, Zap, Smartphone, Laptop, Music, Film, Book,
  GraduationCap, Heart, Smile, Briefcase, Gift, Shirt, Scissors,
  Stethoscope, Pill, Baby, Dog, Cat, Dumbbell, Tent, Trophy,
  Gamepad2, Tv, Headphones, Bitcoin, Gem, TrendingUp, TrendingDown,
  PieChart, BarChart, Activity, Flame, Droplet, Umbrella, Snowflake,
  Sun, Moon, Star,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_MAP;
export const ICON_NAMES = Object.keys(ICON_MAP) as IconName[];

/** Renders a stored icon name (from accounts/categories), falling back for unknown names. */
export function DynamicIcon({
  icon,
  fallback = Tag,
  ...props
}: { icon: string | null | undefined; fallback?: LucideIcon } & LucideProps) {
  return createElement((icon && ICON_MAP[icon as IconName]) || fallback, props);
}
