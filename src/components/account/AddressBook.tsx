"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { type AddressState, deleteAddress, makeDefaultAddress, saveAddress } from "@/app/(shop)/account/actions";
import type { Address } from "@/lib/account";
import { Field, describedBy, inputClass } from "../form";
import { Icon, panel } from "./parts";

const provinces = ["Ontario", "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia",
  "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories", "Nunavut", "Yukon"];

const blank: Address = {
  _key: "", label: "", name: "", phone: "", line1: "", line2: "", city: "", region: "Ontario", postalCode: "", country: "Canada", isDefault: false,
};

// Saved delivery addresses: add, edit, delete and pick a default.
export function AddressBook({ initial, max }: { initial: Address[]; max: number }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<Address | null>(null);
  const [flash, setFlash] = useState("");
  const [busy, start] = useTransition();

  const update = (next: Address[] | null, message: string) => {
    if (next) setAddresses(next);
    setFlash(next ? message : "Please log in again.");
  };

  return (
    <div className="space-y-6">
      <p role="status" aria-live="polite" className={flash ? "rounded-2xl border-2 border-ink bg-teal-soft px-4 py-3 font-bold" : "sr-only"}>
        {flash}
      </p>

      {editing ? (
        <AddressForm
          key={editing._key || "new"}
          address={editing}
          isFirst={addresses.length === 0}
          onCancel={() => setEditing(null)}
          onSaved={(next) => {
            setAddresses(next);
            setEditing(null);
            setFlash("Address saved.");
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <article key={a._key} className={`${panel} flex flex-col p-5 ${a.isDefault ? "ring-4 ring-orange-soft" : ""}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-extrabold">{a.label || "Address"}</p>
                {a.isDefault && (
                  <span className="rounded-full border-2 border-ink bg-orange px-2.5 py-0.5 text-xs font-extrabold">Default</span>
                )}
              </div>
              <address className="flex-1 leading-relaxed font-medium not-italic text-ink-soft">
                <span className="font-bold text-ink">{a.name}</span>
                <br />
                {a.line1}
                {a.line2 && (
                  <>
                    <br />
                    {a.line2}
                  </>
                )}
                <br />
                {a.city}, {a.region} {a.postalCode}
                <br />
                {a.country}
                {a.phone && (
                  <>
                    <br />
                    {a.phone}
                  </>
                )}
              </address>
              <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-line pt-4">
                <SmallButton onClick={() => { setFlash(""); setEditing(a); }} icon="edit">Edit</SmallButton>
                {!a.isDefault && (
                  <SmallButton disabled={busy} icon="star" onClick={() => start(async () => update(await makeDefaultAddress(a._key), "Default address updated."))}>
                    Make default
                  </SmallButton>
                )}
                <SmallButton
                  disabled={busy}
                  icon="trash"
                  onClick={() => {
                    if (confirm(`Delete the address “${a.label || a.line1}”?`)) start(async () => update(await deleteAddress(a._key), "Address deleted."));
                  }}
                >
                  Delete
                </SmallButton>
              </div>
            </article>
          ))}

          {addresses.length < max && (
            <button
              type="button"
              onClick={() => { setFlash(""); setEditing({ ...blank }); }}
              className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-[3px] border-dashed border-ink/30 bg-white/60 p-6 font-extrabold transition hover:border-ink hover:bg-white"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink bg-teal-soft">
                <Icon name="plus" />
              </span>
              Add a new address
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SmallButton({ icon, children, ...props }: React.ComponentProps<"button"> & { icon: "edit" | "star" | "trash" }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-ink/20 bg-white px-3.5 text-sm font-bold transition hover:border-ink disabled:opacity-50"
      {...props}
    >
      <Icon name={icon} className="h-4 w-4" />
      {children}
    </button>
  );
}

function AddressForm({ address, isFirst, onCancel, onSaved }: { address: Address; isFirst: boolean; onCancel: () => void; onSaved: (a: Address[]) => void }) {
  const [state, action, pending] = useActionState<AddressState, FormData>(saveAddress, { status: "idle" });
  const first = useRef<HTMLInputElement>(null);
  const e = state.errors ?? {};

  useEffect(() => first.current?.focus(), []);
  useEffect(() => {
    if (state.status === "saved" && state.addresses) onSaved(state.addresses);
  }, [state, onSaved]);

  const input = (name: keyof Address, label: string, opts: { required?: boolean; hint?: string; autoComplete?: string; list?: string; type?: string } = {}) => {
    const id = `addr-${name}`;
    return (
      <Field id={id} label={label} required={opts.required} hint={opts.hint} error={e[name]}>
        <input
          ref={name === "label" ? first : undefined}
          id={id}
          name={name}
          type={opts.type ?? "text"}
          defaultValue={String(address[name] ?? "")}
          required={opts.required}
          autoComplete={opts.autoComplete}
          list={opts.list}
          aria-invalid={e[name] ? true : undefined}
          aria-describedby={describedBy(id, { hint: opts.hint, error: e[name] })}
          className={inputClass}
        />
      </Field>
    );
  };

  return (
    <form action={action} noValidate className={`${panel} space-y-5 p-5 sm:p-7`}>
      <h2 className="text-2xl sm:text-3xl">{address._key ? "Edit address" : "New address"}</h2>
      <input type="hidden" name="_key" value={address._key} />
      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-pink-soft px-4 py-3 font-bold text-pink-deep">{state.message}</p>
      )}
      {state.status === "invalid" && (
        <p role="alert" className="rounded-xl bg-pink-soft px-4 py-3 font-bold text-pink-deep">Please check the highlighted fields.</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {input("label", "Nickname", { hint: "For example Home, Work or Grandma’s." })}
        {input("name", "Full name", { required: true, autoComplete: "name" })}
        <div className="sm:col-span-2">{input("line1", "Street address", { required: true, autoComplete: "address-line1" })}</div>
        <div className="sm:col-span-2">{input("line2", "Apartment, unit or buzzer", { autoComplete: "address-line2" })}</div>
        {input("city", "City or town", { required: true, autoComplete: "address-level2" })}
        {input("region", "Province or state", { required: true, autoComplete: "address-level1", list: "provinces" })}
        {input("postalCode", "Postal code", { required: true, autoComplete: "postal-code" })}
        {input("country", "Country", { required: true, autoComplete: "country-name" })}
        {input("phone", "Phone", { autoComplete: "tel", type: "tel", hint: "Handy for delivery questions." })}
      </div>
      <datalist id="provinces">
        {provinces.map((p) => <option key={p} value={p} />)}
      </datalist>
      <label className="flex items-center gap-3 font-semibold">
        <input type="checkbox" name="isDefault" defaultChecked={address.isDefault || isFirst} className="h-5 w-5 accent-[var(--color-orange)]" />
        Use as my default address
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center rounded-full border-[3px] border-ink bg-orange px-6 font-extrabold shadow-[var(--shadow-pop)] transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save address"}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center rounded-full border-2 border-ink bg-white px-6 font-bold hover:bg-pink-soft">
          Cancel
        </button>
      </div>
    </form>
  );
}
