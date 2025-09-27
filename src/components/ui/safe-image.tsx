'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    onClick?: () => void;
}

export function SafeImage({
    src,
    alt,
    className = '',
    fill = false,
    width,
    height,
    onClick
}: SafeImageProps) {
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = () => {
        console.error('Image failed to load:', src);
        setIsError(true);
        setIsLoading(false);
    };

    const handleLoad = () => {
        console.log('Image loaded successfully:', src);
        setIsLoading(false);
    };

    // Check if src is a data URL (base64 encoded image)
    const isDataUrl = src.startsWith('data:');

    if (isError) {
        return (
            <div
                className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className} ${onClick ? 'cursor-pointer hover:from-gray-200 hover:to-gray-300 transition-colors' : ''}`}
                onClick={onClick}
            >
                <div className="text-center p-2">
                    <svg
                        className="w-8 h-8 text-gray-400 mx-auto mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                    </svg>
                    <p className="text-xs text-gray-500 leading-tight">ไม่สามารถ<br />โหลดรูปได้</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
            {isLoading && (
                <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${className}`}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
            )}
            {isDataUrl ? (
                // Use regular img tag for data URLs (base64 images)
                <img
                    src={src}
                    alt={alt}
                    className={`${className} ${fill ? 'w-full h-full object-cover absolute inset-0' : 'block'} ${isLoading ? 'invisible' : 'visible'}`}
                    style={!fill && width && height ? { width, height, objectFit: 'cover' } : { objectFit: 'cover' }}
                    onError={handleError}
                    onLoad={handleLoad}
                />
            ) : (
                // Use Next.js Image for regular URLs
                <Image
                    src={src}
                    alt={alt}
                    fill={fill}
                    width={!fill ? width : undefined}
                    height={!fill ? height : undefined}
                    className={`${className} ${isLoading ? 'invisible' : 'visible'}`}
                    onError={handleError}
                    onLoad={handleLoad}
                    priority={false}
                    quality={85}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            )}
        </div>
    );
}