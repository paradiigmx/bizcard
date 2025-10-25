"use client";
import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode.react';
import type { Contact } from '../types';
import { XIcon, DownloadIcon, LinkIcon } from './icons';

interface QrCodeModalProps {
    contact: Contact;
    onClose: () => void;
    title?: string;
    subtitle?: string;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ contact, onClose, title, subtitle }) => {
    const qrCanvasRef = useRef<HTMLDivElement | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    
    const qrUrl = contact.handle ? `${window.location.origin}/u/${contact.handle}?add=true` : '';

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        modalRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleDownloadQR = () => {
        const canvas = qrCanvasRef.current?.querySelector('canvas');
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contact.handle || 'my-qr'}.png`;
        a.click();
    };
    
    const handleCopyLink = async () => {
        if (!qrUrl) return;
        try {
            await navigator.clipboard.writeText(qrUrl);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Could not copy link.');
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center relative" 
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
            >
                <button onClick={onClose} className="absolute -top-3 -right-3 text-white bg-slate-700 rounded-full p-1.5 hover:bg-slate-800 transition-colors" aria-label="Close QR Code Modal">
                    <XIcon className="h-5 w-5"/>
                </button>
                
                <h3 id="qr-modal-title" className="text-xl font-bold mb-1 text-slate-800">{title || 'Scan to Connect'}</h3>
                {subtitle && <p className="text-slate-600 mb-4">{subtitle}</p>}
                
                <div ref={qrCanvasRef} className="p-4 bg-slate-100 rounded-md inline-block">
                    {qrUrl ? (
                         <QRCode value={qrUrl} size={220} level="H" includeMargin={true} />
                    ): (
                        <div className="h-[252px] flex items-center justify-center text-slate-500">
                             <p>Set a public handle to generate a QR code.</p>
                        </div>
                    )}
                </div>
                
                <p className="text-slate-600 mt-4 text-sm">Have someone scan this code to share your contact details instantly.</p>
                <p className="text-slate-500 break-words mt-2 text-xs">{qrUrl}</p>

                {qrUrl && (
                    <div className="mt-4 flex gap-2 justify-center">
                        <button
                            onClick={handleDownloadQR}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-slate-700 text-white hover:bg-slate-800 transition-colors"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Download
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
                        >
                            <LinkIcon className="h-4 w-4" />
                            Copy Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrCodeModal;
