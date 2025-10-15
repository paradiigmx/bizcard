"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../provider';
import { PlusIcon } from '@/components/icons';

const Nav: React.FC = () => {
    const pathname = usePathname();
    const { t } = useAppContext();

    const NavButton: React.FC<{ href: string; label: string; emoji: string }> = ({ href, label, emoji }) => {
        const isActive = pathname === href;
        return (
            <Link href={href} className={`w-1/5 flex flex-col items-center justify-center h-full text-xs sm:text-sm font-medium transition-colors ${isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-primary))]'}`}>
                <span className="text-2xl mb-1">{emoji}</span>
                <span className="truncate">{label}</span>
            </Link>
        );
    }

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-[rgb(var(--color-bg-secondary))] border-t border-[rgb(var(--color-border))] shadow-t-lg z-30">
            <nav className="max-w-3xl mx-auto flex justify-around items-center h-16">
                <NavButton href="/profile" label={t('nav.profile')} emoji="👤" />
                <NavButton href="/" label={t('nav.contacts')} emoji="👥" />
                
                <div className="w-1/5 flex justify-center">
                    <Link href="/contacts/add" className="-mt-8 flex items-center justify-center w-16 h-16 text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-full shadow-lg hover:bg-[rgb(var(--color-primary-hover))] transition-transform hover:scale-105" aria-label={t('nav.add_contact')}>
                        <PlusIcon className="h-8 w-8" />
                    </Link>
                </div>

                <NavButton href="/events" label={t('nav.events')} emoji="🗓️" />
                <NavButton href="/settings" label={t('nav.settings')} emoji="⚙️" />
            </nav>
        </footer>
    );
};

export default Nav;