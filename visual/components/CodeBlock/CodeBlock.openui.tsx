import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {CodeBlock} from "./CodeBlock";

// Positional order matters in OpenUI Lang: code, then language and the display options.
// `code` is not wrapped in reactive(): CodeBlock is read-only. It is a string, so use \n for line breaks and \" for quotes.
const codeBlockProps = z.object({
  code: z.string().describe("The source text. Use \\n for line breaks; indentation is preserved. Shown exactly as written, never executed"),
  language: z.string().optional().describe("Label for the header, e.g. \"typescript\". Descriptive only: there is no syntax highlighting"),
  showLineNumbers: z.boolean().optional().describe("Number each line. Default false"),
  copyable: z.boolean().optional().describe("Show a copy button. Default false"),
  wrap: z.boolean().optional().describe("Wrap long lines instead of scrolling sideways. Default false"),
});

export const codeBlockDefinition = defineComponent({
  name: "CodeBlock",
  description: "A read-only block of source code, commands or logs in a monospace font with preserved indentation: CodeBlock(code, language, showLineNumbers, copyable, wrap), e.g. CodeBlock(\"const total = items.length;\", \"typescript\", true, true). Write code with \\n line breaks. The language is only a label (no syntax highlighting). It cannot be edited or run. Use Markdown for prose with a short snippet and Text for inline values.",
  props: codeBlockProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {code, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <CodeBlock code={String(code ?? "")} {...rest} />;
  },
});
