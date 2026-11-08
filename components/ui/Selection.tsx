"use client";

import React, { useEffect, useId, useRef } from "react";
import { IconCheckCircle, IconMinus, IconPlus } from "./icons";
import { Select } from "./Select";


export interface CheckboxProps {
  /** HTML ID attribute linking label and input. */
  id?: string;
  /** Accessible label text. */
  label: string;
  /** Optional secondary explanatory text. */
  description?: string;
  /** Whether checkbox is currently checked. */
  checked: boolean;
  /** Whether checkbox is in indeterminate (partial) state. */
  indeterminate?: boolean;
  /** Change callback. */
  onChange: (checked: boolean) => void;
  /** Disabled state. */
  disabled?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

export function Checkbox({
  id,
  label,
  description,
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  className = "",
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? `checkbox-${autoId}`;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      htmlFor={inputId}
      className={`pst-press inline-flex items-center gap-3 rounded-xl px-2.5 py-1.5 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-content/8"
      } ${className}`}
    >
      <span className="relative inline-flex items-center justify-center shrink-0">
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="checkbox checkbox-primary rounded-lg border-base-content/30"
        />
        {indeterminate && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-primary-content"
          >
            <IconMinus className="w-3 h-3" />
          </span>
        )}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-base-content">{label}</span>
        {description && (
          <span
            className="text-xs font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            {description}
          </span>
        )}
      </span>
    </label>
  );
}


export interface RadioOption {
  /** Form submission value of the option. */
  value: string;
  /** Primary label text for the radio option. */
  label: string;
  /** Optional secondary subtitle or description. */
  description?: string;
}

export interface RadioProps {
  /** Form name attribute to group radio inputs. */
  name?: string;
  /** Accessible legend title for the radio group. */
  legend: string;
  /** List of mutually exclusive options (auto-promotes to Select when >= 6 items). */
  options: RadioOption[];
  /** Currently selected option value. */
  value: string;
  /** Callback fired when an option is selected. */
  onChange: (value: string) => void;
  /** Additional CSS class names. */
  className?: string;
}

export function Radio({
  name,
  legend,
  options,
  value,
  onChange,
  className = "",
}: RadioProps) {
  const autoName = useId();
  const groupName = name ?? `radio-${autoName}`;

  // pstui Principle (DESIGN.md 7.4 & AGENTS.md 2.2.D):
  // If options >= 6, MUST render as <select> popup instead of Radio buttons!
  if (options.length >= 6) {
    return (
      <Select
        label={legend}
        options={options}
        value={value}
        onChange={onChange}
        helperText="옵션이 6개 이상이므로 휴먼 인터페이스 가이드 규격에 따라 팝업 선택기(Select)로 자동 전환되었습니다."
        className={className}
      />
    );
  }

  return (
    <fieldset className={`fieldset space-y-1.5 ${className}`}>
      <legend className="fieldset-legend text-xs font-bold text-base-content">
        {legend}
      </legend>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const isSelected = opt.value === value;
          const optId = `${groupName}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={`pst-press flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 cursor-pointer border transition-all duration-300 ease-out ${
                isSelected
                  ? "border-primary/50 bg-primary/12 shadow-2xs"
                  : "border-base-content/20 bg-base-100/70 hover:bg-base-content/8"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  id={optId}
                  type="radio"
                  name={groupName}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => onChange(opt.value)}
                  className="radio radio-primary radio-sm border-base-content/30"
                />
                <div>
                  <p className="text-sm font-semibold text-base-content">
                    {opt.label}
                  </p>
                  {opt.description && (
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--label-secondary)" }}
                    >
                      {opt.description}
                    </p>
                  )}
                </div>
              </div>
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary shrink-0"
                >
                  <IconCheckCircle className="w-4 h-4" />
                  <span>선택됨</span>
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}


export interface SwitchProps {
  /** HTML ID attribute linking label and switch. */
  id?: string;
  /** Accessible label text for the toggle switch. */
  label: string;
  /** Whether the switch is currently on (checked). */
  checked: boolean;
  /** Callback fired when switch state changes. */
  onChange: (checked: boolean) => void;
  /** Additional CSS class names. */
  className?: string;
}

export function Switch({
  id,
  label,
  checked,
  onChange,
  className = "",
}: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? `switch-${autoId}`;
  return (
    <label
      htmlFor={switchId}
      className={`pst-press flex items-center justify-between gap-3 cursor-pointer py-1 ${className}`}
    >
      <span className="text-sm font-semibold text-base-content">{label}</span>
      <input
        id={switchId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="toggle toggle-primary"
      />
    </label>
  );
}


export interface SliderProps {
  /** HTML ID attribute linking label and range slider. */
  id?: string;
  /** Accessible field label. */
  label: string;
  /** Current numerical value. */
  value: number;
  /** Minimum slider value (defaults to 0). */
  min?: number;
  /** Maximum slider value (defaults to 100). */
  max?: number;
  /** Step increment (defaults to 1). */
  step?: number;
  /** Measurement unit symbol (e.g. '%', 'px', 'ms'). */
  unit?: string;
  /** Value change callback. */
  onChange: (value: number) => void;
  /** Additional CSS class names. */
  className?: string;
}

export function Slider({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  onChange,
  className = "",
}: SliderProps) {
  const autoId = useId();
  const sliderId = id ?? `slider-${autoId}`;
  const numInputId = `${sliderId}-num`;
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min || 1)) * 100)
  );

  const clampValue = (val: number) => Math.min(max, Math.max(min, val));
  const ticks = [
    min,
    Math.round(min + (max - min) * 0.25),
    Math.round(min + (max - min) * 0.5),
    Math.round(min + (max - min) * 0.75),
    max,
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={sliderId}
          className="text-xs font-bold text-base-content"
        >
          {label}
        </label>
        <span className="text-xs font-bold text-accent-primary">
          {value}
          {unit}
        </span>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px] flex flex-col">
          <div className="relative h-11 flex items-center">
            <input
              id={sliderId}
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(clampValue(Number(e.target.value)))}
              className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 pst-press"
            />
            <div
              className="h-2.5 w-full rounded-full overflow-hidden bg-base-300 border border-base-content/15 pointer-events-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${percentage}%`,
                  background: "var(--gradient-brand)",
                }}
              />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-base-100 border-2 border-primary shadow-sm transition-all duration-150 peer-active:scale-110"
              style={{
                left: `calc(${percentage}% - 10px)`,
              }}
            />
          </div>
          {/* Tick marks (눈금 마크 per DESIGN.md 7.5, minimum 11px font per DESIGN.md 5) */}
          <div
            className="flex justify-between text-[11px] font-semibold px-1 -mt-1"
            style={{ color: "var(--label-secondary)" }}
            aria-hidden="true"
          >
            {ticks.map((t, i) => (
              <span key={`${t}-${i}`} className="flex flex-col items-center">
                <span className="h-1.5 w-px bg-base-content/35 mb-0.5" />
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Companion Number Input + +/- Steppers per DESIGN.md 7.5 & AGENTS.md 2.2.D */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onChange(clampValue(value - step))}
            aria-label={`${label} 감소`}
            className="btn btn-xs btn-square rounded-xl border border-base-content/25 bg-base-100 text-base-content pst-press"
          >
            <IconMinus className="w-3.5 h-3.5" />
          </button>
          <label htmlFor={numInputId} className="sr-only">
            {label} 직접 숫자 입력
          </label>
          <input
            id={numInputId}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              onChange(Number.isNaN(parsed) ? min : clampValue(parsed));
            }}
            className="input input-bordered input-xs w-16 rounded-xl text-center font-bold bg-base-100 border-base-content/25 text-base-content pst-press"
          />
          <button
            type="button"
            onClick={() => onChange(clampValue(value + step))}
            aria-label={`${label} 증가`}
            className="btn btn-xs btn-square rounded-xl border border-base-content/25 bg-base-100 text-base-content pst-press"
          >
            <IconPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
