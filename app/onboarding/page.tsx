"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleGenAI, Type } from "@google/genai";
import { useAppContext } from '../provider';
import { CameraIcon, XIcon } from '@/components/icons';
import Image from 'next/image';
import type { Contact } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { handleUpdateMyProfile, myProfile } = useAppContext();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<Contact>>({
    name: '',
    role: '',
    company: '',
    email: '',
    phone: '',
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  }, [isCameraOpen]);

  const openCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        streamRef.current = stream;
        setIsCameraOpen(true);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        const error = err as Error;
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          alert('Camera permission denied. Please allow camera access in your browser settings and try again.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          alert('No camera found on this device. Please use a device with a camera or enter your details manually.');
        } else {
          alert("Could not access camera. Please ensure permissions are granted.");
        }
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const snapPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(imageData);
        closeCamera();
        processBusinessCard(imageData);
      }
    }
  };

  const processBusinessCard = async (imageData: string) => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) {
      alert("AI API key is not configured. Please set it up in your environment.");
      return;
    }

    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const base64Data = imageData.split(',')[1];
      const imagePart = { inlineData: { data: base64Data, mimeType: "image/jpeg" } };
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { 
          parts: [
            { text: "Extract the contact information from this business card. Provide the person's full name, job title/role, company name, email address, and phone number. If any field is not clearly visible or missing, return an empty string for that field." },
            imagePart
          ] 
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              company: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
            }
          }
        }
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      
      if (!parsedData.name && !parsedData.email) {
        throw new Error('Could not extract contact information from the image.');
      }

      setProfileData({
        name: parsedData.name || '',
        role: parsedData.role || '',
        company: parsedData.company || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
      });
    } catch (error) {
      console.error("Error processing business card:", error);
      alert("Failed to process business card. Please try again or enter your details manually.");
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('bc_onboarding_skipped', 'true');
    router.push('/');
  };

  const handleCompleteProfile = () => {
    if (!profileData.name || !profileData.email) {
      alert('Please provide at least your name and email to continue.');
      return;
    }

    const updatedProfile: Contact = {
      ...myProfile,
      name: profileData.name,
      role: profileData.role || '',
      company: profileData.company || '',
      email: profileData.email,
      phone: profileData.phone || '',
      handle: profileData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      address: myProfile.address || { street: '', city: '', state: '', postal_code: '', country: 'United States' },
    };

    handleUpdateMyProfile(updatedProfile);
    localStorage.setItem('bc_onboarding_skipped', 'false');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Image src="/bizcard-icon.png" alt="BizCard+" width={64} height={64} />
              <h1 className="text-3xl font-bold ml-3">Welcome to BizCard+</h1>
            </div>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Let's get your profile set up. Scan your business card to automatically fill in your details!
            </p>
          </div>

          {isCameraOpen && (
            <div className="fixed inset-0 bg-black z-50 flex flex-col">
              <div className="flex justify-between items-center p-4 bg-black/80">
                <h3 className="text-white font-semibold">Scan Your Business Card</h3>
                <button onClick={closeCamera} className="text-white">
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Business card aspect ratio guide (7:4 ratio like a real business card) */}
                <div className="relative z-10 w-[92%] max-w-[850px]" style={{ aspectRatio: '7/4' }}>
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-[rgb(var(--color-primary))]"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-[rgb(var(--color-primary))]"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-[rgb(var(--color-primary))]"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-[rgb(var(--color-primary))]"></div>
                  </div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              <div className="p-6 bg-black/80">
                <button
                  onClick={snapPhoto}
                  className="w-full py-4 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-opacity"
                >
                  Capture business card
                </button>
              </div>
            </div>
          )}

          {capturedImage && !isProcessing && (
            <div className="mb-6">
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={capturedImage}
                  alt="Captured business card"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setProfileData({ name: '', role: '', company: '', email: '', phone: '' });
                }}
                className="text-sm text-[rgb(var(--color-primary))] hover:underline"
              >
                Retake Photo
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(var(--color-primary))]"></div>
              <p className="mt-4 text-[rgb(var(--color-text-secondary))]">Processing your business card...</p>
            </div>
          )}

          {!isCameraOpen && !isProcessing && (
            <>
              {!capturedImage && (
                <button
                  onClick={openCamera}
                  className="w-full mb-6 py-4 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <CameraIcon className="h-5 w-5" />
                  Scan Business Card
                </button>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={profileData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-3 rounded-lg"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role/Title</label>
                  <input
                    type="text"
                    value={profileData.role || ''}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-3 rounded-lg"
                    placeholder="Your job title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={profileData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-3 rounded-lg"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-3 rounded-lg"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-[rgb(var(--color-bg-tertiary))] p-3 rounded-lg"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkipOnboarding}
                  className="flex-1 py-3 bg-[rgb(var(--color-bg-tertiary))] rounded-lg font-semibold"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleCompleteProfile}
                  className="flex-1 py-3 bg-[rgb(var(--color-primary))] text-white rounded-lg font-semibold"
                >
                  Complete Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
