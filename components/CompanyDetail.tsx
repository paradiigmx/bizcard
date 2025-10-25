"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Company, Contact, Event } from '../types';
import { ArrowLeftIcon, EditIcon, SaveIcon, XIcon, BuildingOfficeIcon, MapPinIcon, GlobeAltIcon, UsersIcon, TrashIcon, MailIcon, PhoneIcon, IdentificationIcon, CalendarIcon, EyeIcon, EyeOffIcon } from './icons';
import { useAppContext } from '../app/provider';
import { getDefaultAvatar, sendEmailToContacts } from '../utils';

interface EditCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company;
    onUpdateCompany: (company: Company) => void;
}

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ isOpen, onClose, company, onUpdateCompany }) => {
    const [editedCompany, setEditedCompany] = useState<Company>(company);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedCompany(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setEditedCompany(prev => ({ ...prev, logo_url: dataUrl }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onUpdateCompany({
            ...editedCompany,
            name: editedCompany.name.trim(),
            description: editedCompany.description?.trim(),
            email: editedCompany.email?.trim(),
            phone: editedCompany.phone?.trim(),
            website: editedCompany.website?.trim(),
            location: editedCompany.location?.trim(),
            logo_url: editedCompany.logo_url?.trim()
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Edit Company</h3>
                    <button onClick={onClose}><XIcon className="h-5 w-5"/></button>
                </div>

                <input 
                    name="name" 
                    value={editedCompany.name} 
                    onChange={handleChange} 
                    placeholder="Company Name*" 
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                />
                
                <textarea 
                    name="description" 
                    value={editedCompany.description || ''} 
                    onChange={handleChange} 
                    placeholder="Company description..." 
                    rows={3} 
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        name="email" 
                        value={editedCompany.email || ''} 
                        onChange={handleChange} 
                        placeholder="Email" 
                        type="email"
                        className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                    />
                    <input 
                        name="phone" 
                        value={editedCompany.phone || ''} 
                        onChange={handleChange} 
                        placeholder="Phone" 
                        type="tel"
                        className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                    />
                    <input 
                        name="website" 
                        value={editedCompany.website || ''} 
                        onChange={handleChange} 
                        placeholder="Website URL" 
                        className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                    />
                    <input 
                        name="location" 
                        value={editedCompany.location || ''} 
                        onChange={handleChange} 
                        placeholder="Location (e.g., City, Country)" 
                        className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Company Logo</label>
                    {editedCompany.logo_url && (
                        <div className="flex justify-center mb-2">
                            <img 
                                src={editedCompany.logo_url} 
                                alt="Logo preview" 
                                className="w-24 h-24 object-cover rounded-lg border-2 border-[rgb(var(--color-border))]"
                            />
                        </div>
                    )}
                    <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[rgb(var(--color-bg-subtle))] rounded border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors">
                                <BuildingOfficeIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Upload Logo</span>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <input 
                        name="logo_url" 
                        value={editedCompany.logo_url || ''} 
                        onChange={handleChange} 
                        placeholder="Or paste logo URL" 
                        className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded text-sm" 
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-4 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded" 
                        disabled={!editedCompany.name.trim()}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

interface CompanyDetailProps {
    companyId: string;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ companyId }) => {
    const router = useRouter();
    const { getCompanyById, handleUpdateCompany, handleDeleteCompany, handleToggleHideCompany, getContactsByCompanyId, events, settings } = useAppContext();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const company = getCompanyById(companyId);
    const contacts = getContactsByCompanyId(companyId);
    const linkedEvents = events.filter(event => event.companyId === companyId);

    if (!company) {
        return (
            <div className="text-center py-12">
                <BuildingOfficeIcon className="h-16 w-16 mx-auto text-[rgb(var(--color-text-subtle))] mb-4" />
                <p className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Company not found</p>
                <button 
                    onClick={() => router.push('/companies')}
                    className="mt-4 text-[rgb(var(--color-primary))] hover:underline"
                >
                    Back to Companies
                </button>
            </div>
        );
    }

    const handleDelete = () => {
        handleDeleteCompany(companyId);
        router.push('/companies');
    };

    const handleContactClick = (contactId: string) => {
        router.push(`/contacts/${contactId}`);
    };

    const handleEventClick = (eventId: string) => {
        router.push(`/events/${eventId}`);
    };

    return (
        <div className="space-y-6">
            <EditCompanyModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                company={company}
                onUpdateCompany={handleUpdateCompany}
            />

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                    <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Delete Company?</h3>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                            Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.
                            {contacts.length > 0 && (
                                <span className="block mt-2 text-[rgb(var(--color-warning))]">
                                    Note: {contacts.length} contact{contacts.length !== 1 ? 's are' : ' is'} linked to this company.
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 font-semibold bg-[rgb(var(--color-bg-subtle))] rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2 font-semibold bg-[rgb(var(--color-danger))] text-white rounded"
                            >
                                Delete Company
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 sm:p-6 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow space-y-4">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => router.push('/companies')} 
                        className="flex items-center gap-2 text-[rgb(var(--color-primary))] hover:underline"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Companies
                    </button>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleToggleHideCompany(companyId)} 
                            className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]"
                            title={company.hidden ? "Show Company" : "Hide Company"}
                        >
                            {company.hidden ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                        </button>
                        <button 
                            onClick={() => setIsEditModalOpen(true)} 
                            className="p-2 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]"
                        >
                            <EditIcon className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-2 text-[rgb(var(--color-danger))] hover:opacity-80"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    {company.logo_url && (
                        <div className="flex-shrink-0">
                            <img 
                                src={company.logo_url} 
                                alt={`${company.name} logo`}
                                className="w-24 h-24 rounded-lg object-cover border-2 border-[rgb(var(--color-border))]"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                            {company.name}
                        </h1>
                        {company.description && (
                            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                                {company.description}
                            </p>
                        )}
                        <div className="space-y-2">
                            {company.email && (
                                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                                    <MailIcon className="h-5 w-5 flex-shrink-0" />
                                    <a 
                                        href={`mailto:${company.email}`}
                                        className="hover:text-[rgb(var(--color-primary))] hover:underline"
                                    >
                                        {company.email}
                                    </a>
                                </div>
                            )}
                            {company.phone && (
                                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                                    <PhoneIcon className="h-5 w-5 flex-shrink-0" />
                                    <a 
                                        href={`tel:${company.phone}`}
                                        className="hover:text-[rgb(var(--color-primary))] hover:underline"
                                    >
                                        {company.phone}
                                    </a>
                                </div>
                            )}
                            {company.website && (
                                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                                    <GlobeAltIcon className="h-5 w-5 flex-shrink-0" />
                                    <a 
                                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-[rgb(var(--color-primary))] hover:underline"
                                    >
                                        {company.website}
                                    </a>
                                </div>
                            )}
                            {company.location && (
                                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                                    <MapPinIcon className="h-5 w-5 flex-shrink-0" />
                                    <span>{company.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                        Contacts ({contacts.length})
                    </h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => sendEmailToContacts(contacts)} 
                            className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-[rgb(var(--color-success))] rounded-lg shadow hover:opacity-90 transition-opacity"
                            disabled={contacts.length === 0}
                        >
                            <MailIcon className="h-5 w-5" />
                            Email All
                        </button>
                        <button
                            onClick={() => router.push(`/contacts/add?companyId=${companyId}`)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:opacity-90 transition-opacity"
                        >
                            <UsersIcon className="h-5 w-5" />
                            Add Contact to Company
                        </button>
                    </div>
                </div>

                {contacts.length === 0 ? (
                    <div className="text-center py-12 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                        <UsersIcon className="h-16 w-16 mx-auto text-[rgb(var(--color-text-subtle))] mb-4" />
                        <p className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">No contacts yet</p>
                        <p className="text-[rgb(var(--color-text-subtle))] mt-2">
                            Contacts linked to this company will appear here.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {contacts.map(contact => {
                            const avatarSrc = contact.image_url || getDefaultAvatar(settings.theme.toLowerCase());
                            return (
                                <li 
                                    key={contact.id}
                                    onClick={() => handleContactClick(contact.id)}
                                    className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-4"
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <img 
                                                src={avatarSrc} 
                                                alt={contact.name} 
                                                className="w-16 h-16 rounded-full object-cover object-center border-2 border-[rgb(var(--color-border))]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-bold text-[rgb(var(--color-primary))]">
                                                {contact.name}
                                            </p>
                                            <p className="text-[rgb(var(--color-text-secondary))]">
                                                {contact.role}
                                            </p>
                                            <span className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium bg-teal-500/10 text-teal-800 dark:text-teal-300 rounded-md">
                                                <IdentificationIcon className="h-3 w-3" />
                                                {contact.contactType}
                                            </span>
                                            <div className="flex gap-4 mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
                                                {contact.email && (
                                                    <a 
                                                        href={`mailto:${contact.email}`} 
                                                        className="flex items-center gap-1.5 hover:text-[rgb(var(--color-primary))]" 
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MailIcon className="h-4 w-4" />
                                                        <span className="truncate">{contact.email}</span>
                                                    </a>
                                                )}
                                                {contact.phone && (
                                                    <a 
                                                        href={`tel:${contact.phone}`} 
                                                        className="flex items-center gap-1.5 hover:text-[rgb(var(--color-primary))]" 
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <PhoneIcon className="h-4 w-4" />
                                                        <span>{contact.phone}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                        Events ({linkedEvents.length})
                    </h2>
                </div>

                {linkedEvents.length === 0 ? (
                    <div className="text-center py-12 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                        <CalendarIcon className="h-16 w-16 mx-auto text-[rgb(var(--color-text-subtle))] mb-4" />
                        <p className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">No events yet</p>
                        <p className="text-[rgb(var(--color-text-subtle))] mt-2">
                            Events linked to this company will appear here.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {linkedEvents.map(event => (
                            <li 
                                key={event.id}
                                onClick={() => handleEventClick(event.id)}
                                className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-4"
                            >
                                <div className="flex gap-4">
                                    {event.image_url && (
                                        <div className="flex-shrink-0">
                                            <img 
                                                src={event.image_url} 
                                                alt={event.name} 
                                                className="w-16 h-16 rounded-lg object-cover border-2 border-[rgb(var(--color-border))]"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-bold text-[rgb(var(--color-primary))]">
                                            {event.name}
                                        </p>
                                        {event.date && (
                                            <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] mt-1">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                        )}
                                        {event.location && (
                                            <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] mt-1">
                                                <MapPinIcon className="h-4 w-4" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                        {event.description && (
                                            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-2 line-clamp-2">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CompanyDetail;
