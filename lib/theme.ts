/**
 * Theme Helper Functions
 * 
 * Utilities for managing brand themes (not light/dark mode).
 * Light/dark mode is handled by next-themes.
 * 
 * Brand themes are applied via CSS classes on the <html> element.
 */

export type BrandTheme = "notion" | "corporate"; // Add more themes as needed

const THEME_STORAGE_KEY = "brand-theme";
const DEFAULT_THEME: BrandTheme = "notion";

/**
 * Set the brand theme
 * 
 * @param themeName - The name of the theme (e.g., 'notion', 'corporate')
 * 
 * @example
 * setBrandTheme('notion')
 * setBrandTheme('corporate')
 */
export function setBrandTheme(themeName: BrandTheme): void {
  if (typeof window === "undefined") return;

  const html = document.documentElement;

  // Remove all theme classes
  html.classList.remove(
    "theme-notion",
    "theme-corporate"
    // Add more theme classes here as you add themes
  );

  // Add the new theme class
  html.classList.add(`theme-${themeName}`);

  // Persist to localStorage
  localStorage.setItem(THEME_STORAGE_KEY, themeName);
}

/**
 * Get the current brand theme
 * 
 * @returns The current brand theme name
 */
export function getCurrentTheme(): BrandTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;

  // Check localStorage first
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && (stored === "notion" || stored === "corporate")) {
    return stored as BrandTheme;
  }

  // Check HTML class
  const html = document.documentElement;
  for (const className of html.classList) {
    if (className.startsWith("theme-")) {
      const themeName = className.replace("theme-", "") as BrandTheme;
      return themeName;
    }
  }

  // Default fallback
  return DEFAULT_THEME;
}

/**
 * Initialize theme on mount
 * 
 * Call this in a useEffect or in your root layout to ensure
 * the theme is applied on page load.
 */
export function initializeTheme(): void {
  if (typeof window === "undefined") return;

  const theme = getCurrentTheme();
  setBrandTheme(theme);
}

