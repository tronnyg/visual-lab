"use client";
import {Component,type ReactNode} from "react";
import {Renderer,type ActionEvent,type OpenUIError} from "@openuidev/react-lang";
import {library} from "./library";
class Boundary extends Component<{children:ReactNode},{error:string|null}>{state={error:null as string|null};static getDerivedStateFromError(e:Error){return {error:e.message}}render(){return this.state.error?<p role="alert">Render error: {this.state.error}</p>:this.props.children}}
export function VisualRenderer({code,onAction,onError}:{code:string;onAction?:(e:ActionEvent)=>void;onError?:(e:OpenUIError[])=>void}){return <Boundary key={code}><Renderer response={code} library={library} onAction={onAction} onError={onError}/></Boundary>}
