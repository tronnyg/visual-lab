import type {ReactNode} from "react";
export interface CardProps {title?:string;body?:string;children?:ReactNode;}
export function Card({title,body,children}:CardProps){return <section className="vl-card">{title&&<h3 className="vl-card__title">{title}</h3>}{body&&<p className="vl-card__body">{body}</p>}{children}</section>}
