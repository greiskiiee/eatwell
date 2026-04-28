import {
  Bookmark,
  BookOpen,
  Calendar,
  Home,
  Search,
  ShoppingCart,
} from "lucide-react";

export const ALLERGENS = [
  { id: "gluten", label: "Gluten", emoji: "🌾" },
  { id: "dairy", label: "Dairy", emoji: "🥛" },
  { id: "nuts", label: "Nuts", emoji: "🥜" },
];

export const CATEGORIES = [
  "Үндэсний хоол",
  "Шөл",
  "Талх, бялуу",
  "Цагаан хоол",
  "Амттан",
  "Уух зүйл",
];

export const NAV_ITEMS = [
  { icon: Home, label: "Нүүр", href: "/", active: true },
  { icon: Search, label: "Хайх", href: "/search", active: false },
  { icon: Bookmark, label: "Хадгалсан", href: "/saved", active: false },
  {
    icon: BookOpen,
    label: "Миний хоолны дэвтэр",
    href: "/my-recipes",
    active: false,
  },
  {
    icon: Calendar,
    label: "Долоо хоногийн төлөвлөгөө",
    href: "/planner",
    active: false,
  },
  {
    icon: ShoppingCart,
    label: "Дэлгүүрийн жагсаалт",
    href: "/shopping",
    active: false,
  },
];
