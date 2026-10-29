export type Board={id:string;name:string;code:string;createdAt:number;updatedAt:number};
export type UiEvent={id:string;board:string;type:string;message:string;params?:Record<string,unknown>;formState?:Record<string,unknown>;at:number};
