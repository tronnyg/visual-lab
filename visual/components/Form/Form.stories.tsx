import {useState} from "react";
import type {ReactNode} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {Form} from "./Form";
import {Field} from "../Field/Field";
import {FormGroup} from "../FormGroup/FormGroup";
import {Input} from "../Input/Input";
import {Textarea} from "../Textarea/Textarea";
import {Select} from "../Select/Select";
import {Checkbox} from "../Checkbox/Checkbox";
import {RadioGroup} from "../RadioGroup/RadioGroup";
import {Switch} from "../Switch/Switch";
import {DatePicker} from "../DatePicker/DatePicker";
import {Combobox} from "../Combobox/Combobox";
import {FileUpload} from "../FileUpload/FileUpload";
import {Button} from "../Button/Button";
import {Stack} from "../Stack/Stack";
import {Grid} from "../Grid/Grid";

const meta = {
  title: "Components/Form",
  component: Form,
  decorators: [Story => <div style={{width: 420}}><Story /></div>],
  args: {children: null, "aria-label": "Contact us", onSubmit: fn(), onReset: fn()},
  argTypes: {
    noValidate: {control: "boolean"},
    disabled: {control: "boolean"},
    onSubmit: {control: false},
    onReset: {control: false},
    children: {control: false},
    ref: {control: false},
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

const entries = (values: FormData) => Array.from(values.entries()).map(([key, value]) => [key, value instanceof File ? value.name : value]);

function ContactFields({requiredName = true, nameError}: {requiredName?: boolean; nameError?: string}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <Stack gap="md">
      <Field label="Name" required={requiredName} error={nameError}><Input name="name" value={name} onChange={event => setName(event.target.value)} aria-label="Name" /></Field>
      <Field label="Email" description="We reply within two days."><Input name="email" value={email} onChange={event => setEmail(event.target.value)} aria-label="Email" /></Field>
      <Stack gap="sm" direction="horizontal">
        <Button type="submit">Send</Button>
        <Button type="reset" variant="outline">Reset</Button>
      </Stack>
    </Stack>
  );
}

const renderWith = (children: ReactNode) => (args: Parameters<typeof Form>[0]) => <Form {...args}>{children}</Form>;

export const SimpleForm: Story = {
  render: renderWith(<ContactFields />),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("form", {name: "Contact us"})).toBeVisible();
    await userEvent.type(canvas.getByRole("textbox", {name: "Name"}), "Ada");
    await userEvent.type(canvas.getByRole("textbox", {name: "Email"}), "ada@example.com");
    await userEvent.click(canvas.getByRole("button", {name: "Send"}));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const [values, event] = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0];
    await expect(entries(values)).toEqual([["name", "Ada"], ["email", "ada@example.com"]]);
    // The event is cancelled: submitting never navigates the page.
    await expect(event.defaultPrevented).toBe(true);
  },
};

export const EnterSubmits: Story = {
  render: renderWith(<ContactFields />),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", {name: "Name"}), "Ada{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(entries((args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0])).toEqual([["name", "Ada"], ["email", ""]]);
  },
};

// Native constraint validation runs first: an empty required field stops the submit and onSubmit is not called.
export const RequiredValidation: Story = {
  render: renderWith(<ContactFields />),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", {name: "Name"}) as HTMLInputElement;
    await expect(name).toBeRequired();
    await userEvent.click(canvas.getByRole("button", {name: "Send"}));
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(name.validity.valueMissing).toBe(true);
    await expect(name).toBeInvalid();
    await expect(name).toHaveFocus();
    await userEvent.type(name, "Ada");
    await userEvent.click(canvas.getByRole("button", {name: "Send"}));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const NoValidateSubmitsInvalidForm: Story = {
  args: {noValidate: true},
  render: renderWith(<ContactFields />),
  play: async ({canvasElement, args}) => {
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Send"}));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

function ResettableFields({onReset}: {onReset?: () => void}) {
  return (
    <Form aria-label="Preferences" onReset={onReset} onSubmit={() => {}}>
      <Stack gap="md">
        <Switch name="notify" label="Notify me" defaultChecked />
        <DatePicker name="date" label="Date" defaultValue="2026-03-15" />
        <Combobox name="owner" label="Owner" defaultValue="ada" options={[{value: "ada", label: "Ada"}, {value: "grace", label: "Grace"}]} />
        <Button type="reset" variant="outline">Reset</Button>
      </Stack>
    </Form>
  );
}

export const ResetRestoresDefaults: Story = {
  render: args => <ResettableFields onReset={args.onReset as () => void} />,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("switch"));
    await userEvent.clear(canvas.getByRole("textbox", {name: "Date"}));
    await userEvent.click(canvas.getByRole("combobox", {name: "Owner"}));
    await userEvent.click(canvas.getByRole("option", {name: "Grace"}));
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await expect(args.onReset).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(canvas.getByRole("switch")).toBeChecked());
    await waitFor(() => expect(canvas.getByRole("textbox", {name: "Date"})).toHaveValue("2026-03-15"));
    await waitFor(() => expect(canvas.getByRole("combobox", {name: "Owner"})).toHaveValue("Ada"));
  },
};

// Every kind of control, in nested layout, collected by the browser into one FormData.
function EverythingForm({onSubmit}: {onSubmit: (values: FormData) => void}) {
  const [name, setName] = useState("Ada");
  const [bio, setBio] = useState("Mathematician");
  const [country, setCountry] = useState("ca");
  const [plan, setPlan] = useState("team");
  const [agree, setAgree] = useState(true);
  return (
    <Form aria-label="Profile" onSubmit={onSubmit}>
      <Stack gap="md">
        <Grid columns={2} gap="md">
          <Field label="Name"><Input name="name" value={name} onChange={event => setName(event.target.value)} aria-label="Name" /></Field>
          <Field label="Country"><Select name="country" aria-label="Country" value={country} onValueChange={setCountry} options={[{label: "Canada", value: "ca"}, {label: "Chile", value: "cl"}]} /></Field>
        </Grid>
        <Field label="Bio"><Textarea name="bio" value={bio} onChange={event => setBio(event.target.value)} aria-label="Bio" /></Field>
        <Field label="Birthday"><DatePicker name="birthday" aria-label="Birthday" defaultValue="1815-12-10" /></Field>
        <Field label="Owner"><Combobox name="owner" aria-label="Owner" defaultValue="grace" options={[{value: "ada", label: "Ada"}, {value: "grace", label: "Grace"}]} /></Field>
        <Field label="Notifications"><Switch name="notify" value="yes" label="Email me" defaultChecked /></Field>
        <FormGroup legend="Plan"><RadioGroup name="plan" label="Plan" value={plan} onValueChange={setPlan} options={[{label: "Team", value: "team"}, {label: "Solo", value: "solo"}]} /></FormGroup>
        <Checkbox name="agree" label="I agree" checked={agree} onCheckedChange={setAgree} />
        <Field label="Résumé"><FileUpload name="resume" /></Field>
        <Button type="submit">Save</Button>
      </Stack>
    </Form>
  );
}

export const MultipleFieldTypesFormData: Story = {
  render: args => <EverythingForm onSubmit={args.onSubmit as (values: FormData) => void} />,
  decorators: [Story => <div style={{width: 560}}><Story /></div>],
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    const transfer = new DataTransfer();
    transfer.items.add(new File(["x"], "cv.pdf", {type: "application/pdf"}));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", {bubbles: true}));
    await waitFor(() => expect(canvas.getByText("cv.pdf")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", {name: "Save"}));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(entries((args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0])).toEqual([
      ["name", "Ada"], ["country", "ca"], ["bio", "Mathematician"], ["birthday", "1815-12-10"], ["owner", "grace"], ["notify", "yes"], ["plan", "team"], ["agree", "on"], ["resume", "cv.pdf"],
    ]);
  },
};

// The submitter is part of the FormData, so a named button can say which action was chosen.
export const SubmitterIsIncluded: Story = {
  render: args => (
    <Form aria-label="Review" onSubmit={args.onSubmit}>
      <Stack gap="sm" direction="horizontal">
        <Button type="submit" name="intent" value="approve">Approve</Button>
        <Button type="submit" name="intent" value="reject" variant="outline">Reject</Button>
      </Stack>
    </Form>
  ),
  play: async ({canvasElement, args}) => {
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Reject"}));
    await expect(entries((args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0])).toEqual([["intent", "reject"]]);
  },
};

export const DisabledForm: Story = {
  args: {disabled: true},
  render: renderWith(<ContactFields />),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", {name: "Name"})).toBeDisabled();
    await expect(canvas.getByRole("button", {name: "Send"})).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", {name: "Send"}));
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const FieldErrors: Story = {
  render: renderWith(<ContactFields nameError="Enter your name" />),
  play: async ({canvasElement}) => {
    const name = within(canvasElement).getByRole("textbox", {name: "Name"});
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription("Error: Enter your name");
  },
};

export const SubmissionFeedbackSuppliedByConsumer: Story = {
  render: () => {
    function Feedback() {
      const [status, setStatus] = useState("");
      return (
        <Form aria-label="Newsletter" onSubmit={values => setStatus(`Subscribed ${values.get("email")}`)}>
          <Stack gap="md">
            <Field label="Email" required><Input name="email" value="ada@example.com" onChange={() => {}} aria-label="Email" /></Field>
            <Button type="submit">Subscribe</Button>
            <p role="status">{status}</p>
          </Stack>
        </Form>
      );
    }
    return <Feedback />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Subscribe"}));
    await expect(await canvas.findByText("Subscribed ada@example.com")).toBeVisible();
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  render: renderWith(<ContactFields nameError="Enter your name" />),
};
