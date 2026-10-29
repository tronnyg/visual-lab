import {NextResponse} from "next/server";
import {store} from "@/board/store";
export const dynamic="force-dynamic";
export async function POST(req:Request){const b=await req.json();const e=store.addEvent({board:b.board??"main",type:b.type??"action",message:b.message??"",params:b.params,formState:b.formState});return NextResponse.json({ok:true,id:e.id})}
