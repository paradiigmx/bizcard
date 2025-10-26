"use client";

import React from 'react';
import Image from 'next/image';
import { MenuIcon } from './icons';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[rgb(var(--color-bg-primary))] border-b border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center">
                    <Image 
                        src="/bizcard-logo-new.png" 
                        alt="BizCard Logo" 
                        width={160} 
                        height={40} 
                        priority
                        style={{ height: '40px', width: 'auto' }}
                    />
                </div>
                
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                    aria-label="Open menu"
                >
                    <MenuIcon className="h-6 w-6 text-[rgb(var(--color-text-primary))]" />
                </button>
            </div>
        </header>
    );
}
