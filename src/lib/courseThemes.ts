import type { CSSProperties } from "react";
import type { CourseKey } from "@/lib/courseConfig";

export type CourseTheme = {
  page: string;
  panel: string;
  panelStrong: string;
  panelSoft: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryText: string;
  buttonText: string;
  shadow: string;
};

export type CourseThemeVars = CSSProperties & Record<`--course-${string}`, string>;

const warmTheme: CourseTheme = {
  page: "#fbf6ee",
  panel: "#fffaf2",
  panelStrong: "#f6ecdc",
  panelSoft: "#f4eadc",
  border: "#eadcc8",
  borderStrong: "#8a6a43",
  primary: "#6f4b28",
  primaryHover: "#7d5730",
  primarySoft: "#ead8bc",
  primaryText: "#4f341b",
  buttonText: "#fff3d7",
  shadow: "0 10px 26px rgba(111,75,40,0.14)",
};

export const courseThemes: Record<CourseKey, CourseTheme> = {
  "black-white": warmTheme,
  shanhaijing: {
    page: "#f3f0e8",
    panel: "#fbf6ea",
    panelStrong: "#e5ddc8",
    panelSoft: "#ece5d4",
    border: "#d7c58f",
    borderStrong: "#c9a84c",
    primary: "#2c3e6b",
    primaryHover: "#364b7c",
    primarySoft: "#e6d7a3",
    primaryText: "#223252",
    buttonText: "#f8edcc",
    shadow: "0 10px 26px rgba(44,62,107,0.16)",
  },
  free: {
    page: "#fbf1ea",
    panel: "#fff7ef",
    panelStrong: "#f1d8ca",
    panelSoft: "#f7e2d6",
    border: "#e8c7b8",
    borderStrong: "#9d4a32",
    primary: "#8f3f2b",
    primaryHover: "#a24b33",
    primarySoft: "#edcbbb",
    primaryText: "#5b2a1f",
    buttonText: "#fff4ea",
    shadow: "0 10px 26px rgba(143,63,43,0.14)",
  },
  color: {
    page: "#eef3f7",
    panel: "#f7f4ec",
    panelStrong: "#e4d6b6",
    panelSoft: "#e9dfc8",
    border: "#c9b173",
    borderStrong: "#a88637",
    primary: "#1f3d5a",
    primaryHover: "#284d70",
    primarySoft: "#dcc58a",
    primaryText: "#172c43",
    buttonText: "#f9edcf",
    shadow: "0 10px 26px rgba(31,61,90,0.15)",
  },
};

export function getCourseThemeStyle(courseKey: CourseKey): CourseThemeVars {
  const theme = courseThemes[courseKey] || warmTheme;
  return {
    "--course-page": theme.page,
    "--course-panel": theme.panel,
    "--course-panel-strong": theme.panelStrong,
    "--course-panel-soft": theme.panelSoft,
    "--course-border": theme.border,
    "--course-border-strong": theme.borderStrong,
    "--course-primary": theme.primary,
    "--course-primary-hover": theme.primaryHover,
    "--course-primary-soft": theme.primarySoft,
    "--course-primary-text": theme.primaryText,
    "--course-button-text": theme.buttonText,
    "--course-shadow": theme.shadow,
  };
}
