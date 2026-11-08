"use client";

import React, { useId, useRef, useState } from "react";
import {
  IconDocument,
  IconUploadCloud,
  IconXMarkCircle,
} from "./icons";


export interface SelectOption {
  /** Value transmitted when selected. */
  value: string;
  /** Human-readable option label. */
  label: string;
}

export interface SelectProps {
  /** HTML ID attribute linking label and select input. */
  id?: string;
  /** Required persistent field label. */
  label: string;
  /** List of options to populate dropdown. */
  options: SelectOption[];
  /** Currently selected value. */
  value: string;
  /** Change callback when selection changes. */
  onChange: (value: string) => void;
  /** Explanatory helper text displayed below select input. */
  helperText?: string;
  /** Additional CSS class names. */
  className?: string;
}

export function Select({
  id,
  label,
  options,
  value,
  onChange,
  helperText,
  className = "",
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? `select-${autoId}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={selectId}
        className="block text-xs font-bold text-base-content"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-bordered w-full rounded-2xl bg-base-100 border-base-content/25 text-base-content text-sm font-semibold pst-press"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p
          className="text-xs font-medium"
          style={{ color: "var(--label-secondary)" }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}


export interface FieldSetProps {
  /** Required legend title for the field grouping. */
  legend: string;
  /** Explanatory helper text beneath legend. */
  description?: string;
  /** Form fields contained within fieldset. */
  children: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

export function FieldSet({
  legend,
  description,
  children,
  className = "",
}: FieldSetProps) {
  return (
    <fieldset
      className={`fieldset material-regular rounded-2xl p-4 shadow-xs space-y-3.5 ${className}`}
    >
      <legend className="fieldset-legend text-sm font-bold text-base-content px-2">
        {legend}
      </legend>
      <div className="space-y-3.5">{children}</div>
      {description && (
        <p
          className="label text-xs font-medium"
          style={{ color: "var(--label-secondary)" }}
        >
          {description}
        </p>
      )}
    </fieldset>
  );
}

// Backward-compatible alias
export const Fieldset = FieldSet;
export type FieldsetProps = FieldSetProps;


export interface UploadedFileInfo {
  /** Unique file identifier. */
  id: string;
  /** File display name. */
  name: string;
  /** File size in bytes. */
  sizeBytes: number;
}

export interface FileUploadProps {
  /** Required field label for the file upload zone. */
  label: string;
  /** Accepted file extensions or MIME types (e.g. '.png,.jpg,.pdf'). */
  accept?: string;
  /** Whether multiple file selection is enabled. */
  multiple?: boolean;
  /** Callback fired when files are added or removed. */
  onFilesChange?: (files: UploadedFileInfo[]) => void;
  /** Custom EmptyState or fallback node when no files have been selected. */
  emptyState?: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

export function FileUpload({
  label,
  accept = "image/*,.pdf,.fig,.zip",
  multiple = true,
  onFilesChange,
  emptyState,
  className = "",
}: FileUploadProps) {
  const autoId = useId();
  const inputId = `file-upload-${autoId}`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<UploadedFileInfo[]>([]);

  const appendFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const added: UploadedFileInfo[] = Array.from(fileList).map((f, idx) => ({
      id: `${Date.now()}-${idx}-${f.name}`,
      name: f.name,
      sizeBytes: f.size,
    }));
    setFiles((prev) => {
      const next = multiple ? [...prev, ...added] : added.slice(0, 1);
      onFilesChange?.(next);
      return next;
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      onFilesChange?.(next);
      return next;
    });
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-xs font-bold text-base-content"
      >
        {label}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          appendFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-300 ease-out ${
          isDragging
            ? "border-primary bg-primary/12"
            : "border-base-content/25 material-regular"
        }`}
      >
        <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-accent-primary">
          <IconUploadCloud className="w-6 h-6" />
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => appendFiles(e.target.files)}
          className="file-input file-input-bordered file-input-sm pst-press w-full max-w-xs rounded-xl mb-3 border-base-content/25"
        />
        <p className="text-xs font-semibold text-base-content flex flex-wrap items-center justify-center gap-1">
          <span>파일을 이곳으로 끌어다 놓거나</span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn btn-ghost btn-xs rounded-xl pst-press text-accent-primary font-bold px-2"
          >
            파일 찾아보기…
          </button>
        </p>
        <p
          className="text-xs font-medium mt-1"
          style={{ color: "var(--label-secondary)" }}
        >
          지원 형식: {accept}
        </p>
      </div>

      {files.length > 0 ? (
        <ul className="space-y-1.5">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-xl material-regular px-3.5 py-2 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-accent-primary">
                  <IconDocument className="w-4 h-4" />
                </span>
                <span className="font-semibold text-base-content truncate">
                  {file.name}
                </span>
                <span
                  className="font-medium shrink-0"
                  style={{ color: "var(--label-secondary)" }}
                >
                  ({(file.sizeBytes / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                aria-label={`${file.name} 첨부 제거`}
                style={{ color: "var(--label-secondary)" }}
                className="btn btn-ghost btn-circle btn-xs pst-press hover:text-base-content"
              >
                <IconXMarkCircle className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        emptyState && <div className="pt-2">{emptyState}</div>
      )}
    </div>
  );
}


export interface FilterProps {
  /** Filter grouping identifier for radio inputs. */
  name?: string;
  /** Available filter pill options. */
  options: string[];
  /** Currently selected filter option (or null if none/reset). */
  selected: string | null;
  /** Selection change callback. */
  onChange: (selected: string | null) => void;
  /** Additional CSS class names. */
  className?: string;
}

export function Filter({
  name,
  options,
  selected,
  onChange,
  className = "",
}: FilterProps) {
  const autoName = useId();
  const groupName = name ?? `filter-${autoName}`;

  return (
    <div
      role="group"
      aria-label="카테고리 필터"
      className={`filter flex flex-wrap items-center gap-1.5 ${className}`}
    >
      <input
        className="btn btn-sm filter-reset rounded-xl pst-press bg-base-100 text-base-content border border-base-content/25 font-bold"
        type="radio"
        name={groupName}
        aria-label="×"
        checked={selected === null}
        onChange={() => onChange(null)}
      />
      {options.map((opt) => (
        <input
          key={opt}
          className={`btn btn-sm rounded-xl pst-press font-semibold border ${
            selected === opt
              ? "bg-primary text-primary-content border-primary shadow-xs"
              : "bg-base-100 text-base-content border-base-content/25 hover:bg-base-200"
          }`}
          type="radio"
          name={groupName}
          aria-label={opt}
          checked={selected === opt}
          onChange={() => onChange(opt)}
        />
      ))}
    </div>
  );
}


export interface RatingProps {
  /** Current star rating value (0 to max). */
  value: number;
  /** Maximum number of stars (defaults to 5). */
  max?: number;
  /** Callback fired when a rating star is selected. */
  onChange?: (value: number) => void;
  /** Whether rating is read-only (displays formatted score). */
  readOnly?: boolean;
  /** Size variant for rating stars. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Additional CSS class names. */
  className?: string;
}

export function Rating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = "md",
  className = "",
}: RatingProps) {
  const autoName = useId();
  const groupName = `rating-${autoName}`;
  const sizeClass =
    size === "xs"
      ? "rating-xs"
      : size === "sm"
      ? "rating-sm"
      : size === "lg"
      ? "rating-lg"
      : "rating-md";

  if (readOnly) {
    return (
      <div
        className={`rating ${sizeClass} items-center gap-1 ${className}`}
        aria-label={`평점 ${max}점 만점에 ${value}점`}
      >
        {Array.from({ length: max }, (_, idx) => {
          const starVal = idx + 1;
          return (
            <div
              key={starVal}
              aria-label={`${starVal}점`}
              aria-current={starVal === value ? "true" : undefined}
              className="mask mask-star-2 w-6 h-6"
              style={{
                backgroundColor:
                  starVal <= value
                    ? "var(--rating-star-color)"
                    : "var(--fill-primary)",
              }}
            />
          );
        })}
        <span className="ms-2 text-xs font-bold text-base-content">
          {value}.0 / {max}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`rating ${sizeClass} gap-1 items-center`}>
        <input
          type="radio"
          name={groupName}
          className="rating-hidden"
          checked={value === 0}
          onChange={() => onChange?.(0)}
          aria-label="별점 초기화"
        />
        {Array.from({ length: max }, (_, idx) => {
          const starVal = idx + 1;
          return (
            <input
              key={starVal}
              type="radio"
              name={groupName}
              aria-label={`${starVal}점 선택`}
              checked={value === starVal}
              onChange={() => onChange?.(starVal)}
              className="mask mask-star-2 cursor-pointer pst-press"
              style={{ backgroundColor: "var(--rating-star-color)" }}
            />
          );
        })}
      </div>
      <span className="text-xs font-bold text-base-content">
        {value > 0 ? `${value}점 선택됨` : "미선택"}
      </span>
    </div>
  );
}


export interface SwapProps {
  /** Whether the swap toggle is active (showing onElement). */
  active: boolean;
  /** Toggle callback fired on click. */
  onToggle: (active: boolean) => void;
  /** Node rendered in active state. */
  onElement: React.ReactNode;
  /** Node rendered in inactive state. */
  offElement: React.ReactNode;
  /** Visual animation effect ('rotate' or 'flip'). */
  effect?: "rotate" | "flip";
  /** Accessible label describing toggle action. */
  ariaLabel?: string;
  /** Additional CSS class names. */
  className?: string;
}

export function Swap({
  active,
  onToggle,
  onElement,
  offElement,
  effect = "rotate",
  ariaLabel = "상태 전환 스왚",
  className = "",
}: SwapProps) {
  const effectClass = effect === "flip" ? "swap-flip" : "swap-rotate";

  return (
    <label
      aria-label={ariaLabel}
      className={`swap ${effectClass} ${
        active ? "swap-active" : ""
      } btn btn-ghost rounded-2xl border border-base-content/25 bg-base-100/80 pst-press px-3.5 ${className}`}
    >
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <div className="swap-on flex items-center gap-2 text-accent-primary font-bold">
        {onElement}
      </div>
      <div className="swap-off flex items-center gap-2 text-base-content font-semibold">
        {offElement}
      </div>
    </label>
  );
}
