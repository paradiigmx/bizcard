"use client";
import React from 'react';
import { useAppContext } from '../app/provider';
import { XIcon } from './icons';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, feature }) => {
    const { upgradeToPro, subscription } = useAppContext();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        upgradeToPro();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                >
                    <XIcon className="h-6 w-6" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                        Upgrade to BizCard+ Pro
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                        Unlock {feature} and all premium features
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Free Plan */}
                    <div className="border border-[rgb(var(--color-border))] rounded-lg p-6">
                        <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">Free</h3>
                        <div className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-4">$0</div>
                        <ul className="space-y-3 text-sm text-[rgb(var(--color-text-secondary))]">
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Up to 50 contacts</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Basic business card template</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Download individual contacts</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Camera scanner</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Create events & companies</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Create lists</span>
                            </li>
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="border-2 border-blue-500 rounded-lg p-6 relative bg-gradient-to-br from-blue-50/5 to-purple-50/5">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Recommended
                        </div>
                        <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">Pro</h3>
                        <div className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                            $9.99<span className="text-sm font-normal text-[rgb(var(--color-text-secondary))]">/month</span>
                        </div>
                        <ul className="space-y-3 text-sm text-[rgb(var(--color-text-secondary))] mb-6">
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">✓</span>
                                <span className="font-semibold text-[rgb(var(--color-text-primary))]">Unlimited contacts</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">✓</span>
                                <span className="font-semibold text-[rgb(var(--color-text-primary))]">All business card templates</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">✓</span>
                                <span className="font-semibold text-[rgb(var(--color-text-primary))]">Export lists to CSV</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">✓</span>
                                <span className="font-semibold text-[rgb(var(--color-text-primary))]">Bulk email contacts</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">✓</span>
                                <span>Everything in Free</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-2">✓</span>
                                <span>Priority support</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleUpgrade}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>

                <div className="text-center text-sm text-[rgb(var(--color-text-subtle))]">
                    <p>Cancel anytime. No hidden fees. 30-day money-back guarantee.</p>
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
