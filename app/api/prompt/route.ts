import {promptText} from "@/lib/validate";export function GET(){return new Response(promptText,{headers:{"Content-Type":"text/plain; charset=utf-8"}})}
