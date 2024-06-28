"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Theme } from '@radix-ui/themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <Theme hasBackground={false} className="bg-none"><NextThemesProvider {...props}>{children}</NextThemesProvider></Theme>
}
