import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImagePreviewModalProps {
    imageUrl: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ImagePreviewModal({ imageUrl, isOpen, onClose }: ImagePreviewModalProps) {
    const [modalOpen, setModalOpen] = useState(isOpen);

    // Handle keyboard events for accessibility
    useEffect(() => {
        setModalOpen(isOpen);

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!modalOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div className="relative max-w-4xl w-full h-full max-h-screen p-4 md:p-8 flex items-center justify-center">
                {/* Close button */}
                <button
                    className="absolute top-5 right-5 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={onClose}
                    aria-label="ปิดรูปภาพ"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image container */}
                <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <div className="relative w-auto h-auto max-w-full max-h-full">
                        {/* Next Image doesn't work well for dynamic sizes in modals, so using regular img */}
                        <img
                            src={imageUrl}
                            alt="รูปภาพ"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}