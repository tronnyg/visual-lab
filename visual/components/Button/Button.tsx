export interface ButtonProps {label:string;disabled?:boolean;onClick?:()=>void;}
export function Button({label,disabled,onClick}:ButtonProps){return <button type="button" className="vl-button" disabled={disabled} onClick={onClick}>{label}<span className="vl-button__arrow" aria-hidden="true">→</span></button>}
