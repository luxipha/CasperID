'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';

interface RequestVerificationModalProps {
    wallet: string;
    onClose: () => void;
    onSuccess: () => void;
    onFullKycSelected?: (data: any) => void; // Callback when Full KYC is selected, passes collected data
    isUpgrade?: boolean;
    currentTier?: string;
}

export default function RequestVerificationModal({
    wallet,
    onClose,
    onSuccess,
    onFullKycSelected,
    isUpgrade = false,
    currentTier = 'basic',
}: RequestVerificationModalProps) {
    const [tier, setTier] = useState<'basic' | 'full_kyc'>(isUpgrade ? 'full_kyc' : 'basic');

    // Basic Tier (Self-Attested) - Simple fields
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [basicEmail, setBasicEmail] = useState('');
    const [location, setLocation] = useState('');

    // Full KYC Tier - Comprehensive fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [fullKycEmail, setFullKycEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // If Full KYC is selected, trigger the wizard with the collected data
        if (tier === 'full_kyc') {
            if (onFullKycSelected) {
                const fullKycData = {
                    first_name: firstName,
                    last_name: lastName,
                    date_of_birth: dateOfBirth,
                    email: fullKycEmail,
                    phone_number: phoneNumber,
                    home_address: {
                        street: streetAddress,
                        city,
                        state,
                        postal_code: postalCode,
                        country
                    }
                };
                onFullKycSelected(fullKycData); // Launch wizard in parent with data
            } else {
                onClose(); // Fallback: just close modal
            }
            return;
        }

        // Basic tier - simple self-attested data submission
        setLoading(true);
        try {
            await apiClient.requestVerification({
                wallet,
                tier: 'basic',
                name: name || undefined,
                age: age ? parseInt(age) : undefined,
                email: basicEmail || undefined,
                location: location || undefined,
            });

            alert('Verification request submitted successfully!');
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to submit verification request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <Card className="max-w-2xl w-full bg-slate-800 border-slate-700 p-6 my-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {isUpgrade ? 'Upgrade to Full KYC' : 'Request Verification'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Wallet (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="wallet" className="text-white">
                            Wallet Address
                        </Label>
                        <Input
                            id="wallet"
                            value={wallet}
                            readOnly
                            className="bg-slate-700 border-slate-600 text-gray-300 font-mono text-sm"
                        />
                    </div>

                    {/* Tier Selection */}
                    {!isUpgrade && (
                        <div className="space-y-2">
                            <Label className="text-white">Verification Tier</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTier('basic')}
                                    className={`p-4 rounded-lg border-2 transition ${tier === 'basic'
                                        ? 'border-purple-500 bg-purple-500/20 text-white'
                                        : 'border-slate-600 bg-slate-700 text-gray-300 hover:border-slate-500'
                                        }`}
                                >
                                    <div className="font-semibold">Basic</div>
                                    <div className="text-xs mt-1 opacity-80">Self-Attested</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTier('full_kyc')}
                                    className={`p-4 rounded-lg border-2 transition ${tier === 'full_kyc'
                                        ? 'border-purple-500 bg-purple-500/20 text-white'
                                        : 'border-slate-600 bg-slate-700 text-gray-300 hover:border-slate-500'
                                        }`}
                                >
                                    <div className="font-semibold">Full KYC</div>
                                    <div className="text-xs mt-1 opacity-80">ID + Liveness</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upgrade Message */}
                    {isUpgrade && (
                        <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 text-sm">
                            <div className="font-semibold mb-1">Upgrading to Full KYC</div>
                            <div>This will enable liveness verification and additional security features.</div>
                        </div>
                    )}

                    {/* BASIC TIER FORM - Simple Self-Attested */}
                    {tier === 'basic' && (
                        <div className="space-y-3">
                            <Label className="text-white font-semibold">Basic Information</Label>
                            <p className="text-xs text-gray-400">Self-attested information (not verified)</p>

                            <Input
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    type="number"
                                    placeholder="Age"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                                <Input
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>

                            <Input
                                type="email"
                                placeholder="Email"
                                value={basicEmail}
                                onChange={(e) => setBasicEmail(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                    )}

                    {/* FULL KYC FORM - Comprehensive Verified */}
                    {tier === 'full_kyc' && (
                        <>
                            {/* Personal Information */}
                            <div className="space-y-3">
                                <Label className="text-white font-semibold">Personal Information</Label>

                                {/* Name */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="First Name *"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                    <Input
                                        placeholder="Last Name *"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                {/* DOB */}
                                <div>
                                    <Input
                                        type="date"
                                        placeholder="Date of Birth *"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                {/* Contact */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        type="email"
                                        placeholder="Email Address *"
                                        value={fullKycEmail}
                                        onChange={(e) => setFullKycEmail(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                    <Input
                                        type="tel"
                                        placeholder="Phone Number *"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="space-y-3">
                                <Label className="text-white font-semibold">Address</Label>

                                <Input
                                    placeholder="Street Address *"
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                    required
                                    className="bg-slate-700 border-slate-600 text-white"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="City *"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                    <Input
                                        placeholder="State/Province *"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="Postal Code *"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                    <Input
                                        placeholder="Country *"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        required
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>
                        </>
                    )}



                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : tier === 'full_kyc' ? (
                            'Next: ID Upload'
                        ) : (
                            'Submit Request'
                        )}
                    </Button>
                </form>

                {/* Info */}
                <p className="text-xs text-gray-400 mt-4 text-center">
                    Your data is encrypted and only used for verification.
                </p>
            </Card>
        </div>
    );
}
