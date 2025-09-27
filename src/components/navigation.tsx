"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useFontSize } from "@/contexts/FontSizeContext";

export function Navigation() {
    const pathname = usePathname();
    const isOrdersActive = pathname === "/orders";
    const isReportsActive = pathname === "/reports" || pathname.startsWith("/reports/");
    const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { fontSize, setFontSize } = useFontSize();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fontSizeOptions = [
        { value: 'small' as const, label: 'เล็ก (A)', icon: '🔤' },
        { value: 'normal' as const, label: 'ปกติ (A)', icon: '🔤' },
        { value: 'large' as const, label: 'ใหญ่ (A)', icon: '🔤' },
        { value: 'extra-large' as const, label: 'ใหญ่มาก (A)', icon: '🔤' }
    ];

    const getCurrentFontSizeLabel = () => {
        const option = fontSizeOptions.find(opt => opt.value === fontSize);
        return option?.label || 'ปกติ (A)';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowFontSizeDropdown(false);
            }
        };

        if (showFontSizeDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showFontSizeDropdown]);

    // Close mobile menu and dropdown when window resizes
    useEffect(() => {
        const handleResize = () => {
            setShowMobileMenu(false);
            setShowFontSizeDropdown(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <nav className="bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/orders" className="text-white text-lg sm:text-xl font-bold flex items-center">
                            <span className="mr-2">✂️</span>
                            <span className="hidden sm:inline">ร้านเย็บผ้า</span>
                            <span className="sm:hidden">ร้าน</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
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

                            {/* Font Size Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
                                    className="px-4 py-2 rounded-full text-sm font-medium transition-all text-white hover:bg-violet-600/50 hover:text-white flex items-center space-x-1"
                                >
                                    <span>🔤</span>
                                    <span className="hidden lg:inline">{getCurrentFontSizeLabel()}</span>
                                    <svg className={`w-4 h-4 transition-transform ${showFontSizeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showFontSizeDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <div className="py-2">
                                            <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                                                ขนาดตัวอักษร
                                            </div>
                                            {fontSizeOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setFontSize(option.value);
                                                        setShowFontSizeDropdown(false);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2",
                                                        fontSize === option.value
                                                            ? "bg-violet-50 text-violet-700 font-medium"
                                                            : "text-gray-700 hover:bg-gray-50"
                                                    )}
                                                >
                                                    <span>{option.icon}</span>
                                                    <span>{option.label}</span>
                                                    {fontSize === option.value && (
                                                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 p-2"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {showMobileMenu ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {showMobileMenu && (
                <div className="md:hidden border-t border-violet-500/20">
                    <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 bg-violet-600/90 backdrop-blur-sm">
                        <Link
                            href="/orders"
                            onClick={() => setShowMobileMenu(false)}
                            className={cn(
                                "block px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                isOrdersActive
                                    ? "bg-white text-violet-700 shadow-md"
                                    : "text-white hover:bg-violet-500/50"
                            )}
                        >
                            📋 รายการเย็บผ้า
                        </Link>
                        <Link
                            href="/reports"
                            onClick={() => setShowMobileMenu(false)}
                            className={cn(
                                "block px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                isReportsActive
                                    ? "bg-white text-violet-700 shadow-md"
                                    : "text-white hover:bg-violet-500/50"
                            )}
                        >
                            📊 รายงานรายได้
                        </Link>

                        {/* Mobile Font Size Section */}
                        <div className="border-t border-violet-500/20 pt-3 mt-2">
                            <div className="px-4 py-2">
                                <div className="text-white text-xs font-medium mb-2 opacity-75">ขนาดตัวอักษร</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {fontSizeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setFontSize(option.value);
                                                setShowMobileMenu(false);
                                            }}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1 min-h-[40px]",
                                                fontSize === option.value
                                                    ? "bg-white text-violet-700 shadow-md"
                                                    : "text-white hover:bg-violet-500/50 bg-violet-600/30"
                                            )}
                                        >
                                            <span>{option.icon}</span>
                                            <span className="text-xs">{option.label.replace(' (A)', '')}</span>
                                            {fontSize === option.value && (
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}