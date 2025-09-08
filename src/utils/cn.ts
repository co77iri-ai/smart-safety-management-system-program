import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...cv: ClassValue[]) => twMerge(clsx(...cv));
