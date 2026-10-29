export interface TextProps { value: string; tone?: "default" | "muted"; size?: "body" | "title" | "heading"; }
export function Text({value,tone="default",size="body"}:TextProps){return <p className={`vl-text vl-text--${size} vl-text--${tone}`}>{value}</p>}
