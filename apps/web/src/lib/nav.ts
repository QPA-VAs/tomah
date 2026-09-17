import type { UserRole } from "./types";

export interface NavItem {
  label: string;
  path: string;
  /** Roles allowed to see the item. ADMIN always allowed. Empty = all staff. */
  roles?: UserRole[];
}

export interface NavSection {
  title: "Overview" | "Manage";
  items: NavItem[];
}

/**
 * Sidebar is split into two sections per the UI Direction.
 * Role visibility mirrors the API's requireRole guards:
 *   ADMIN          — everything
 *   ORDER_MANAGER  — orders, quotes, invoices, wholesale accounts, customers
 *   CONTENT_EDITOR — catalogue + content
 */
export const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", path: "/" }],
  },
  {
    title: "Manage",
    items: [
      { label: "Products", path: "/products", roles: ["CONTENT_EDITOR"] },
      { label: "Wholesale Accounts", path: "/wholesale-accounts", roles: ["ORDER_MANAGER"] },
      { label: "Quotes", path: "/quotes", roles: ["ORDER_MANAGER"] },
      { label: "Invoices", path: "/invoices", roles: ["ORDER_MANAGER"] },
      { label: "Orders", path: "/orders", roles: ["ORDER_MANAGER"] },
      { label: "Customers", path: "/customers", roles: ["ORDER_MANAGER"] },
      { label: "Content", path: "/content", roles: ["CONTENT_EDITOR"] },
      { label: "Settings", path: "/settings", roles: ["ADMIN"] },
    ],
  },
];

export function visibleNav(hasRole: (...r: UserRole[]) => boolean): NavSection[] {
  return NAV.map((section) => ({
    ...section,
    items: section.items.filter((i) => !i.roles || hasRole(...i.roles)),
  })).filter((section) => section.items.length > 0);
}
