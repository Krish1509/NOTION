/**
 * Theme Settings Component
 * 
 * Allows users to select color themes and preview them.
 */

"use client";

import { useState, useEffect } from "react";
import { Check, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setBrandTheme, getCurrentTheme, BrandTheme, THEME_LABELS, THEME_COLORS } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeSettings() {
  const [selectedTheme, setSelectedTheme] = useState<BrandTheme>("notion");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSelectedTheme(getCurrentTheme());
  }, []);

  const handleThemeChange = (theme: BrandTheme) => {
    setSelectedTheme(theme);
    setBrandTheme(theme);
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const themes: BrandTheme[] = ["notion", "ocean", "forest", "purple"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Color Theme</CardTitle>
            <CardDescription>
              Choose your preferred color scheme for the interface
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const isSelected = selectedTheme === theme;
            const colors = THEME_COLORS[theme];

            return (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all cursor-pointer group",
                  "hover:shadow-md hover:-translate-y-0.5",
                  isSelected
                    ? "border-primary shadow-lg bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                {/* Theme Name */}
                <div className="mb-3">
                  <h3 className="font-semibold text-base mb-1">
                    {THEME_LABELS[theme]}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {colors.description}
                  </p>
                </div>

                {/* Color Palette Preview */}
                <div className="flex gap-2 mb-3">
                  <div
                    className="h-10 flex-1 rounded-md shadow-sm border border-border/50"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div
                    className="h-10 flex-1 rounded-md shadow-sm border border-border/50"
                    style={{ backgroundColor: colors.accent }}
                  />
                </div>

                {/* Preview Text */}
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {isSelected ? "Current theme" : "Click to apply"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-start gap-3">
            <Palette className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">About Themes</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Themes change the color scheme of the entire interface while maintaining dark/light mode preferences. Each theme has been carefully crafted for professional CRM use.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

