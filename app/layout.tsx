import type {Metadata} from "next";
import "@/styles/tokens.css";import "@/styles/themes.css";import "@/styles/globals.css";import "@/visual/components/Button/Button.css";import "@/visual/components/Text/Text.css";import "@/visual/components/Stack/Stack.css";import "@/visual/components/Card/Card.css";import "@/visual/components/Markdown/Markdown.css";import "@/visual/components/Image/Image.css";
export const metadata:Metadata={title:"Visual Lab",description:"A standalone OpenUI component development canvas"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
