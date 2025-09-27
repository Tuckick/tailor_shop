"use client";

import { FontSizeProvider } from "@/contexts/FontSizeContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FontSizeProvider>
            {children}
        </FontSizeProvider>
    );
}