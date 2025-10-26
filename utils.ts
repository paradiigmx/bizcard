import type { Contact } from './types';

export function downloadICS(summary: string, startISO: string, durationMinutes = 5) {
  const dt = (s: string) => s.replace(/[-:]/g, '').split('.')[0] + 'Z';
  const start = new Date(startISO);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BizCard//EN', 'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(start.toISOString())}`,
    `DTEND:${dt(end.toISOString())}`,
    `SUMMARY:${summary}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'follow-up.ics'; a.click();
  URL.revokeObjectURL(url);
}

export function exportContactsCSV(rows: Contact[]): Blob {
  const headers = ['Name', 'Role', 'Company', 'Email', 'Phone', 'City', 'State', 'Country', 'Tags'];
  const lines = rows.map(c => [
    c.name, c.role, c.company, c.email, c.phone,
    c.address?.city || '', c.address?.state || '', c.address?.country || '',
    (c.tags || []).join('|')
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  return blob;
}

export async function compressImage(file: File, maxWidth = 200, maxHeight = 200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        const isPNG = file.type === 'image/png';
        const compressedDataUrl = isPNG 
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export function getAvatar(contact: Partial<Contact>): string {
    if (contact.image_url) {
        return contact.image_url;
    }

    const SEED = contact.id || contact.name || 'default';
    const hash = SEED.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarId = (hash % 3) + 1;
    return `/default-avatars/${avatarId}.svg`;
}

export function sendEmailToContacts(contacts: Contact[], subject: string = ''): void {
  const emails = contacts
    .filter(c => c.email && c.email.trim())
    .map(c => c.email.trim())
    .filter((email, index, self) => self.indexOf(email) === index); // Remove duplicates

  if (emails.length === 0) {
    alert('No email addresses found for the selected contacts.');
    return;
  }

  const mailtoLink = `mailto:?bcc=${encodeURIComponent(emails.join(','))}${subject ? `&subject=${encodeURIComponent(subject)}` : ''}`;
  window.location.href = mailtoLink;
}
