"use client";

import "./shiny-button.css";
import type React from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

/* A2 · ShinyButton — botão principal do site.
   Adaptado: CSS em arquivo, tokens da casa, variantes champagne/signal, tamanhos,
   href, type, disabled, eventos de "segurar" e efeito magnético. */

type Common = {
  children: React.ReactNode;
  className?: string;
  variant?: "champagne" | "signal";
  size?: "md" | "lg";
  magnetic?: boolean;
  /** Rótulo do cursor-lente (VER, SEGURE…). */
  cursor?: string;
  pressed?: boolean;
  "aria-label"?: string;
};

type ButtonProps = Common & {
  href?: undefined;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerLeave?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
};

type AnchorProps = Common & {
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export type ShinyButtonProps = ButtonProps | AnchorProps;

export function ShinyButton(props: ShinyButtonProps) {
  const { children, className, variant = "champagne", size = "md", magnetic = true, cursor, pressed } = props;
  const shared = {
    className: cn("shiny-cta", className),
    "data-variant": variant,
    "data-size": size,
    "data-cursor": cursor ?? "SELECIONAR",
    "data-pressed": pressed ? "true" : undefined,
    "aria-label": props["aria-label"],
  };

  const inner = <span className="shiny-cta-label">{children}</span>;

  let el: React.ReactNode;
  if (props.href !== undefined) {
    el = (
      <a {...shared} href={props.href} onClick={props.onClick}>
        {inner}
      </a>
    );
  } else {
    const {
      type = "button",
      disabled,
      onClick,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      onBlur,
    } = props;
    el = (
      <button
        {...shared}
        type={type}
        disabled={disabled}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        onContextMenu={onPointerDown ? (e) => e.preventDefault() : undefined}
      >
        {inner}
      </button>
    );
  }

  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
