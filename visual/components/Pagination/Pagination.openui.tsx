import {useId} from "react";
import {defineComponent, reactive, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Pagination, paginationVariants} from "./Pagination";

// Positional order matters in OpenUI Lang: page, totalPages, variant, siblingCount, boundaryCount, disabled.
// `page` is reactive(): a bare `$variable` stays a two-way binding that other expressions can read. A number only sets the starting page
// and the control then keeps its own page. Pagination never slices or fetches data; the program decides what each page shows.
const paginationProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  page: reactive(z.number().describe("The current page, from 1: a bare number $variable (two-way, readable elsewhere) or a number for the starting page")),
  totalPages: z.number().describe("How many pages there are"),
  variant: z.enum(paginationVariants).optional().describe("default (numbered pages) or compact (previous, \"Page X of Y\", next). Default default"),
  siblingCount: z.number().optional().describe("Pages shown each side of the current page. Default 1"),
  boundaryCount: z.number().optional().describe("Pages always shown at the start and end. Default 1"),
  disabled: z.boolean().optional().describe("Disables every control. Default false"),
});

export const paginationDefinition = defineComponent({
  name: "Pagination",
  description: "Navigation through a paged collection: Pagination(page, totalPages, variant, siblingCount, boundaryCount, disabled), e.g. Pagination($page, 12). Pass a bare number $variable declared with a start page (e.g. $page = 1) so other components can read it, e.g. Text(\"Page \" + $page + \" of 12\"). It only tracks the page: it does not slice, fetch or filter anything, so tie the content to $page yourself (for instance a Table whose rows come from @Filter(rows, \"page\", \"==\", $page)). Pages beyond a few are collapsed with ellipses. Use compact in narrow spaces.",
  props: paginationProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Paginations never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.page);
    const {variant, siblingCount, boundaryCount, disabled} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    const current = typeof field.value === "number" ? field.value : undefined;
    return (
      <Pagination
        {...(field.isReactive ? {page: current ?? 1} : {defaultPage: current})}
        totalPages={typeof props.totalPages === "number" ? props.totalPages : 0}
        onPageChange={next => { if (field.isReactive) field.setValue(next); }}
        variant={variant}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        disabled={disabled === true}
      />
    );
  },
});
