import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VerificationRequest } from '@/lib/api-client';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface StepPersonalInfoProps {
    data: Partial<VerificationRequest>;
    onUpdate: (data: Partial<VerificationRequest>) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepPersonalInfo({ data, onUpdate, onNext, onBack }: StepPersonalInfoProps) {
    const [firstName, setFirstName] = useState(data.first_name || '');
    const [lastName, setLastName] = useState(data.last_name || '');
    const [dateOfBirth, setDateOfBirth] = useState(data.date_of_birth || '');
    const [email, setEmail] = useState(data.email || '');
    const [phoneNumber, setPhoneNumber] = useState(data.phone_number || '');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const handleNext = () => {
        onUpdate({
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            email,
            phone_number: phoneNumber,
            home_address: {
                street: streetAddress,
                city,
                state,
                postal_code: postalCode,
                country
            } as any
        });
        onNext();
    };

    const isValid = firstName && lastName && dateOfBirth && email && phoneNumber &&
        streetAddress && city && state && postalCode && country;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                <p className="text-sm text-gray-400">
                    Provide your verified personal details for KYC compliance
                </p>
            </div>

            <div className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-white">First Name *</Label>
                        <Input
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-white">Last Name *</Label>
                        <Input
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                    </div>
                </div>

                {/* DOB */}
                <div>
                    <Label className="text-white">Date of Birth *</Label>
                    <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-white">Email *</Label>
                        <Input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-white">Phone Number *</Label>
                        <Input
                            type="tel"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-3 pt-4 border-t border-slate-700">
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
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <Button
                    type="button"
                    onClick={onBack}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isValid}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                >
                    Next: ID Upload
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
