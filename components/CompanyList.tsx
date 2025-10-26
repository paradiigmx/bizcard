"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Company } from '../types';
import { PlusIcon, XIcon, BuildingOfficeIcon, MapPinIcon, GlobeAltIcon, UsersIcon, StarIcon } from './icons';
import { useAppContext } from '../app/provider';
import { US_STATES } from '../constants';

interface AddCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateCompany: (companyDetails: Omit<Company, 'id'>) => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onCreateCompany }) => {
    const [company, setCompany] = useState<Omit<Company, 'id'>>({ 
        name: '', 
        description: '', 
        logo_url: '', 
        website: '', 
        location: '',
        featured: false 
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompany(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setCompany(prev => ({ ...prev, logo_url: dataUrl }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = () => {
        if (company.name.trim()) {
            onCreateCompany({
                ...company,
                name: company.name.trim(),
                description: company.description?.trim(),
                website: company.website?.trim(),
                location: company.location?.trim(),
                logo_url: company.logo_url?.trim()
            });
            setCompany({ name: '', description: '', logo_url: '', website: '', location: '', featured: false });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Create New Company</h3>
                    <button onClick={onClose}><XIcon className="h-5 w-5"/></button>
                </div>

                <input 
                    name="name" 
                    value={company.name} 
                    onChange={handleChange} 
                    placeholder="Company Name*" 
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                />
                
                <textarea 
                    name="description" 
                    value={company.description || ''} 
                    onChange={handleChange} 
                    placeholder="Company description..." 
                    rows={3} 
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        name="location" 
                        value={company.location || ''} 
                        onChange={handleChange} 
                        placeholder="Location (e.g., City, Country)" 
                        className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                    />
                    <input 
                        name="website" 
                        value={company.website || ''} 
                        onChange={handleChange} 
                        placeholder="Website URL" 
                        className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded" 
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Company Logo</label>
                    {company.logo_url && (
                        <div className="flex justify-center mb-2">
                            <img 
                                src={company.logo_url} 
                                alt="Logo preview" 
                                className="w-24 h-24 object-contain rounded-lg border-2 border-[rgb(var(--color-border))] bg-white p-2"
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
                        value={company.logo_url || ''} 
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
                        onClick={handleCreate} 
                        className="px-4 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded" 
                        disabled={!company.name.trim()}
                    >
                        Create Company
                    </button>
                </div>
            </div>
        </div>
    );
};

const CompanyList: React.FC = () => {
    const { companies, handleCreateCompany, getContactsByCompanyId, handleToggleFavoriteCompany, t } = useAppContext();
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHidden, setShowHidden] = useState(false);
    const [locationFilter, setLocationFilter] = useState('');
    const router = useRouter();
    
    const filteredCompanies = companies.filter(company => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (company.locationCity && company.locationCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (company.locationState && company.locationState.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Hidden filter
        const matchesHidden = showHidden || !company.hidden;
        
        // Location filter
        const matchesLocation = !locationFilter || 
            (company.locationState && company.locationState === locationFilter);
        
        return matchesSearch && matchesHidden && matchesLocation;
    });

    const handleSelectCompany = (companyId: string) => {
        router.push(`/companies/${companyId}`);
    };

    return (
        <div className="space-y-4">
            <AddCompanyModal 
                isOpen={isCompanyModalOpen}
                onClose={() => setIsCompanyModalOpen(false)}
                onCreateCompany={handleCreateCompany}
            />
            
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Companies</h2>
                <button 
                    onClick={() => setIsCompanyModalOpen(true)} 
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-[rgb(var(--color-primary-text))] bg-[rgb(var(--color-primary))] rounded-lg shadow hover:bg-[rgb(var(--color-primary-hover))] transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Company
                </button>
            </div>

            <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg shadow space-y-3">
                <input 
                    type="text" 
                    placeholder="Search companies..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded"
                />
                <div className="flex flex-wrap gap-3 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showHidden}
                            onChange={(e) => setShowHidden(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-[rgb(var(--color-text-secondary))]">Show Hidden</span>
                    </label>
                    <select 
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="bg-[rgb(var(--color-bg-tertiary))] p-2 rounded text-sm"
                    >
                        <option value="">All States</option>
                        {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredCompanies.length === 0 ? (
                <div className="text-center py-12 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow">
                    <BuildingOfficeIcon className="h-16 w-16 mx-auto text-[rgb(var(--color-text-subtle))] mb-4" />
                    <p className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">No companies yet!</p>
                    <p className="text-[rgb(var(--color-text-subtle))] mt-2">Click &quot;Add Company&quot; to create your first company.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCompanies.map(company => {
                        const contactCount = getContactsByCompanyId(company.id).length;
                        return (
                            <div 
                                key={company.id}
                                className={`relative overflow-hidden bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer group ${
                                    company.featured ? 'ring-2 ring-purple-500/20 bg-purple-50/30 dark:bg-purple-950/10' : ''
                                }`}
                            >
                                <div onClick={() => handleSelectCompany(company.id)} className={`p-6 pb-2 ${company.featured ? 'mb-8' : ''}`}>
                                    <div className="flex gap-4 items-start">
                                        {company.logo_url && (
                                            <div className="flex-shrink-0">
                                                <img 
                                                    src={company.logo_url} 
                                                    alt={`${company.name} logo`}
                                                    className="w-16 h-16 rounded-lg object-contain border border-[rgb(var(--color-border))] bg-white p-2"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                                {company.name}
                                            </h3>
                                            {company.description && (
                                                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1 line-clamp-2">
                                                    {company.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {company.location && (
                                            <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                                                <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{company.location}</span>
                                            </div>
                                        )}
                                        {company.website && (
                                            <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                                                <GlobeAltIcon className="h-4 w-4 flex-shrink-0" />
                                                <a 
                                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="truncate hover:text-[rgb(var(--color-primary))] hover:underline"
                                                >
                                                    {company.website}
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                                            <UsersIcon className="h-4 w-4 flex-shrink-0" />
                                            <span>{contactCount} {contactCount === 1 ? 'contact' : 'contacts'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center justify-end gap-2 px-4 pb-3 pt-2 border-t border-[rgb(var(--color-border))] ${company.featured ? 'mb-8' : ''}`}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleFavoriteCompany(company.id); }} 
                                        className={`transition-colors ${company.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-[rgb(var(--color-text-subtle))] hover:text-yellow-400'}`} 
                                        aria-label={`Favorite ${company.name}`}
                                    >
                                        <StarIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                {company.featured && (
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center z-10">
                                        <span className="text-white font-bold text-xs tracking-wider">FEATURED</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CompanyList;
