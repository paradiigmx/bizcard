"use client";
import React, { useState, useRef } from 'react';
import type { Contact, BusinessCardTemplate } from '../types';
import { SUBSCRIPTION_LIMITS } from '../types';
import QRCode from 'qrcode.react';
import { DownloadIcon, ShareIcon, XIcon, CameraIcon, TrashIcon } from './icons';
import { compressImage } from '../utils';
import { useAppContext } from '../app/provider';
import PaywallModal from './PaywallModal';

interface BusinessCardCreatorProps {
    profile: Contact;
    onUpdateProfile: (profile: Contact) => void;
    onClose: () => void;
}

const BusinessCardCreator: React.FC<BusinessCardCreatorProps> = ({ profile, onUpdateProfile, onClose }) => {
    const { subscription } = useAppContext();
    const [selectedTemplate, setSelectedTemplate] = useState<BusinessCardTemplate>(profile.businessCardTemplate || 'Photo');
    const [showLogoUpload, setShowLogoUpload] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [cardColors, setCardColors] = useState(profile.businessCardColors || {
        from: '#2563eb',
        via: '#9333ea',
        to: '#ec4899'
    });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleTemplateSelect = (template: BusinessCardTemplate) => {
        // Check if template is allowed for current subscription
        const allowedTemplates = SUBSCRIPTION_LIMITS[subscription.tier].allowedTemplates;
        
        if (!allowedTemplates.includes(template)) {
            setShowPaywall(true);
            return;
        }
        
        setSelectedTemplate(template);
        onUpdateProfile({ ...profile, businessCardTemplate: template });
    };

    const handleColorChange = (position: 'from' | 'via' | 'to', color: string) => {
        const newColors = { ...cardColors, [position]: color };
        setCardColors(newColors);
        onUpdateProfile({ ...profile, businessCardColors: newColors });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedImage = await compressImage(file, 400, 200, 0.9);
                onUpdateProfile({ ...profile, logo_url: compressedImage });
                setShowLogoUpload(false);
            } catch (error) {
                console.error('Failed to compress logo:', error);
                alert('Failed to upload logo. Please try again.');
            }
        }
    };

    const removeLogo = () => {
        onUpdateProfile({ ...profile, logo_url: undefined });
    };

    const downloadCard = async () => {
        if (!cardRef.current) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            } as any);
            
            const link = document.createElement('a');
            link.download = `${profile.name.replace(/\s+/g, '-')}-business-card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to download card:', error);
            alert('Failed to download business card. Please try again.');
        }
    };

    const shareCard = async () => {
        if (!cardRef.current) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            } as any);
            
            canvas.toBlob(async (blob: Blob | null) => {
                if (!blob) {
                    alert('Failed to generate business card image. Please try again.');
                    return;
                }
                
                const file = new File([blob], `${profile.name}-business-card.png`, { type: 'image/png' });
                
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: `${profile.name} - Business Card`,
                            text: `Business card for ${profile.name}`,
                            files: [file],
                        });
                    } catch (error) {
                        if ((error as Error).name !== 'AbortError') {
                            console.error('Error sharing:', error);
                            const dataUrl = canvas.toDataURL('image/png');
                            const newWindow = window.open();
                            if (newWindow) {
                                newWindow.document.write(`<img src="${dataUrl}" alt="Business Card" />`);
                            } else {
                                alert('Please allow popups to share this business card, or use the download option.');
                            }
                        }
                    }
                } else {
                    const dataUrl = canvas.toDataURL('image/png');
                    const newWindow = window.open();
                    if (newWindow) {
                        newWindow.document.write(`
                            <html>
                            <head><title>${profile.name} - Business Card</title></head>
                            <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#f3f4f6;">
                                <img src="${dataUrl}" alt="Business Card" style="max-width:100%;height:auto;" />
                            </body>
                            </html>
                        `);
                    } else {
                        alert('Sharing is not supported on your browser. Please use the download option instead.');
                    }
                }
            });
        } catch (error) {
            console.error('Failed to share card:', error);
            alert('Failed to share business card. Please try again or use the download option.');
        }
    };

    const renderPhotoTemplate = () => (
        <div className="flex flex-col items-center gap-3">
            <div 
                ref={cardRef}
                className="w-[600px] h-[350px] p-8 rounded-2xl shadow-2xl text-white flex gap-6"
                style={{
                    background: `linear-gradient(to bottom right, ${cardColors.from}, ${cardColors.via}, ${cardColors.to})`
                }}
            >
                {profile.image_url && (
                    <div className="flex-shrink-0 flex items-center">
                        <img src={profile.image_url} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                    </div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        {profile.logo_url && (
                            <img src={profile.logo_url} alt="Logo" className="h-12 mb-4 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                        )}
                        <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                        <p className="text-lg opacity-90">{profile.role}</p>
                        <p className="text-md opacity-80">{profile.company}</p>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="space-y-1 text-sm">
                            <p>{profile.email}</p>
                            <p>{profile.phone}</p>
                            {profile.websites && profile.websites[0] && <p>{profile.websites[0]}</p>}
                        </div>
                        {profile.handle && (
                            <div className="bg-white p-2 rounded">
                                <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={60} level="H" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-sm text-gray-600 font-medium mt-2">Generated with BizCard</div>
        </div>
    );

    const renderModernTemplate = () => (
        <div className="flex flex-col items-center gap-3">
            <div 
                ref={cardRef}
                className="w-[600px] h-[350px] p-8 rounded-2xl shadow-2xl text-white flex flex-col justify-between"
                style={{
                    background: `linear-gradient(to bottom right, ${cardColors.from}, ${cardColors.via}, ${cardColors.to})`
                }}
            >
                <div className="flex items-start">
                    <div className="flex-1">
                        {profile.logo_url && (
                            <img src={profile.logo_url} alt="Logo" className="h-12 mb-4 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                        )}
                        <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                        <p className="text-lg opacity-90">{profile.role}</p>
                        <p className="text-md opacity-80">{profile.company}</p>
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <div className="space-y-1 text-sm">
                        <p>{profile.email}</p>
                        <p>{profile.phone}</p>
                        {profile.websites && profile.websites[0] && <p>{profile.websites[0]}</p>}
                    </div>
                    {profile.handle && (
                        <div className="bg-white p-2 rounded">
                            <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={60} level="H" />
                        </div>
                    )}
                </div>
            </div>
            <div className="text-sm text-gray-600 font-medium mt-2">Generated with BizCard</div>
        </div>
    );

    const renderClassicTemplate = () => (
        <div className="flex flex-col items-center gap-3">
            <div ref={cardRef} className="w-[600px] h-[350px] bg-white border-4 border-gray-800 p-8 shadow-2xl flex flex-col justify-between">
                <div className="flex items-start border-b-2 border-gray-800 pb-4">
                    <div className="flex-1">
                        {profile.logo_url && (
                            <img src={profile.logo_url} alt="Logo" className="h-14 mb-3 object-contain" />
                        )}
                        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-1">{profile.name}</h1>
                        <p className="text-lg text-gray-700 font-semibold">{profile.role}</p>
                        <p className="text-md text-gray-600">{profile.company}</p>
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <div className="space-y-1 text-sm text-gray-700">
                        <p className="font-semibold">Email: <span className="font-normal">{profile.email}</span></p>
                        <p className="font-semibold">Phone: <span className="font-normal">{profile.phone}</span></p>
                        {profile.websites && profile.websites[0] && <p className="font-semibold">Web: <span className="font-normal">{profile.websites[0]}</span></p>}
                    </div>
                    {profile.handle && (
                        <div className="border-2 border-gray-800 p-2 bg-gray-50">
                            <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={60} level="H" />
                        </div>
                    )}
                </div>
            </div>
            <div className="text-sm text-gray-600 font-medium mt-2">Generated with BizCard</div>
        </div>
    );

    const renderMinimalTemplate = () => (
        <div className="flex flex-col items-center gap-3">
            <div ref={cardRef} className="w-[600px] h-[350px] bg-gray-50 p-8 shadow-2xl flex flex-col justify-center items-center text-center">
                <div className="space-y-6">
                    {profile.logo_url && (
                        <img src={profile.logo_url} alt="Logo" className="h-10 mx-auto object-contain" />
                    )}
                    <div>
                        <h1 className="text-4xl font-light text-gray-900 mb-2">{profile.name}</h1>
                        <p className="text-lg text-gray-600">{profile.role}</p>
                        <p className="text-md text-gray-500">{profile.company}</p>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p>{profile.email}</p>
                        <p>{profile.phone}</p>
                        {profile.websites && profile.websites[0] && <p>{profile.websites[0]}</p>}
                    </div>
                    {profile.handle && (
                        <div className="inline-block bg-white p-2 border border-gray-300 rounded">
                            <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.handle}`} size={60} level="H" />
                        </div>
                    )}
                </div>
            </div>
            <div className="text-sm text-gray-600 font-medium mt-2">Generated with BizCard</div>
        </div>
    );

    const renderTemplate = () => {
        switch (selectedTemplate) {
            case 'Photo':
                return renderPhotoTemplate();
            case 'Modern':
                return renderModernTemplate();
            case 'Classic':
                return renderClassicTemplate();
            case 'Minimal':
                return renderMinimalTemplate();
            default:
                return renderPhotoTemplate();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Create Digital Business Card</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--color-bg-subtle))] rounded">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-[rgb(var(--color-text-primary))]">Choose Template</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {(['Photo', 'Modern', 'Classic', 'Minimal'] as BusinessCardTemplate[]).map((template) => {
                            const allowedTemplates = SUBSCRIPTION_LIMITS[subscription.tier].allowedTemplates;
                            const isLocked = !allowedTemplates.includes(template);
                            
                            return (
                                <button
                                    key={template}
                                    onClick={() => handleTemplateSelect(template)}
                                    className={`p-4 border-2 rounded-lg font-semibold transition-all relative ${
                                        selectedTemplate === template
                                            ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))]'
                                            : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-secondary))] hover:border-[rgb(var(--color-primary)/0.5)]'
                                    } ${isLocked ? 'opacity-75' : ''}`}
                                >
                                    {template}
                                    {isLocked && (
                                        <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                            PRO
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {(selectedTemplate === 'Photo' || selectedTemplate === 'Modern') && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-[rgb(var(--color-text-primary))]">Customize Colors</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">From Color</label>
                                <input
                                    type="color"
                                    value={cardColors.from}
                                    onChange={(e) => handleColorChange('from', e.target.value)}
                                    className="w-full h-12 rounded cursor-pointer border-2 border-[rgb(var(--color-border))]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">Via Color</label>
                                <input
                                    type="color"
                                    value={cardColors.via}
                                    onChange={(e) => handleColorChange('via', e.target.value)}
                                    className="w-full h-12 rounded cursor-pointer border-2 border-[rgb(var(--color-border))]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">To Color</label>
                                <input
                                    type="color"
                                    value={cardColors.to}
                                    onChange={(e) => handleColorChange('to', e.target.value)}
                                    className="w-full h-12 rounded cursor-pointer border-2 border-[rgb(var(--color-border))]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Company Logo</h3>
                        <button
                            onClick={() => setShowLogoUpload(!showLogoUpload)}
                            className="px-3 py-1 text-sm font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded hover:opacity-90"
                        >
                            {profile.logo_url ? 'Change Logo' : 'Upload Logo'}
                        </button>
                    </div>
                    {profile.logo_url && (
                        <div className="flex items-center gap-4 p-4 bg-[rgb(var(--color-bg-secondary))] rounded">
                            <img src={profile.logo_url} alt="Logo" className="h-16 object-contain" />
                            <button
                                onClick={removeLogo}
                                className="px-3 py-1 text-sm bg-[rgb(var(--color-danger))] text-white rounded hover:opacity-90"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    {showLogoUpload && (
                        <div className="mt-3 p-4 bg-[rgb(var(--color-bg-secondary))] rounded border-2 border-dashed border-[rgb(var(--color-border))]">
                            <label className="flex flex-col items-center gap-2 cursor-pointer">
                                <CameraIcon className="h-12 w-12 text-[rgb(var(--color-text-subtle))]" />
                                <span className="text-sm text-[rgb(var(--color-text-secondary))]">Click to upload logo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>

                <div className="mb-6 flex justify-center bg-gray-100 p-6 rounded-lg">
                    {renderTemplate()}
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={downloadCard}
                        className="flex items-center gap-2 px-6 py-3 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        <DownloadIcon className="h-5 w-5" />
                        Download Card
                    </button>
                    <button
                        onClick={shareCard}
                        className="flex items-center gap-2 px-6 py-3 bg-[rgb(var(--color-success))] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        <ShareIcon className="h-5 w-5" />
                        Share Card
                    </button>
                </div>
            </div>
            
            <PaywallModal 
                isOpen={showPaywall} 
                onClose={() => setShowPaywall(false)} 
                feature="all business card templates" 
            />
        </div>
    );
};

export default BusinessCardCreator;
