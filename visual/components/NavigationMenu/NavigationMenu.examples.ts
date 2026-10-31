// Positional args: NavigationMenu(items, activeId, orientation, label). Each item is {id, label, href?, disabled?}. Links must be full URLs, mailto:, tel: or #anchors.
export const navigationMenuExamples = [
  {
    title: "Horizontal navigation",
    code: 'root = NavigationMenu([{id: "home", label: "Home", href: "https://example.com"}, {id: "products", label: "Products", href: "https://example.com/products"}, {id: "pricing", label: "Pricing", href: "https://example.com/pricing"}, {id: "contact", label: "Contact", href: "https://example.com/contact"}], "products", "horizontal", "Main")',
  },
  {
    title: "Vertical navigation with a disabled item",
    code: 'root = NavigationMenu([{id: "profile", label: "Profile", href: "#profile"}, {id: "security", label: "Security", href: "#security"}, {id: "billing", label: "Billing (unavailable)", href: "#billing", disabled: true}, {id: "team", label: "Team", href: "#team"}], "security", "vertical", "Settings")',
  },
  {
    title: "Navigation sections in a card",
    code: 'root = Card(null, null, [title, account, divider, help])\ntitle = Text("Workspace", "default", "subheading")\naccount = NavigationMenu([{id: "overview", label: "Overview", href: "#overview"}, {id: "members", label: "Members", href: "#members"}], "overview", "vertical", "Account")\ndivider = Divider()\nhelp = NavigationMenu([{id: "docs", label: "Documentation", href: "https://example.com/docs"}, {id: "support", label: "Support", href: "mailto:support@example.com"}], null, "vertical", "Help")',
  },
] as const;
