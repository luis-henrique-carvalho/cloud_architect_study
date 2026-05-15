import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStudyResourceHref(moduleSlug: string, resourceKey: string) {
  return `/modulos/${moduleSlug}?resource=${encodeURIComponent(resourceKey)}`;
}
