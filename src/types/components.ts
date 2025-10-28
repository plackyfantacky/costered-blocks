import type { CSSProperties, ReactNode } from "react";

export type Children = { children?: ReactNode };
export type ClassStyle = { className?: string; style?: CSSProperties };

// event handler types
export type OnChange<Token = unknown> = (value: Token) => void;
export type OnToggle = (next: boolean) => void;

export type Option<Value extends string = string> = { label: string; value: Value };