"use client";
import React from 'react';
import type { Contact } from '../types';
import { DownloadIcon, PlusIcon, LinkIcon, ShareIcon } from './icons';
import Link from 'next/link';

interface PublicProfileProps {
    contact: Contact;
}

const generateVCF = (contact: Contact) => {
    const { name, role, company, email, phone, address, websites } = contact;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    let vcf = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${name}
ORG:${company}
TITLE:${role}
TEL;TYPE=WORK,VOICE:${phone}
EMAIL:${email}
ADR;TYPE=WORK:;;${address.street};${address.city};${address.state};${address.postal_code};${address.country}
`;
    (websites || []).forEach(url => {
        if(url) vcf += `URL:${url}\n`;
    });
    vcf += `END:VCARD`;

    return vcf;
};

const PublicProfile: React.FC<PublicProfileProps> = ({ contact }) => {

    const handleDownloadVCF = () => {
        const vcfData = generateVCF(contact);
        const blob = new Blob([vcfData], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${contact.name.replace(/\s/g, '_')}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleShare = async () => {
        const shareData = {
            title: `BizCard Contact: ${contact.name}`,
            text: `Connect with ${contact.name} from ${contact.company}.`,
            url: window.location.href,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
            } catch (err) {
                alert('Could not copy link. Please copy it from the address bar.');
            }
        }
    };

    const formatAddress = (address: Contact['address']) => {
        if (!address) return '';
        const parts = [address.street, address.city, address.state, address.postal_code, address.country];
        return parts.filter(Boolean).join(', ');
    };
    
    const addToContactsLink = contact.handle ? `/contacts/add?prefill=${contact.handle}` : '/';

    return (
        <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-lg space-y-5 max-w-md mx-auto">
             <header className="text-center border-b border-[rgb(var(--color-border))] pb-4">
                <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">
                    BizCard
                </h1>
                <p className="text-sm text-[rgb(var(--color-text-subtle))]">Powered by Paradiigm</p>
             </header>
            <div className="space-y-3 text-center">
                <div>
                    <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{contact.name}</h2>
                    <p className="text-lg text-[rgb(var(--color-text-secondary))]">{contact.role} at {contact.company}</p>
                </div>
                <div className="text-[rgb(var(--color-text-primary))]">
                    <p><a href={`mailto:${contact.email}`} className="text-[rgb(var(--color-primary))] hover:underline">{contact.email}</a></p>
                    <p><a href={`tel:${contact.phone}`} className="text-[rgb(var(--color-primary))] hover:underline">{contact.phone}</a></p>
                    {formatAddress(contact.address) && <p className="text-[rgb(var(--color-text-secondary))] pt-1">{formatAddress(contact.address)}</p>}
                </div>
                {(contact.websites && contact.websites.length > 0) && (
                    <div className="space-y-1 pt-2">
                        {contact.websites.map((site, index) => (
                            <p key={index} className="flex items-center justify-center gap-2">
                                <LinkIcon className="h-4 w-4 text-[rgb(var(--color-text-subtle))]" />
                                <a href={site} target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--color-primary))] hover:underline truncate">{site}</a>
                            </p>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
                 <button 
                    onClick={handleShare} 
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow hover:opacity-80 transition-colors"
                >
                    <ShareIcon className="h-5 w-5" />
                    Share Profile
                </button>
                <button 
                    onClick={handleDownloadVCF} 
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-emerald-600 rounded-lg shadow hover:bg-emerald-700 transition-colors"
                >
                    <DownloadIcon className="h-5 w-5" />
                    Save to Contacts (.vcf)
                </button>
                <Link 
                    href={addToContactsLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:bg-[rgb(var(--color-primary-hover))] transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add to BizCard
                </Link>
            </div>
        </div>
    );
};

export default PublicProfile;