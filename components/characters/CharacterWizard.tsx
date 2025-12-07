"use client";

import { useMemo, useState } from "react";

type WizardState = {
  system: string;
  concept: string;
  identity: {
    name: string;
    species: string;
    classRole: string;
    level: number | undefined;
    pronouns: string;
    portraitUrl: string;
    background: string;
    faction: string;
  };
  attributes: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  combat: {
    maxHp?: number;
    armorClass?: number;
    speed?: number;
  };
  primaryAttack: {
    name: string;
    bonus: string;
    damage: string;
  };
  inventory: {
    startingPack: string;
  };
  story: {
    goal: string;
    fear: string;
    bond: string;
    secret: string;
    rumor: string;
  };
};

const steps = [
  "System & Concept",
  "Identity",
  "Attributes & Combat",
  "Attack & Gear",
  "Story & Summary",
];

type WizardProps = {
  createCharacterAction: (formData: FormData) => Promise<void>;
  campaignId?: string;
};

export function CharacterWizard({ createCharacterAction, campaignId }: WizardProps) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    system: "dnd5e",
    concept: "",
    identity: {
      name: "",
      species: "",
      classRole: "",
      level: 1,
      pronouns: "",
      portraitUrl: "",
      background: "",
      faction: "",
    },
    attributes: {},
    combat: {},
    primaryAttack: {
      name: "",
      bonus: "",
      damage: "",
    },
    inventory: {
      startingPack: "",
    },
    story: {
      goal: "",
      fear: "",
      bond: "",
      secret: "",
      rumor: "",
    },
  });

  const handleChange = (path: string[], value: string | number | undefined) => {
    setState((prev) => {
      const next: any = structuredClone(prev);
      let cursor = next;
      for (let i = 0; i < path.length - 1; i++) {
        cursor = cursor[path[i]];
      }
      cursor[path[path.length - 1]] = value;
      return next;
    });
  };

  const nextStep = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const stepIndicator = (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center border ${
              idx === step
                ? "bg-amber-600 text-black border-amber-400"
                : idx < step
                ? "bg-amber-800 text-amber-100 border-amber-600"
                : "bg-transparent text-amber-400 border-amber-700/70"
            }`}
          >
            {idx + 1}
          </div>
          <span
            className={`hidden sm:inline ${
              idx === step ? "text-amber-100" : "text-amber-400/80"
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );

  const summary = useMemo(
    () => ({
      system: state.system,
      concept: state.concept,
      identity: state.identity,
      attributes: state.attributes,
      combat: state.combat,
      primaryAttack: state.primaryAttack,
      inventory: state.inventory,
      story: state.story,
    }),
    [state]
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs opacity-80">System</label>
              <input
                className="px-3 py-2 rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                value={state.system}
                onChange={(e) => handleChange(["system"], e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs opacity-80">Concept</label>
              <input
                className="px-3 py-2 rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                value={state.concept}
                onChange={(e) => handleChange(["concept"], e.target.value)}
                placeholder="Haunted sailor turned warlock"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Name"
              value={state.identity.name}
              onChange={(v) => handleChange(["identity", "name"], v)}
              required
            />
            <Field
              label="Species"
              value={state.identity.species}
              onChange={(v) => handleChange(["identity", "species"], v)}
            />
            <Field
              label="Class / Role"
              value={state.identity.classRole}
              onChange={(v) => handleChange(["identity", "classRole"], v)}
            />
            <NumberField
              label="Level"
              value={state.identity.level}
              onChange={(v) => handleChange(["identity", "level"], v)}
            />
            <Field
              label="Pronouns"
              value={state.identity.pronouns}
              onChange={(v) => handleChange(["identity", "pronouns"], v)}
            />
            <Field
              label="Portrait URL"
              value={state.identity.portraitUrl}
              onChange={(v) => handleChange(["identity", "portraitUrl"], v)}
              placeholder="https://..."
            />
            <Field
              label="Background"
              value={state.identity.background}
              onChange={(v) => handleChange(["identity", "background"], v)}
            />
            <Field
              label="Faction"
              value={state.identity.faction}
              onChange={(v) => handleChange(["identity", "faction"], v)}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(["str", "dex", "con", "int", "wis", "cha"] as const).map((attr) => (
                <NumberField
                  key={attr}
                  label={attr.toUpperCase()}
                  value={state.attributes[attr]}
                  onChange={(v) => handleChange(["attributes", attr], v)}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumberField
                label="Max HP"
                value={state.combat.maxHp}
                onChange={(v) => handleChange(["combat", "maxHp"], v)}
              />
              <NumberField
                label="Armor Class"
                value={state.combat.armorClass}
                onChange={(v) => handleChange(["combat", "armorClass"], v)}
              />
              <NumberField
                label="Speed"
                value={state.combat.speed}
                onChange={(v) => handleChange(["combat", "speed"], v)}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs opacity-80">Primary Attack</label>
              <input
                className="px-3 py-2 rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                value={state.primaryAttack.name}
                onChange={(e) => handleChange(["primaryAttack", "name"], e.target.value)}
                placeholder="Longsword"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Attack Bonus"
                value={state.primaryAttack.bonus}
                onChange={(v) => handleChange(["primaryAttack", "bonus"], v)}
                placeholder="+5"
              />
              <Field
                label="Damage"
                value={state.primaryAttack.damage}
                onChange={(v) => handleChange(["primaryAttack", "damage"], v)}
                placeholder="1d8+3 slashing"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs opacity-80">Starting Gear Pack</label>
              <input
                className="px-3 py-2 rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                value={state.inventory.startingPack}
                onChange={(e) => handleChange(["inventory", "startingPack"], e.target.value)}
                placeholder="Explorer's Pack"
              />
            </div>
          </div>
        );
      case 4:
      default:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Goal"
                value={state.story.goal}
                onChange={(v) => handleChange(["story", "goal"], v)}
              />
              <Field
                label="Fear"
                value={state.story.fear}
                onChange={(v) => handleChange(["story", "fear"], v)}
              />
              <Field
                label="Bond"
                value={state.story.bond}
                onChange={(v) => handleChange(["story", "bond"], v)}
              />
              <Field
                label="Secret"
                value={state.story.secret}
                onChange={(v) => handleChange(["story", "secret"], v)}
              />
              <Field
                label="Rumor"
                value={state.story.rumor}
                onChange={(v) => handleChange(["story", "rumor"], v)}
              />
            </div>
            <div className="border border-amber-700/40 rounded-lg p-3 bg-amber-900/10 text-sm space-y-2">
              <div className="font-semibold text-amber-200">Summary</div>
              <pre className="text-xs whitespace-pre-wrap opacity-80">
                {JSON.stringify(summary, null, 2)}
              </pre>
            </div>
            <form action={createCharacterAction} className="space-y-2">
              <input type="hidden" name="payload" value={JSON.stringify(state)} />
              {campaignId && <input type="hidden" name="campaignId" value={campaignId} />}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 rounded-md border border-amber-700/60 hover:bg-amber-800/60 text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-sm font-semibold text-black"
                >
                  Create Character
                </button>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 border border-amber-700/40 rounded-lg p-4 bg-amber-900/10">
      <div className="flex items-center justify-between">
        {stepIndicator}
        <div className="text-xs opacity-70">
          Step {step + 1} / {steps.length}
        </div>
      </div>
      {renderStep()}
      {step < steps.length - 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="px-4 py-2 rounded-md border border-amber-700/60 hover:bg-amber-800/60 disabled:opacity-50 text-sm"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-sm font-semibold text-black"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs opacity-80">
        {label} {required && <span className="text-amber-300">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="px-3 py-2 rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs opacity-80">{label}</label>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? n : undefined);
        }}
        className="px-3 py-2 rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
      />
    </div>
  );
}
