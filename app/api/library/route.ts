import {NextResponse} from "next/server";import {catalogue} from "@/lib/validate";export function GET(){return NextResponse.json(catalogue)}
