import React, { useState } from 'react';
import { Button } from './button';
import Image from 'next/image';
import { ImagePreviewModal } from './image-preview-modal';

interface ImageUploaderProps {
    maxImages?: number;
    onImagesChange: (urls: string[]) => void;
    initialImages?: string[];
    className?: string;
}

export function ImageUploader({
    maxImages = 5,
    onImagesChange,
    initialImages = [],
    className
}: ImageUploaderProps) {
    const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check if adding more images would exceed the limit
        if (uploadedImages.length + files.length > maxImages) {
            setUploadError(`คุณสามารถอัพโหลดรูปได้สูงสุด ${maxImages} รูปเท่านั้น`);
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const newImages: string[] = [...uploadedImages];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Check file type
                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    setUploadError('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WEBP, GIF)');
                    continue;
                }

                // Check file size (limit to 5MB)
                const fiveMB = 5 * 1024 * 1024;
                if (file.size > fiveMB) {
                    setUploadError('ขนาดไฟล์ต้องไม่เกิน 5MB');
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'เกิดข้อผิดพลาดในการอัพโหลดรูป');
                }

                const data = await response.json();
                newImages.push(data.url);
            }

            setUploadedImages(newImages);
            onImagesChange(newImages); // Send the updated images array back to parent component
        } catch (error) {
            console.error('Error uploading images:', error);
            setUploadError((error as Error).message || 'เกิดข้อผิดพลาดในการอัพโหลดรูป');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...uploadedImages];
        newImages.splice(index, 1);
        setUploadedImages(newImages);
        onImagesChange(newImages);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-violet-50 hover:bg-violet-100 text-violet-700 px-4 py-2 rounded-md border border-violet-200 transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        อัพโหลดรูปภาพ
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading || uploadedImages.length >= maxImages}
                    />
                </div>
                <span className="text-sm text-gray-500">
                    {uploadedImages.length}/{maxImages} รูป
                </span>
            </div>

            {isUploading && (
                <div className="flex items-center space-x-2 text-violet-700">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังอัพโหลด...</span>
                </div>
            )}

            {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

            {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                            <div
                                className="aspect-square relative cursor-pointer"
                                onClick={() => setSelectedImage(imageUrl)}
                            >
                                <Image
                                    src={imageUrl}
                                    alt={`Uploaded image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200">
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
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(index);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <ImagePreviewModal
                    imageUrl={selectedImage}
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
}