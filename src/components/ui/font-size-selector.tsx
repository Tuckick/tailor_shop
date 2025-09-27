"use client";

import React from 'react';
import { useFontSize } from '@/contexts/FontSizeContext';

interface FontSizeSelectorProps {
    className?: string;
    showLabel?: boolean;
}

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
    className = '',
    showLabel = true
}) => {
    const { fontSize, setFontSize } = useFontSize();

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
                {showLabel && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium">🔤 ขนาดตัวอักษร:</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFontSize('small')}
                        className={`px-3 py-2 rounded-md font-medium transition-all duration-200 ${fontSize === 'small'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        title="ขนาดเล็ก - เหมาะสำหรับผู้ที่ต้องการดูข้อมูลมากในหน้าเดียว"
                    >
                        <span className="text-xs">เล็ก</span>
                    </button>
                    <button
                        onClick={() => setFontSize('normal')}
                        className={`px-3 py-2 rounded-md font-medium transition-all duration-200 ${fontSize === 'normal'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        title="ขนาดปกติ - ขนาดมาตรฐานที่อ่านง่าย"
                    >
                        <span className="text-sm">ปกติ</span>
                    </button>
                    <button
                        onClick={() => setFontSize('large')}
                        className={`px-3 py-2 rounded-md font-medium transition-all duration-200 ${fontSize === 'large'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        title="ขนาดใหญ่ - เหมาะสำหรับผู้ที่ต้องการอ่านได้ชัดเจนขึ้น"
                    >
                        <span className="text-base">ใหญ่</span>
                    </button>
                    <button
                        onClick={() => setFontSize('extra-large')}
                        className={`px-3 py-2 rounded-md font-medium transition-all duration-200 ${fontSize === 'extra-large'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        title="ขนาดใหญ่มาก - เหมาะสำหรับผู้ที่มีปัญหาการมองเห็น"
                    >
                        <span className="text-lg">ใหญ่มาก</span>
                    </button>
                </div>
            </div>

            {/* Help text */}
            <div className="mt-3 text-xs text-gray-500 text-center">
                💡 การตั้งค่านี้จะถูกบันทึกไว้และใช้ทุกครั้งที่เข้าใช้งาน
            </div>
        </div>
    );
};