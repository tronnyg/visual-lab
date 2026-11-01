import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {FileUpload} from "./FileUpload";
import type {FileUploadProps} from "./FileUpload";
import {formatBytes, matchesAccept} from "./fileRules";

const meta = {
  title: "Components/FileUpload",
  component: FileUpload,
  decorators: [Story => <div style={{width: 360}}><Story /></div>],
  args: {onFilesChange: fn(), "aria-label": "Documents"},
  argTypes: {
    accept: {control: "text"},
    multiple: {control: "boolean"},
    maxFiles: {control: "number"},
    maxSize: {control: "number"},
    disabled: {control: "boolean"},
    required: {control: "boolean"},
    label: {control: "text"},
    onFilesChange: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// Synthetic files: no filesystem is involved. `choose` does what the browser does when someone picks files: it gives the input a real
// FileList and fires `change`. (user-event's upload() fakes the FileList in JavaScript only, which a FormData would not see.)
const file = (name: string, type: string, size = 5) => new File([new Uint8Array(size)], name, {type, lastModified: 1_700_000_000_000});
function choose(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  files.forEach(f => transfer.items.add(f));
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", {bubbles: true}));
}
const fileInput = (canvasElement: HTMLElement) => canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
const names = (canvas: ReturnType<typeof within>) => canvas.queryAllByRole("listitem").filter((li: HTMLElement) => li.querySelector(".vl-fileupload__name")).map((li: HTMLElement) => li.querySelector(".vl-fileupload__name")!.textContent);
const inputFileNames = (canvasElement: HTMLElement) => Array.from(fileInput(canvasElement).files ?? []).map(f => f.name);

export const Empty: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(fileInput(canvasElement)).toHaveAttribute("type", "file");
    await expect(canvas.getByLabelText("Choose file")).toBe(fileInput(canvasElement));
    await expect(canvas.queryByRole("list")).toBeNull();
  },
};

export const SingleFile: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const photo = file("notes.txt", "text/plain", 1500);
    choose(fileInput(canvasElement), [photo]);
    await waitFor(() => expect(names(canvas)).toEqual(["notes.txt"]));
    await expect(canvas.getByText("1.5 KB")).toBeVisible();
    await expect(args.onFilesChange).toHaveBeenLastCalledWith([photo]);
    // A second valid choice replaces the first.
    choose(fileInput(canvasElement), [file("other.txt", "text/plain")]);
    await waitFor(() => expect(names(canvas)).toEqual(["other.txt"]));
    await expect(inputFileNames(canvasElement)).toEqual(["other.txt"]);
  },
};

export const MultipleFiles: Story = {
  args: {multiple: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Choose files")).toBe(fileInput(canvasElement));
    choose(fileInput(canvasElement), [file("a.txt", "text/plain"), file("b.txt", "text/plain")]);
    await waitFor(() => expect(names(canvas)).toEqual(["a.txt", "b.txt"]));
    // Each further choice adds to the list; the same file twice is added once.
    choose(fileInput(canvasElement), [file("b.txt", "text/plain"), file("c.txt", "text/plain")]);
    await waitFor(() => expect(names(canvas)).toEqual(["a.txt", "b.txt", "c.txt"]));
    await expect(inputFileNames(canvasElement)).toEqual(["a.txt", "b.txt", "c.txt"]);
    await expect(args.onFilesChange).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({name: "c.txt"})]));
  },
};

export const AcceptedTypes: Story = {
  args: {accept: ".png,image/jpeg", multiple: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Accepted: .png, image/jpeg")).toBeVisible();
    await expect(fileInput(canvasElement)).toHaveAttribute("accept", ".png,image/jpeg");
    choose(fileInput(canvasElement), [file("a.png", "image/png"), file("b.jpg", "image/jpeg"), file("c.gif", "image/gif"), file("d.pdf", "application/pdf")]);
    await waitFor(() => expect(names(canvas)).toEqual(["a.png", "b.jpg"]));
    await expect(canvas.getByText("c.gif: file type is not accepted")).toBeVisible();
    await expect(canvas.getByText("d.pdf: file type is not accepted")).toBeVisible();
    // Rejected files never reach the input, so they are not submitted.
    await expect(inputFileNames(canvasElement)).toEqual(["a.png", "b.jpg"]);
    await expect(args.onFilesChange).toHaveBeenCalledTimes(1);
    await expect(fileInput(canvasElement)).toHaveAttribute("aria-invalid", "true");
  },
};

export const SizeLimit: Story = {
  args: {maxSize: 2048},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Up to 2 KB")).toBeVisible();
    choose(fileInput(canvasElement), [file("big.bin", "application/octet-stream", 2049)]);
    await expect(await canvas.findByText("big.bin: larger than 2 KB")).toBeVisible();
    await expect(args.onFilesChange).not.toHaveBeenCalled();
    await expect(names(canvas)).toEqual([]);
    // The limit is inclusive.
    choose(fileInput(canvasElement), [file("exact.bin", "application/octet-stream", 2048)]);
    await waitFor(() => expect(names(canvas)).toEqual(["exact.bin"]));
    await expect(canvas.queryByText(/larger than/)).toBeNull();
  },
};

export const FileCountLimit: Story = {
  args: {multiple: true, maxFiles: 2},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Up to 2 files")).toBeVisible();
    choose(fileInput(canvasElement), [file("a.txt", "text/plain"), file("b.txt", "text/plain"), file("c.txt", "text/plain")]);
    await waitFor(() => expect(names(canvas)).toEqual(["a.txt", "b.txt"]));
    await expect(canvas.getByText("Only 2 files are allowed: 1 file was not added")).toBeVisible();
    await expect(inputFileNames(canvasElement)).toEqual(["a.txt", "b.txt"]);
    // Already full: more are refused until one is removed.
    choose(fileInput(canvasElement), [file("d.txt", "text/plain")]);
    await expect(await canvas.findByText("Only 2 files are allowed: 1 file was not added")).toBeVisible();
    await expect(names(canvas)).toEqual(["a.txt", "b.txt"]);
  },
};

// A rejected choice does not discard the file that was already chosen.
export const InvalidChoiceKeepsExistingFile: Story = {
  args: {accept: ".txt"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    choose(fileInput(canvasElement), [file("ok.txt", "text/plain")]);
    await waitFor(() => expect(names(canvas)).toEqual(["ok.txt"]));
    choose(fileInput(canvasElement), [file("bad.png", "image/png")]);
    await expect(await canvas.findByText("bad.png: file type is not accepted")).toBeVisible();
    await expect(names(canvas)).toEqual(["ok.txt"]);
    await expect(inputFileNames(canvasElement)).toEqual(["ok.txt"]);
  },
};

// Cancelling the picker empties the input in some browsers; the files shown stay.
export const CancelledPickerKeepsList: Story = {
  args: {multiple: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    choose(fileInput(canvasElement), [file("a.txt", "text/plain")]);
    await waitFor(() => expect(names(canvas)).toEqual(["a.txt"]));
    choose(fileInput(canvasElement), []);
    await expect(names(canvas)).toEqual(["a.txt"]);
    await expect(inputFileNames(canvasElement)).toEqual(["a.txt"]);
    await expect(args.onFilesChange).toHaveBeenCalledTimes(1);
  },
};

export const Removal: Story = {
  args: {multiple: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    choose(fileInput(canvasElement), [file("a.txt", "text/plain"), file("b.txt", "text/plain"), file("c.txt", "text/plain")]);
    await waitFor(() => expect(names(canvas)).toEqual(["a.txt", "b.txt", "c.txt"]));
    await userEvent.click(canvas.getByRole("button", {name: "Remove b.txt"}));
    await expect(names(canvas)).toEqual(["a.txt", "c.txt"]);
    await expect(inputFileNames(canvasElement)).toEqual(["a.txt", "c.txt"]);
    await expect(args.onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({name: "a.txt"}), expect.objectContaining({name: "c.txt"})]);
    // Focus moves to the next file's remove button, so keyboard users are not dropped on the page.
    await expect(canvas.getByRole("button", {name: "Remove c.txt"})).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(names(canvas)).toEqual(["a.txt"]);
    await expect(canvas.getByRole("button", {name: "Remove a.txt"})).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(names(canvas)).toEqual([]);
    await expect(inputFileNames(canvasElement)).toEqual([]);
    await expect(fileInput(canvasElement)).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: {disabled: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(fileInput(canvasElement)).toBeDisabled();
    await userEvent.tab();
    await expect(fileInput(canvasElement)).not.toHaveFocus();
    await expect(canvasElement.querySelector(".vl-fileupload")).toHaveAttribute("data-disabled");
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
  },
};

export const KeyboardFocus: Story = {
  play: async ({canvasElement}) => {
    // The hidden input is the tab stop, and the browse button shows its focus ring.
    await userEvent.tab();
    await expect(fileInput(canvasElement)).toHaveFocus();
    await expect(fileInput(canvasElement).matches(":focus-visible")).toBe(true);
    const button = canvasElement.querySelector(".vl-fileupload__button") as HTMLElement;
    await expect(getComputedStyle(button).outlineStyle).toBe("solid");
  },
};

function FormHarness({uploadProps}: {uploadProps: FileUploadProps}) {
  const [result, setResult] = useState("");
  return (
    <form
      aria-label="Application"
      onSubmit={event => {
        event.preventDefault();
        setResult(JSON.stringify((new FormData(event.currentTarget).getAll("docs") as File[]).filter(f => f.name).map(f => f.name)));
      }}
    >
      <FileUpload {...uploadProps} name="docs" />
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
      <output>{result}</output>
    </form>
  );
}

// What is shown is what is submitted: accepted files are in the FormData, removed and rejected ones are not.
export const FormData_: Story = {
  name: "FormData",
  render: args => <FormHarness uploadProps={{...args, multiple: true, accept: ".txt"}} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const result = () => canvasElement.querySelector("output")!;
    choose(fileInput(canvasElement), [file("a.txt", "text/plain"), file("b.txt", "text/plain"), file("x.png", "image/png")]);
    await waitFor(() => expect(names(canvas)).toEqual(["a.txt", "b.txt"]));
    await userEvent.click(canvas.getByRole("button", {name: "Send"}));
    await expect(result()).toHaveTextContent('["a.txt","b.txt"]');
    await userEvent.click(canvas.getByRole("button", {name: "Remove a.txt"}));
    await userEvent.click(canvas.getByRole("button", {name: "Send"}));
    await expect(result()).toHaveTextContent('["b.txt"]');
    // Form reset clears the list and the input.
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await waitFor(() => expect(names(canvas)).toEqual([]));
    await expect(inputFileNames(canvasElement)).toEqual([]);
  },
};

export const RequiredBlocksSubmit: Story = {
  render: args => <FormHarness uploadProps={{...args, required: true}} />,
  play: async ({canvasElement}) => {
    const form = canvasElement.querySelector("form") as HTMLFormElement;
    await expect(fileInput(canvasElement)).toBeRequired();
    await expect(form.checkValidity()).toBe(false);
    choose(fileInput(canvasElement), [file("a.txt", "text/plain")]);
    await waitFor(() => expect(form.checkValidity()).toBe(true));
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Remove a.txt"}));
    await expect(form.checkValidity()).toBe(false);
  },
};

export const CustomLabel: Story = {
  args: {label: "Add attachment", multiple: true},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByLabelText("Add attachment")).toBe(fileInput(canvasElement));
  },
};

export const LongFileName: Story = {
  decorators: [Story => <div style={{width: 240}}><Story /></div>],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    choose(fileInput(canvasElement), [file("an-extremely-long-file-name-that-should-wrap-inside-the-narrow-container-without-overflow.txt", "text/plain", 123456)]);
    await waitFor(() => expect(names(canvas)).toHaveLength(1));
    const root = canvasElement.querySelector(".vl-fileupload") as HTMLElement;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
  },
};

// The rules are pure, so they are asserted directly.
export const Rules: Story = {
  render: () => <span>File rules</span>,
  play: async () => {
    await expect(matchesAccept({name: "a.PNG", type: ""}, ".png")).toBe(true);
    await expect(matchesAccept({name: "a.png", type: "image/png"}, "image/*")).toBe(true);
    await expect(matchesAccept({name: "a.png", type: "image/png"}, "image/jpeg, .pdf")).toBe(false);
    await expect(matchesAccept({name: "a.pdf", type: "application/pdf"}, "image/jpeg, .pdf")).toBe(true);
    await expect(matchesAccept({name: "a.anything", type: ""}, undefined)).toBe(true);
    await expect(matchesAccept({name: "a.anything", type: ""}, "  ")).toBe(true);
    await expect(formatBytes(0)).toBe("0 B");
    await expect(formatBytes(1023)).toBe("1023 B");
    await expect(formatBytes(1024)).toBe("1 KB");
    await expect(formatBytes(1536)).toBe("1.5 KB");
    await expect(formatBytes(2 * 1024 * 1024)).toBe("2 MB");
    await expect(formatBytes(25 * 1024 * 1024)).toBe("25 MB");
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  args: {multiple: true, accept: ".txt", maxSize: 1024},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    choose(fileInput(canvasElement), [file("a.txt", "text/plain", 300), file("b.png", "image/png")]);
    await waitFor(() => expect(names(canvas)).toEqual(["a.txt"]));
    await expect(canvas.getByText("b.png: file type is not accepted")).toBeVisible();
  },
};
