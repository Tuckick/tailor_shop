import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// NavItem component removed as we're now handling the links directly in the Navigation component

export function Navigation() {
    const pathname = usePathname();
    const isOrdersActive = pathname === "/orders";
    const isNewOrderActive = pathname === "/orders/new";
    const isReportsActive = pathname === "/reports" || pathname.startsWith("/reports/");

    return (
        <nav className="bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-white text-xl font-bold flex items-center">
                            <span className="mr-2">✂️</span> ร้านเย็บผ้า
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link
                                href="/orders"
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                    isOrdersActive
                                        ? "bg-white text-violet-700 shadow-md"
                                        : "text-white hover:bg-violet-600/50 hover:text-white"
                                )}
                            >
                                รายการเย็บผ้า
                            </Link>
                            <Link
                                href="/orders/new"
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                    isNewOrderActive
                                        ? "bg-white text-violet-700 shadow-md"
                                        : "text-white hover:bg-violet-600/50 hover:text-white"
                                )}
                            >
                                สร้างรายการใหม่
                            </Link>
                            <Link
                                href="/reports"
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                    isReportsActive
                                        ? "bg-white text-violet-700 shadow-md"
                                        : "text-white hover:bg-violet-600/50 hover:text-white"
                                )}
                            >
                                รายงานรายได้
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 flex flex-col items-start">
                    <Link
                        href="/orders"
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            isOrdersActive
                                ? "bg-white text-violet-700 shadow-md"
                                : "text-white hover:bg-violet-600/50 hover:text-white"
                        )}
                    >
                        รายการเย็บผ้า
                    </Link>
                    <Link
                        href="/orders/new"
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            isNewOrderActive
                                ? "bg-white text-violet-700 shadow-md"
                                : "text-white hover:bg-violet-600/50 hover:text-white"
                        )}
                    >
                        สร้างรายการใหม่
                    </Link>
                    <Link
                        href="/reports"
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            isReportsActive
                                ? "bg-white text-violet-700 shadow-md"
                                : "text-white hover:bg-violet-600/50 hover:text-white"
                        )}
                    >
                        รายงานรายได้
                    </Link>
                </div>
            </div>
        </nav>
    );
}