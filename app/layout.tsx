import type { Metadata } from "next";
import "@/styles/tokens.css"; import "@/styles/themes.css"; import "@/styles/globals.css"; import "@/styles/components.css";
export const metadata: Metadata = { title: "Visual Lab", description: "A standalone OpenUI component development canvas" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html> }
