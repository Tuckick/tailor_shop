import React, { useState } from 'react';
import Image from 'next/image';
import { ImagePreviewModal } from './image-preview-modal';

interface ImageGalleryProps {
    imageUrls: string[];
    className?: string;
}

export function ImageGallery({ imageUrls, className = '' }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!imageUrls || imageUrls.length === 0) {
        return null;
    }

    return (
        <>
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 ${className}`}>
                {imageUrls.map((imageUrl, index) => (
                    <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                        onClick={() => setSelectedImage(imageUrl)}
                    >
                        <div className="aspect-square relative">
                            <Image
                                src={imageUrl}
                                alt={`Order image ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200"
                            title="คลิกเพื่อดูรูปขยาย"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <ImagePreviewModal
                    imageUrl={selectedImage}
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </>
    );
}