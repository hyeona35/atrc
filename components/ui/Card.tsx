import React from "react";
import Image from "next/image";

// Re-export interactive client components with use client boundary
export {
  Accordion,
  type AccordionProps,
  type AccordionItem,
  Collapse,
  type CollapseProps,
  Carousel,
  type CarouselProps,
  type CarouselSlide,
  Dropdown,
  type DropdownProps,
  type DropdownMenuItem,
  type DropdownItem,
  PullDownMenu,
  type PullDownMenuProps,
} from "./CardClient";

export interface CardProps {
  /** Title text displayed at the top of the card body. */
  title?: string;
  /** Secondary subtitle providing additional context. */
  subtitle?: string;
  /** Status badge text displayed in the header row. */
  badge?: string;
  /** Media thumbnail or header image URL. */
  imageUrl?: string;
  /** Accessible alt text describing the image. */
  imageAlt?: string;
  /** Whether to prioritize loading the card image for optimal Largest Contentful Paint (LCP). */
  imagePriority?: boolean;
  /** Action buttons rendered in the card footer. */
  actions?: React.ReactNode;
  /** Body content of the card. */
  children: React.ReactNode;
  /** Whether to arrange image and content side-by-side on desktop viewports. */
  horizontalOnDesktop?: boolean;
  /** Material surface opacity level (thin, regular, thick). */
  materialWeight?: "thin" | "regular" | "thick";
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Standard Material content surface container for pstui (Pure RSC).
 * Enforces unclipped overflow for dropdowns, squircle curvature (rounded-3xl),
 * and priority image loading support for optimal LCP.
 */
export function Card({
  title,
  subtitle,
  badge,
  imageUrl,
  imageAlt = "",
  imagePriority = false,
  actions,
  children,
  horizontalOnDesktop = false,
  materialWeight = "regular",
  className = "",
}: CardProps) {
  // Strictly Standard Material per AGENTS.md Section 1 & DESIGN.md 3.1
  const materialClass =
    materialWeight === "thin"
      ? "material-thin"
      : materialWeight === "thick"
      ? "material-thick"
      : "material-regular";

  return (
    <article
      className={`card ${materialClass} rounded-3xl shadow-xs transition-all duration-300 ease-out overflow-visible relative ${
        horizontalOnDesktop ? "sm:card-side" : ""
      } ${className}`}
    >
      {imageUrl && (
        <figure
          className={`relative overflow-hidden ${
            horizontalOnDesktop
              ? "sm:w-48 min-h-[160px] shrink-0 rounded-t-3xl sm:rounded-t-none sm:rounded-s-3xl"
              : "h-44 w-full rounded-t-3xl"
          }`}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority={imagePriority}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjQwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMGY1Ii8+PC9zdmc+"
          />
        </figure>
      )}
      <div className="card-body p-5 gap-3.5 overflow-visible">
        {(title || badge) && (
          <div className="flex items-start justify-between gap-2">
            <div>
              {title && (
                <h3 className="card-title text-base font-bold tracking-tight text-base-content">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className="text-xs font-medium mt-0.5 leading-relaxed"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {badge && (
              <span className="badge badge-sm badge-soft badge-primary font-semibold shrink-0">
                {badge}
              </span>
            )}
          </div>
        )}
        <div className="text-sm leading-relaxed text-base-content">
          {children}
        </div>
        {actions && (
          <div
            className="card-actions justify-end pt-2.5 border-t overflow-visible"
            style={{ borderColor: "var(--separator)" }}
          >
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
