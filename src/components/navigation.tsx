import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
    href: string;
    text: string;
}

export function NavItem({ href, text }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                isActive
                    ? "bg-blue-700 text-white"
                    : "text-gray-300 hover:bg-blue-600 hover:text-white"
            )}
        >
            {text}
        </Link>
    );
}

export function Navigation() {
    return (
        <nav className="bg-blue-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-white text-xl font-bold">
                            ร้านเย็บผ้า
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavItem href="/orders" text="รายการเย็บผ้า" />
                            <NavItem href="/orders/new" text="สร้างรายการใหม่" />
                            <NavItem href="/reports" text="รายงานรายได้" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <NavItem href="/orders" text="รายการเย็บผ้า" />
                    <NavItem href="/orders/new" text="สร้างรายการใหม่" />
                    <NavItem href="/reports" text="รายงานรายได้" />
                </div>
            </div>
        </nav>
    );
}