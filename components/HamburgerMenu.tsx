"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ProfileIcon, ContactsIcon, EventsIcon, SettingsIcon, CloseIcon, CompanyIcon, ListsIcon, AnalyticsIcon } from './icons';

interface HamburgerMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { name: 'Profile', path: '/profile', icon: ProfileIcon },
        { name: 'Contacts', path: '/', icon: ContactsIcon },
        { name: 'Events', path: '/events', icon: EventsIcon },
        { name: 'Companies', path: '/companies', icon: CompanyIcon },
        { name: 'Lists', path: '/lists', icon: ListsIcon },
        { name: 'Analytics', path: '/analytics', icon: AnalyticsIcon },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const handleNavClick = (path: string) => {
        router.push(path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
                onClick={onClose}
                aria-label="Close menu"
            />
            
            <div className="fixed top-0 right-0 h-full w-80 bg-[rgb(var(--color-bg-primary))] shadow-2xl z-50 transform transition-transform">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))]">
                        <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">Menu</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                            aria-label="Close menu"
                        >
                            <CloseIcon className="h-6 w-6 text-[rgb(var(--color-text-primary))]" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = pathname === item.path || 
                                (item.path === '/' && pathname === '/') ||
                                (item.path !== '/' && pathname.startsWith(item.path));
                            
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                                        isActive 
                                            ? 'bg-[rgb(var(--color-primary))] text-white' 
                                            : 'text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
}
