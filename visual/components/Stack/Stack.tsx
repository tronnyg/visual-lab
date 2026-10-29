import type {ReactNode} from "react";
export interface StackProps {children: ReactNode; gap?: "sm" | "md" | "lg";}
export function Stack({children,gap="md"}:StackProps){return <div className={`vl-stack vl-stack--${gap}`}>{children}</div>}
