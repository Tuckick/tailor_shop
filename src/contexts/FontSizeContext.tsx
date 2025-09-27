"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'small' | 'normal' | 'large' | 'extra-large';

interface FontSizeContextType {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    getFontSizeClass: () => string;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (context === undefined) {
        throw new Error('useFontSize must be used within a FontSizeProvider');
    }
    return context;
};

interface FontSizeProviderProps {
    children: ReactNode;
}

export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({ children }) => {
    const [fontSize, setFontSizeState] = useState<FontSize>('normal');

    useEffect(() => {
        // Load saved font size from localStorage on mount
        const savedFontSize = localStorage.getItem('fontSize') as FontSize | null;
        if (savedFontSize && ['small', 'normal', 'large', 'extra-large'].includes(savedFontSize)) {
            setFontSizeState(savedFontSize);
        }
    }, []);

    useEffect(() => {
        // Apply font size to document root
        const root = document.documentElement;
        root.classList.remove('text-small', 'text-normal', 'text-large', 'text-extra-large');
        root.classList.add(`text-${fontSize}`);

        // Save to localStorage
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    const setFontSize = (newSize: FontSize) => {
        setFontSizeState(newSize);
    };

    const getFontSizeClass = () => {
        switch (fontSize) {
            case 'small': return 'text-sm';
            case 'normal': return 'text-base';
            case 'large': return 'text-lg';
            case 'extra-large': return 'text-xl';
            default: return 'text-base';
        }
    };

    const value = {
        fontSize,
        setFontSize,
        getFontSizeClass
    };

    return (
        <FontSizeContext.Provider value={value}>
            {children}
        </FontSizeContext.Provider>
    );
};