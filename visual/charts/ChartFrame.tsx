import {useId, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode} from "react";
import {ChartDataTable, type ChartTableProps} from "./chartAccessibility";

export const legendShapes = ["circle", "square", "diamond", "triangle", "cross", "star"] as const;
export type LegendShape = (typeof legendShapes)[number] | "line";

export interface LegendItem {
  label: string;
  color: string;
  shape?: LegendShape;
  /** Extra text after the label, such as a share ("55%"). */
  detail?: string;
}

export interface ChartState {
  kind: "empty" | "invalid";
  message: string;
  /** Specific problems, shown under the message. */
  details?: readonly string[];
}

interface ChartFrameOwnProps {
  /** Accessible name of the chart. Used when there is no visible title. */
  name: string;
  title?: string;
  description?: string;
  height: number;
  /** When set, the plot, legend and table are replaced by this message. */
  state?: ChartState;
  legend?: readonly LegendItem[];
  table?: ChartTableProps;
  /** The drawn plot. It is only rendered when there is no `state`. */
  children?: ReactNode;
}

export type ChartFrameProps = ChartFrameOwnProps & Omit<ComponentPropsWithoutRef<"figure">, keyof ChartFrameOwnProps>;

const MAX_DETAILS = 3;

/** The shared outer structure of a chart: a named figure with an optional visible title and description, the plot, a legend and the hidden data table. */
export function ChartFrame({name, title, description, height, state, legend, table, children, className, ...rest}: ChartFrameProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const hasTitle = Boolean(title?.trim());
  const hasDescription = Boolean(description?.trim());
  return (
    <figure
      {...rest}
      className={className ? `vl-chart ${className}` : "vl-chart"}
      data-state={state?.kind}
      {...(hasTitle ? {"aria-labelledby": titleId} : {"aria-label": name})}
      {...(hasDescription ? {"aria-describedby": descriptionId} : {})}
    >
      {hasTitle || hasDescription ? (
        <figcaption className="vl-chart__caption">
          {hasTitle ? <span id={titleId} className="vl-chart__title">{title}</span> : null}
          {hasDescription ? <span id={descriptionId} className="vl-chart__description">{description}</span> : null}
        </figcaption>
      ) : null}
      {state ? (
        <div className="vl-chart__state" role={state.kind === "invalid" ? "alert" : "status"}>
          <p className="vl-chart__state-message">{state.message}</p>
          {state.details?.length ? (
            <ul className="vl-chart__state-details">
              {state.details.slice(0, MAX_DETAILS).map((d, i) => <li key={i}>{d}</li>)}
              {state.details.length > MAX_DETAILS ? <li>…and {state.details.length - MAX_DETAILS} more</li> : null}
            </ul>
          ) : null}
        </div>
      ) : (
        <>
          <div className="vl-chart__plot" style={{height}}>{children}</div>
          {/* Decorative: the series names and values are in the data table, so a screen reader hears them once. */}
          {legend?.length ? (
            <ul className="vl-chart__legend" aria-hidden="true">
              {legend.map((item, i) => (
                <li key={i} className="vl-chart__legend-item">
                  <span className="vl-chart__swatch" data-shape={item.shape ?? "square"} style={{"--vl-swatch": item.color} as CSSProperties} />
                  <span>{item.label}</span>
                  {item.detail ? <span className="vl-chart__legend-detail">{item.detail}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {table ? <ChartDataTable {...table} /> : null}
        </>
      )}
    </figure>
  );
}
