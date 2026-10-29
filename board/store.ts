import fs from "node:fs";
import path from "node:path";
import {randomUUID} from "node:crypto";
import type {Board,UiEvent} from "./types";
const FILE=path.join(process.cwd(),"data","state.json");
type State={boards:Board[];events:UiEvent[];delivered:string[]};
class Store {
 private state:State={boards:[],events:[],delivered:[]};private listeners=new Set<()=>void>();
 constructor(){try{const raw=JSON.parse(fs.readFileSync(FILE,"utf8"));if(Array.isArray(raw.boards))this.state={boards:raw.boards,events:raw.events??[],delivered:raw.delivered??[]}}catch{}if(!this.state.boards.length)this.state.boards=[{id:"main",name:"Main Board",code:"",createdAt:Date.now(),updatedAt:Date.now()}]}
 private emit(){fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.writeFileSync(FILE,JSON.stringify(this.state,null,2));this.listeners.forEach(fn=>fn())}
 subscribe(fn:()=>void){this.listeners.add(fn);return ()=>{this.listeners.delete(fn)}}
 list(){return this.state.boards}
 get(id:string){return this.state.boards.find(b=>b.id===id)}
 create(name:string){const now=Date.now();const b={id:randomUUID().slice(0,8),name,code:"",createdAt:now,updatedAt:now};this.state.boards.push(b);this.emit();return b}
 rename(id:string,name:string){const b=this.get(id);if(!b)return null;b.name=name;b.updatedAt=Date.now();this.emit();return b}
 setCode(id:string,code:string){const b=this.get(id);if(!b)return null;b.code=code;b.updatedAt=Date.now();this.emit();return b}
 delete(id:string){if(this.state.boards.length<=1)return false;const before=this.state.boards.length;this.state.boards=this.state.boards.filter(b=>b.id!==id);this.emit();return before!==this.state.boards.length}
 addEvent(event:Omit<UiEvent,"id"|"at">){const e={...event,id:randomUUID().slice(0,8),at:Date.now()};this.state.events.push(e);this.state.events=this.state.events.slice(-200);this.emit();return e}
 events(board:string){return this.state.events.filter(e=>e.board===board).slice(-30)}
 takeUndelivered(board:string){const fresh=this.state.events.filter(e=>e.board===board&&!this.state.delivered.includes(e.id));this.state.delivered.push(...fresh.map(e=>e.id));this.emit();return fresh}
}
const g=globalThis as unknown as {__visualLabStore?:Store};export const store=(g.__visualLabStore??=new Store());
