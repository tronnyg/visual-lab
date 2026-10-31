import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Toast, toastPositions, toastVariants} from "./Toast";
import type {ToastItem} from "./Toast";

// Positional order matters in OpenUI Lang: items, position, label.
// The notifications are data, like Table rows: {id, title, description, variant, duration}. There is no item-removal action, so a toast hides
// itself locally when dismissed or timed out; to show or hide notifications from state, change the array with @Set (see the description).
const toastProps = z.object({
  items: z.array(z.object({
    id: z.string().describe("Unique id, e.g. \"saved\". Reusing an id shows no new notification; use a new id to show another"),
    title: z.string().describe("The headline"),
    description: z.string().optional().describe("Supporting text"),
    variant: z.enum(toastVariants).optional().describe("default, success, warning or error (error is announced assertively and stays until dismissed). Default default"),
    duration: z.number().optional().describe("Milliseconds before it hides itself, 0 for never. Default 5000 (8000 for warning, never for error)"),
  })).describe("The notifications in order: [{id: \"saved\", title: \"Changes saved\", variant: \"success\"}]"),
  position: z.enum(toastPositions).optional().describe("Corner of the screen: bottom-right (default), bottom-left, top-right, top-left"),
  label: z.string().optional().describe("Accessible name of the notification region. Default Notifications"),
});

type RawItem = {id?: unknown; title?: unknown; description?: unknown; variant?: unknown; duration?: unknown};

// Skipped entries (null, or still streaming) are dropped. A repeated id gets a numeric suffix so every notification keeps a distinct id.
function resolve(input: unknown): ToastItem[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return (input as (RawItem | null | undefined)[]).flatMap((raw): ToastItem[] => {
    if (!raw || typeof raw.id !== "string" || typeof raw.title !== "string") return [];
    let id = raw.id;
    for (let n = 2; seen.has(id); n++) id = `${raw.id}-${n}`;
    seen.add(id);
    const variant = toastVariants.find(v => v === raw.variant);
    return [{
      id,
      title: raw.title,
      description: typeof raw.description === "string" ? raw.description : undefined,
      variant,
      duration: typeof raw.duration === "number" && raw.duration >= 0 ? raw.duration : undefined,
    }];
  });
}

export const toastDefinition = defineComponent({
  name: "Toast",
  description: "Temporary, non-blocking notifications fixed to a corner of the screen: Toast(items, position, label), e.g. Toast([{id: \"saved\", title: \"Changes saved\", description: \"Your profile was updated.\", variant: \"success\"}], \"bottom-right\"). Each item is {id, title, description, variant, duration}; variants default, success, warning, error; they hide after a few seconds (error stays until dismissed) and have a dismiss button. Dismissing only hides the item on the page; there is no action to remove one. To show a notification after something happens, declare $toasts = [] and pass it as items, then have a Button replace it with @Set($toasts, [{id: \"saved-1\", title: \"Saved\", variant: \"success\"}]); use a new id each time. Notifications never take focus and cannot hold buttons. Use Alert for a message that stays in the page, Spinner or Skeleton for loading.",
  props: toastProps,
  component: ({props}) => {
    const {position, label} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return <Toast items={resolve(props.items)} position={position} label={label} />;
  },
});
