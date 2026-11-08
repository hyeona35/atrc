"use client";

import React, { useId, useState } from "react";
import {
  IconErrorCircle,
  IconHistory,
  IconPlus,
  IconSearch,
  IconXMarkCircle,
} from "./icons";


export interface TextFieldProps {
  /** HTML ID attribute linking label and input. */
  id?: string;
  /** Mandatory fixed persistent field label. */
  label: string;
  /** Current input text value. */
  value: string;
  /** Text change callback. */
  onChange: (value: string) => void;
  /** HTML input type attribute. */
  type?: "text" | "email" | "password" | "tel" | "number" | "url";
  /** Placeholder hint text. */
  placeholder?: string;
  /** Standard autocomplete token string. */
  autoComplete?: string;
  /** Virtual keyboard input mode hint. */
  inputMode?:
    | "text"
    | "email"
    | "tel"
    | "numeric"
    | "decimal"
    | "search"
    | "url";
  /** Format validation handler executed on blur. */
  validateOnBlur?: (value: string) => string | null;
  /** Real-time rule validation handler executed on change. */
  validateOnChange?: (value: string) => string | null;
  /** Explanatory helper text displayed below input field. */
  helperText?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Accessible text field with mandatory fixed label, instant clear button,
 * and bifurcated validation (onBlur for formats, onChange for rules).
 */
export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  autoComplete,
  inputMode,
  validateOnBlur,
  validateOnChange,
  helperText,
  className = "",
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? `textfield-${autoId}`;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (nextVal: string) => {
    onChange(nextVal);
    if (validateOnChange) {
      setErrorMessage(validateOnChange(nextVal));
    }
  };

  const handleBlur = () => {
    if (validateOnBlur) {
      setErrorMessage(validateOnBlur(value));
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={fieldId}
        className="block text-xs font-bold text-base-content"
      >
        {label}
      </label>
      <div
        className={`input input-bordered w-full rounded-2xl flex items-center gap-2 bg-base-100 border-base-content/25 focus-within:border-primary ${
          errorMessage ? "input-error border-error" : ""
        }`}
      >
        <input
          id={fieldId}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="grow text-sm font-medium text-base-content"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setErrorMessage(null);
            }}
            aria-label={`${label} 입력 내용 지우기`}
            style={{ color: "var(--label-secondary)" }}
            className="btn btn-ghost btn-circle btn-xs pst-press hover:text-base-content"
          >
            <IconXMarkCircle className="w-4 h-4" />
          </button>
        )}
      </div>
      {errorMessage ? (
        <p
          className="text-xs font-semibold text-status-error flex items-center gap-1.5"
          role="alert"
        >
          <IconErrorCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      ) : (
        helperText && (
          <p
            className="text-xs font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            {helperText}
          </p>
        )
      )}
    </div>
  );
}


export interface SearchToken {
  /** Unique search token identifier. */
  id: string;
  /** Categorical scope prefix (e.g. '태그', '상태', '규격'). */
  category: string;
  /** Value string of the search token. */
  value: string;
}

export interface SearchFieldProps {
  /** Accessible search field label (defaults to '통합 검색'). */
  label?: string;
  /** Raw query string typed by user. */
  query: string;
  /** Query string change callback. */
  onQueryChange: (query: string) => void;
  /** List of categorical scope bar tabs. */
  scopes: string[];
  /** Currently selected scope tab. */
  activeScope: string;
  /** Scope tab change callback. */
  onScopeChange: (scope: string) => void;
  /** Active pill search tokens displayed inside search bar. */
  tokens: SearchToken[];
  /** Removal callback fired when a token's delete button is clicked. */
  onRemoveToken: (id: string) => void;
  /** Optional callback to append suggested search token. */
  onAddSuggestedToken?: (token: SearchToken) => void;
  /** Recent search queries history list. */
  recentSearches?: string[];
  /** Suggested recommended queries list. */
  suggestedQueries?: string[];
  /** Placeholder hint text. */
  placeholder?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Real-time responsive search field equipped with mobile-safe Scope Bar,
 * interactive pill search tokens, and inline aligned search glyphs.
 */
export function SearchField({
  label = "통합 검색",
  query,
  onQueryChange,
  scopes,
  activeScope,
  onScopeChange,
  tokens,
  onRemoveToken,
  onAddSuggestedToken,
  recentSearches = ["Calendar", "OTP", "Dirty State"],
  suggestedQueries = ["Accordion", "Sidebar", "Countdown", "Progress"],
  placeholder = "컴포넌트, 토큰 또는 가이드라인 검색…",
  className = "",
}: SearchFieldProps) {
  const autoId = useId();
  const searchId = `search-${autoId}`;

  const handleClearSearch = () => {
    if (query.length > 0) {
      onQueryChange("");
    } else if (tokens.length > 0) {
      tokens.forEach((tok) => onRemoveToken(tok.id));
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label
          htmlFor={searchId}
          className="block text-xs font-bold text-base-content"
        >
          {label}
        </label>

        {/* Scope Bar (범위 막대 per DESIGN.md 7.3 & AGENTS.md 2.2.C) */}
        <div
          role="tablist"
          aria-label="검색 범위 막대 (Scope Bar)"
          style={{ backgroundColor: "var(--fill-tertiary)" }}
          className="inline-flex items-center rounded-xl p-1 gap-1 border border-base-content/15 max-w-full overflow-x-auto shrink-0"
        >
          {scopes.map((scope) => {
            const isActive = scope === activeScope;
            return (
              <button
                key={scope}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onScopeChange(scope)}
                style={!isActive ? { color: "var(--label-secondary)" } : undefined}
                className={`pst-press px-3 py-1.5 rounded-lg text-xs transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? "bg-base-100 text-base-content font-semibold shadow-sm border border-base-content/12"
                    : "hover:text-base-content font-semibold"
                }`}
              >
                {scope}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input with Search Tokens & Clear (X) Button - Perfectly in-line placeholder and icon */}
      <div className="w-full rounded-2xl flex items-center gap-3 px-3.5 h-12 bg-base-100 border border-base-content/20 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <span style={{ color: "var(--label-secondary)" }} className="shrink-0 flex items-center justify-center">
          <IconSearch className="w-4 h-4" />
        </span>

        {/* Pill Search Tokens */}
        {tokens.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
            {tokens.map((token) => (
              <span
                key={token.id}
                className="badge badge-sm badge-soft badge-primary rounded-full gap-1 py-2.5 ps-2.5 pe-1 font-semibold inline-flex items-center shrink-0"
              >
                <span className="opacity-85">{token.category}:</span>
                <strong className="font-bold">{token.value}</strong>
                <button
                  type="button"
                  onClick={() => onRemoveToken(token.id)}
                  aria-label={`${token.value} 검색 토큰 제거`}
                  className="btn btn-ghost btn-circle btn-xs pst-press ms-0.5 hover:opacity-100 opacity-85"
                >
                  <IconXMarkCircle className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          id={searchId}
          type="search"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="grow min-w-[120px] h-full py-0 bg-transparent border-0 outline-none text-sm font-medium text-base-content placeholder:text-base-content/40 leading-normal focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
        />

        {(query.length > 0 || tokens.length > 0) && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="검색어 및 토큰 지우기"
            style={{ color: "var(--label-secondary)" }}
            className="btn btn-ghost btn-circle btn-xs pst-press hover:text-base-content shrink-0"
          >
            <IconXMarkCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent Searches & Suggested Queries + Suggested Tokens per DESIGN.md 7.3 */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {onAddSuggestedToken && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="font-semibold"
              style={{ color: "var(--label-secondary)" }}
            >
              추천 토큰:
            </span>
            {[
              { id: "tok-glass", category: "레이어", value: "Liquid Glass" },
              { id: "tok-a11y", category: "접근성", value: "44px Hit" },
              { id: "tok-auth", category: "보안", value: "Passkey" },
            ].map((suggested) => (
              <button
                key={suggested.id}
                type="button"
                onClick={() => onAddSuggestedToken(suggested)}
                className="btn btn-xs btn-outline rounded-full pst-press border-base-content/25 text-base-content hover:border-primary hover:text-accent-primary font-semibold px-2.5 inline-flex items-center gap-1"
              >
                <IconPlus className="w-3 h-3" />
                <span>
                  {suggested.category}: {suggested.value}
                </span>
              </button>
            ))}
          </div>
        )}

        {(recentSearches.length > 0 || suggestedQueries.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="font-semibold"
              style={{ color: "var(--label-secondary)" }}
            >
              최근·추천 검색어:
            </span>
            {recentSearches.map((item) => (
              <button
                key={`recent-${item}`}
                type="button"
                onClick={() => onQueryChange(item)}
                className="btn btn-xs btn-ghost rounded-full pst-press border border-base-content/20 text-base-content font-semibold px-2.5 inline-flex items-center gap-1"
              >
                <IconHistory className="w-3.5 h-3.5" />
                <span>{item}</span>
              </button>
            ))}
            {suggestedQueries.map((item) => (
              <button
                key={`suggest-${item}`}
                type="button"
                onClick={() => onQueryChange(item)}
                className="btn btn-xs rounded-full pst-press bg-primary/14 hover:bg-primary/22 text-accent-primary border border-primary/25 font-semibold px-2.5 inline-flex items-center gap-1"
              >
                <IconSearch className="w-3.5 h-3.5" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


export interface OtpInputProps {
  /** Number of digits in passcode (4 or 6, defaults to 6). */
  length?: 4 | 6;
  /** Current passcode digit string. */
  value: string;
  /** Passcode change callback. */
  onChange: (value: string) => void;
  /** Accessible label describing the passcode field. */
  label?: string;
  /** Whether digit boxes are visually joined together. */
  joined?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * 6-digit one-time passcode field with 3+3 cognitive grouping,
 * automatic numeric filtering, and seamless keyboard focus tracking.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  label = "일회용 인증 코드 (OTP)",
  className = "",
}: OtpInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const autoId = useId();
  const inputId = `otp-${autoId}`;
  const digits = Array.from({ length }, (_, idx) => value[idx] ?? "");

  const handleInputChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, length);
    onChange(cleaned);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-base-content"
        >
          {label}
        </label>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="btn btn-ghost btn-xs rounded-xl pst-press text-xs text-accent-primary font-bold inline-flex items-center gap-1"
          >
            <IconXMarkCircle className="w-3.5 h-3.5" />
            <span>코드 지우기</span>
          </button>
        )}
      </div>

      {/* Spacious 6-digit OTP layout with comfortable gaps & 3+3 cognitive grouping */}
      <label
        htmlFor={inputId}
        className="inline-flex items-center gap-2.5 sm:gap-3.5 cursor-text select-none py-1"
      >
        {digits.map((char, idx) => {
          const isCurrentCaret = isFocused && value.length === idx;
          return (
            <React.Fragment key={idx}>
              {idx === 3 && length === 6 && (
                <span
                  className="w-2 h-0.5 rounded-full bg-base-content/30 mx-0.5 shrink-0"
                  aria-hidden="true"
                />
              )}
              <span
                className={`w-11 sm:w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 shadow-2xs ${
                  isCurrentCaret
                    ? "border-primary ring-4 ring-primary/20 bg-base-100 text-base-content scale-105"
                    : char
                    ? "border-primary/60 bg-primary/10 text-accent-primary"
                    : "border-base-content/20 bg-base-100 text-base-content/40 hover:border-base-content/40"
                }`}
              >
                {char || "•"}
              </span>
            </React.Fragment>
          );
        })}
        <input
          id={inputId}
          type="text"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={length}
          pattern={`\\d{${length}}`}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => handleInputChange(e.target.value)}
          aria-label={`${length}자리 인증 번호 입력`}
          className="sr-only"
          required
        />
      </label>

      <p
        className="text-xs font-medium"
        style={{ color: "var(--label-secondary)" }}
      >
        숫자 키패드로 {length}자리 코드를 입력하십시오 ({value.length}/{length} 입력됨)
      </p>
    </div>
  );
}

// Backward-compatible alias
export const OTP = OtpInput;
export type OTPProps = OtpInputProps;
