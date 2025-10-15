"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Nav from './Nav';
import Image from 'next/image';

const ApiKeyWarning: React.FC = () => (
    <div className="bg-[rgb(var(--color-warning)/0.1)] border-l-4 border-[rgb(var(--color-warning))] text-[rgb(var(--color-warning))] p-4 rounded-md shadow-md" role="alert">
        <p className="font-bold">API Key Not Found</p>
        <p>Please set your Gemini API key in the <code className="bg-[rgb(var(--color-warning)/0.2)] p-1 rounded">NEXT_PUBLIC_API_KEY</code> environment variable to use the AI features.</p>
    </div>
);

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const isPublicProfile = pathname.startsWith('/u/');

    return (
        <main className="min-h-screen font-sans">
            <div className={`container mx-auto max-w-3xl p-4 ${!isPublicProfile ? 'pb-24' : ''}`}>
                {!isPublicProfile && (
                    <header className="flex items-center justify-between mb-6 py-4">
                        <div className="flex items-center">
                             <img src="/bizcard-logo.png?v=3" alt="Paradiigm Logo" className="h-16 w-auto" />
                        </div>
                    </header>
                )}
                {process.env.NEXT_PUBLIC_API_KEY ? children : <ApiKeyWarning />}
                
                {!isPublicProfile && (
                    <div className="mt-8 pt-6 border-t border-[rgb(var(--color-border))] text-center text-xs text-[rgb(var(--color-text-subtle))]">
                        <p className="font-semibold mb-2">Powered by Paradiigm</p>
                        <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
                            <span>info@pdiigm.com</span>
                            <span>•</span>
                            <span>702-573-4043</span>
                            <span>•</span>
                            <a href="https://paradiigm.net" target="_blank" rel="noopener noreferrer" className="hover:text-[rgb(var(--color-primary))] transition-colors">paradiigm.net</a>
                            <span>•</span>
                            <span>Est 2025</span>
                        </div>
                    </div>
                )}
            </div>

            {!isPublicProfile && <Nav />}
        </main>
    );
};

export default MainLayout;