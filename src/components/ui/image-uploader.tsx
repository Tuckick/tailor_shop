import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './button';
import { SafeImage } from './safe-image';
import { ImagePreviewModal } from './image-preview-modal';

interface ImageUploaderProps {
    maxImages?: number;
    onImagesChange: (imageIds: number[], dataUrls: string[]) => void;
    initialImageIds?: number[];
    initialDataUrls?: string[];
    className?: string;
    orderId?: number; // Optional order ID for associating images
}

export function ImageUploader({
    maxImages = 5,
    onImagesChange,
    initialImageIds = [],
    initialDataUrls = [],
    className,
    orderId
}: ImageUploaderProps) {
    const [uploadedImageIds, setUploadedImageIds] = useState<number[]>(initialImageIds);
    const [uploadedDataUrls, setUploadedDataUrls] = useState<string[]>(initialDataUrls);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [removingImageIndex, setRemovingImageIndex] = useState<number | null>(null);

    // Memoize the initial arrays to prevent unnecessary re-renders
    const memoizedInitialImageIds = useMemo(() => initialImageIds, [JSON.stringify(initialImageIds)]);
    const memoizedInitialDataUrls = useMemo(() => initialDataUrls, [JSON.stringify(initialDataUrls)]);

    // Update state when initial props change (for edit page)
    useEffect(() => {
        setUploadedImageIds(memoizedInitialImageIds);
    }, [memoizedInitialImageIds]);

    useEffect(() => {
        setUploadedDataUrls(memoizedInitialDataUrls);
    }, [memoizedInitialDataUrls]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check if adding more images would exceed the limit
        if (uploadedDataUrls.length + files.length > maxImages) {
            setUploadError(`คุณสามารถอัพโหลดรูปได้สูงสุด ${maxImages} รูปเท่านั้น`);
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const newImageIds: number[] = [...uploadedImageIds];
            const newDataUrls: string[] = [...uploadedDataUrls];

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
                if (orderId) {
                    formData.append('orderId', orderId.toString());
                }

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Upload successful:', data);
                newImageIds.push(data.imageId);
                newDataUrls.push(data.dataUrl);
            }

            setUploadedImageIds(newImageIds);
            setUploadedDataUrls(newDataUrls);
            onImagesChange(newImageIds, newDataUrls);
        } catch (error) {
            console.error('Error uploading images:', error);
            setUploadError((error as Error).message || 'เกิดข้อผิดพลาดในการอัพโหลดรูป');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async (index: number) => {
        // แสดงการยืนยันก่อนลบรูป
        if (!window.confirm('คุณต้องการลบรูปนี้ใช่หรือไม่?')) {
            return;
        }

        setRemovingImageIndex(index);

        try {
            const imageId = uploadedImageIds[index];

            // Delete from database if it has an ID
            if (imageId) {
                const response = await fetch(`/api/images/${imageId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    console.warn('Failed to delete image from database');
                    throw new Error('ไม่สามารถลบรูปจากฐานข้อมูลได้');
                }
            }

            const newImageIds = uploadedImageIds.filter((_, i) => i !== index);
            const newDataUrls = uploadedDataUrls.filter((_, i) => i !== index);

            setUploadedImageIds(newImageIds);
            setUploadedDataUrls(newDataUrls);
            onImagesChange(newImageIds, newDataUrls);
        } catch (error) {
            console.error('Error removing image:', error);
            setUploadError('เกิดข้อผิดพลาดในการลบรูป: ' + (error as Error).message);
        } finally {
            setRemovingImageIndex(null);
        }
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
                        disabled={isUploading || uploadedDataUrls.length >= maxImages}
                    />
                </div>
                <span className="text-sm text-gray-500">
                    {uploadedDataUrls.length}/{maxImages} รูป
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

            {(uploadedDataUrls.length > 0 || uploadedImageIds.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {uploadedDataUrls.map((dataUrl: string, index: number) => {
                        console.log(`Rendering image ${index} with dataUrl:`, dataUrl.substring(0, 50) + '...');
                        const isRemoving = removingImageIndex === index;

                        return (
                            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                {/* Loading overlay ขณะลบรูป */}
                                {isRemoving && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}

                                <img
                                    src={dataUrl}
                                    alt={`Uploaded image ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => !isRemoving && setSelectedImage(dataUrl)}
                                    onLoad={() => console.log(`Image ${index} loaded successfully`)}
                                    onError={(e) => console.error(`Image ${index} failed to load:`, e)}
                                />

                                {/* ปุ่มลบรูป - ปรับให้เห็นชัดขึ้นและแสดงตลอดเวลาในมือถือ */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage(index);
                                    }}
                                    disabled={isRemoving}
                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg 
                                             opacity-80 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                             focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    title="ลบรูป"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
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