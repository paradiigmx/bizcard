import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();
    
    // Build VCF 3.0 format (vCard)
    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name || ''}`,
      profile.email ? `EMAIL:${profile.email}` : '',
      profile.phone ? `TEL:${profile.phone}` : '',
      profile.role ? `TITLE:${profile.role}` : '',
      profile.company ? `ORG:${profile.company}` : '',
      profile.address ? `ADR:;;${profile.address.street || ''};${profile.address.city || ''};${profile.address.state || ''};${profile.address.postal_code || ''};${profile.address.country || ''}` : '',
      profile.notes ? `NOTE:${profile.notes}` : '',
    ];

    // Add all websites
    if (profile.websites && Array.isArray(profile.websites)) {
      profile.websites.forEach((url: string) => {
        if (url && url.trim()) {
          vcardLines.push(`URL:${url.trim()}`);
        }
      });
    }

    vcardLines.push('END:VCARD');
    
    const vcard = vcardLines.filter(line => line && !line.endsWith(':')).join('\r\n');

    return new NextResponse(vcard, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard',
        'Content-Disposition': `attachment; filename="${(profile.name || 'contact').replace(/\s+/g, '_')}.vcf"`,
      },
    });
  } catch (error) {
    console.error('Error generating VCF:', error);
    return NextResponse.json({ error: 'Failed to generate VCF' }, { status: 500 });
  }
}
