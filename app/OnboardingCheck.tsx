"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from './provider';

export default function OnboardingCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const { myProfile, handleSaveContact, handleUpdateMyProfile } = useAppContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isOnboardingPath = pathname === '/onboarding';
    const isPublicProfilePath = pathname?.startsWith('/u/');

    if (isOnboardingPath || isPublicProfilePath) {
      return;
    }

    const hasSkippedOnboarding = localStorage.getItem('bc_onboarding_skipped') === 'true';
    
    const needsOnboarding = !hasSkippedOnboarding && (
                           !myProfile.email || 
                           myProfile.email === 'alex.doe@gemini.dev' ||
                           myProfile.name === 'Alex Doe'
                           );

    if (needsOnboarding) {
      router.push('/onboarding');
      return;
    }

    const pendingContact = localStorage.getItem('bc_pending_contact');
    if (pendingContact) {
      try {
        const contactData = JSON.parse(pendingContact);
        const newContact = {
          ...contactData,
          id: undefined as any,
          isFavorite: false,
          notes: `Added via QR code scan before app setup`,
        };
        delete newContact.id;
        handleSaveContact(newContact);
        localStorage.removeItem('bc_pending_contact');
        
        alert(`Welcome! ${contactData.name} has been added to your contacts.`);
      } catch (e) {
        console.error('Error processing pending contact:', e);
        localStorage.removeItem('bc_pending_contact');
      }
    }
  }, [pathname, myProfile, router, handleSaveContact, handleUpdateMyProfile]);

  return null;
}
