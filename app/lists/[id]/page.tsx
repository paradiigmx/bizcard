"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppContext } from '../../provider';
import { ListsIcon, ArrowLeftIcon, TrashIcon, UserIcon, DownloadIcon, ShareIcon, MailIcon } from '@/components/icons';
import { sendEmailToContacts } from '@/utils';
import type { Contact } from '@/types';

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;
  
  const { lists, contacts, handleRemoveContactFromList, handleDeleteList } = useAppContext();
  
  const list = lists.find(l => l.id === listId);
  
  if (!list) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">List not found</h2>
          <button
            onClick={() => router.push('/lists')}
            className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg"
          >
            Back to Lists
          </button>
        </div>
      </div>
    );
  }

  const listContacts = contacts.filter(c => list.contactIds.includes(c.id));

  const handleRemove = (contactId: string, contactName: string) => {
    if (window.confirm(`Remove ${contactName} from this list?`)) {
      handleRemoveContactFromList(list.id, contactId);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the list "${list.name}"?`)) {
      handleDeleteList(list.id);
      router.push('/lists');
    }
  };

  const generateVCF = (contact: Contact) => {
    const { name, role, company, email, phone, address, websites } = contact;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    let vcf = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${name}
ORG:${company || ''}
TITLE:${role || ''}
TEL;TYPE=WORK,VOICE:${phone || ''}
EMAIL:${email || ''}
ADR;TYPE=WORK:;;${address?.street || ''};${address?.city || ''};${address?.state || ''};${address?.postal_code || ''};${address?.country || ''}
`;
    (websites || []).forEach(url => {
      if(url) vcf += `URL:${url}\n`;
    });
    vcf += `END:VCARD`;

    return vcf;
  };

  const handleDownloadContact = (contact: Contact) => {
    const vcfData = generateVCF(contact);
    const file = new File([vcfData], `${contact.name.replace(/\s/g, '_')}.vcf`, { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareContact = async (contact: Contact) => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      alert('Sharing is not supported on this device. Please use the download button instead.');
      return;
    }

    const shareData: ShareData = {
      title: `Contact: ${contact.name}`,
      text: `${contact.name} - ${contact.role} at ${contact.company}`,
    };

    const vcfData = generateVCF(contact);
    const file = new File([vcfData], `${contact.name.replace(/\s/g, '_')}.vcf`, { type: 'text/vcard;charset=utf-8' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      shareData.files = [file];
    }

    try {
      await navigator.share(shareData);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing contact:', err);
      }
    }
  };

  const handleEmailContact = (contact: Contact) => {
    if (contact.email) {
      window.location.href = `mailto:${contact.email}`;
    } else {
      alert('This contact does not have an email address.');
    }
  };

  const generateListCSV = (forSharing: boolean = false) => {
    const headers = ["Name", "Role", "Company", "Email", "Phone", "Notes", "Tags", "Contact Type"];
    const rows = listContacts.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.role || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      `"${(c.tags || []).map(tag => tag.replace(/"/g, '""')).join('; ')}"`,
      `"${(c.contactType || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

    if (forSharing) {
      const fileName = `${list.name.replace(/\s+/g, '_')}_contacts.csv`;
      return new File([csvContent], fileName, { type: "text/csv;charset=utf-8" });
    }
      
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${list.name.replace(/\s+/g, '_')}_contacts.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      alert('Sharing is not supported on this device. Please use the download button instead.');
      return;
    }

    const file = generateListCSV(true) as File;
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${list.name} Contacts`,
          text: `Here are the contacts from the list: ${list.name}.`,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing list:', err);
        }
      }
    } else {
      alert('File sharing is not supported on this device. Please use the download button instead.');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] pt-16">
      <div className="px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/lists')}
            className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-[rgb(var(--color-text-primary))]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: list.color || '#3b82f6' }}
              >
                <ListsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{list.name}</h1>
                {list.description && (
                  <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">{list.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {listContacts.length > 0 && (
              <>
                <button
                  onClick={() => sendEmailToContacts(listContacts)}
                  className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
                  aria-label="Send Email"
                >
                  <MailIcon className="h-5 w-5 text-[rgb(var(--color-text-secondary))]" />
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
                    aria-label="Share List"
                  >
                    <ShareIcon className="h-5 w-5 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                )}
                <button
                  onClick={() => generateListCSV(false)}
                  className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
                  aria-label="Download CSV"
                >
                  <DownloadIcon className="h-5 w-5 text-[rgb(var(--color-text-secondary))]" />
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <TrashIcon className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Contact Count */}
        <div className="mb-6 text-[rgb(var(--color-text-secondary))]">
          {listContacts.length} {listContacts.length === 1 ? 'contact' : 'contacts'}
        </div>

        {/* Contacts List */}
        {listContacts.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 mx-auto mb-4 text-[rgb(var(--color-text-tertiary))]" />
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">No contacts in this list</h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Use the multi-select feature on the Contacts page to add contacts to this list
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg"
            >
              Go to Contacts
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {listContacts.map(contact => (
              <div
                key={contact.id}
                className="bg-[rgb(var(--color-bg-secondary))] rounded-xl border border-[rgb(var(--color-border))] p-4"
              >
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                    className="flex-1 cursor-pointer"
                  >
                    <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">{contact.name}</h3>
                    {contact.role && (
                      <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">{contact.role}</p>
                    )}
                    {contact.company && (
                      <p className="text-sm text-[rgb(var(--color-text-tertiary))] mt-1">{contact.company}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEmailContact(contact)}
                      className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
                      aria-label="Email Contact"
                    >
                      <MailIcon className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                    </button>
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                      <button
                        onClick={() => handleShareContact(contact)}
                        className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
                        aria-label="Share Contact"
                      >
                        <ShareIcon className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadContact(contact)}
                      className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
                      aria-label="Download Contact"
                    >
                      <DownloadIcon className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                    </button>
                    <button
                      onClick={() => handleRemove(contact.id, contact.name)}
                      className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
                      aria-label="Remove from List"
                    >
                      <TrashIcon className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
