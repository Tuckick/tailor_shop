"use client";

import { Navigation } from "@/components/navigation";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navigation />
            <main className="min-h-screen">
                {children}
            </main>
        </>
    );
}