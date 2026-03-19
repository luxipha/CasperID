
import React, { useState } from 'react';

interface DocumentData {
    document_type: string;
    document_number: string;
    nin: string; // National ID Number
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    address: string;
    phone_number: string;
    upload_id?: string;
}

interface KYCManualEntryProps {
    extractedData: DocumentData;
    uploadId: string;
    onBack: () => void;
    onNext: (data: DocumentData) => void;
    onCancel: () => void;
}

export const KYCManualEntry: React.FC<KYCManualEntryProps> = ({
    extractedData,
    uploadId,
    onBack,
    onNext,
    onCancel
}) => {
    const [formData, setFormData] = useState(extractedData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.document_number.trim()) newErrors.document_number = 'Document number is required';
        if (!formData.date_of_birth.trim()) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
        if (formData.document_type === 'national_id' && !formData.nin?.trim()) newErrors.nin = 'NIN is required for National ID';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onNext({ ...formData, upload_id: uploadId });
        }
    };

    const getDocTypeName = () => {
        switch (formData.document_type) {
            case 'passport': return 'Passport';
            case 'drivers_license': return "Driver's License";
            case 'national_id': return 'National ID';
            default: return 'Document';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group mb-6"
            >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to Upload
            </button>

            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
                    Verify Extracted Data
                </h1>
                <p className="text-text-sub text-lg font-medium leading-relaxed max-w-3xl mt-2">
                    We've extracted data from your {getDocTypeName()}. Please review and correct any errors before continuing.
                </p>
            </div>

            {/* Alert Banner */}
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
                <div className="size-10 rounded-full bg-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">info</span>
                </div>
                <div>
                    <h3 className="text-sm font-black text-text-main mb-1">Data Extracted Automatically</h3>
                    <p className="text-sm text-text-sub font-medium">
                        Our OCR system extracted this information from your document. Please verify all fields are correct before submitting.
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

                {/* Left: Form */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-8 md:p-12 space-y-8">

                    {/* Document Info */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-text-main">Document Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Document Type</label>
                                <input
                                    type="text"
                                    value={getDocTypeName()}
                                    disabled
                                    className="w-full h-14 px-6 rounded-2xl border border-gray-50 bg-gray-50 text-text-sub font-medium cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    {formData.document_type === 'passport' ? 'Passport Number' : 'Document Number'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.document_number}
                                    onChange={(e) => handleChange('document_number', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl border ${errors.document_number ? 'border-red-500' : 'border-gray-200'} font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                    placeholder="Enter document number"
                                />
                                {errors.document_number && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{errors.document_number}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    National ID Number (NIN) {formData.document_type === 'national_id' && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.nin || ''}
                                    onChange={(e) => handleChange('nin', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl border ${errors.nin ? 'border-red-500' : 'border-gray-200'} font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                    placeholder="Enter 11-digit NIN"
                                    maxLength={11}
                                />
                                {errors.nin && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{errors.nin}</p>
                                )}
                                <p className="text-xs text-text-sub font-medium mt-1">Auto-filled from passport. Verify it matches your NIN.</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-6 pt-8 border-t border-gray-100">
                        <h2 className="text-xl font-black text-text-main">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => handleChange('first_name', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl border ${errors.first_name ? 'border-red-500' : 'border-gray-200'} font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                    placeholder="First name"
                                />
                                {errors.first_name && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{errors.first_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => handleChange('last_name', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl border ${errors.last_name ? 'border-red-500' : 'border-gray-200'} font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                    placeholder="Last name"
                                />
                                {errors.last_name && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{errors.last_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.date_of_birth}
                                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl border ${errors.date_of_birth ? 'border-red-500' : 'border-gray-200'} font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                    placeholder="DD/MM/YYYY"
                                />
                                {errors.date_of_birth && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{errors.date_of_birth}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl border ${errors.gender ? 'border-red-500' : 'border-gray-200'} font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                {errors.gender && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{errors.gender}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Nationality</label>
                                <input
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => handleChange('nationality', e.target.value)}
                                    className="w-full h-14 px-6 rounded-2xl border border-gray-200 font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Nationality"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => handleChange('phone_number', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl border ${errors.phone_number ? 'border-red-500' : 'border-gray-200'} font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                    placeholder="+234 XXX XXX XXXX"
                                />
                                {errors.phone_number && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{errors.phone_number}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                rows={3}
                                className="w-full px-6 py-4 rounded-2xl border border-gray-200 font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                placeholder="Enter your address"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full h-16 bg-primary text-white rounded-[22px] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                    >
                        Continue to Liveness Check
                        <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                    </button>
                </div>

                {/* Right: Verification Steps Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
                        <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>

                        <div className="space-y-10 relative">
                            {/* Vertical Stepper Line */}
                            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                                <div className="absolute top-0 left-0 w-full h-[66%] bg-primary"></div>
                            </div>

                            {/* Step 1: Completed */}
                            <div className="flex gap-6 items-start relative z-10">
                                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-main leading-tight">Choose Method</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                                </div>
                            </div>

                            {/* Step 2: Completed */}
                            <div className="flex gap-6 items-start relative z-10">
                                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-main leading-tight">Document Upload</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Data extracted</span>
                                </div>
                            </div>

                            {/* Step 3: Active */}
                            <div className="flex gap-6 items-start relative z-10">
                                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                                    3
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-primary leading-tight">Verify Data</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Review accuracy</span>
                                </div>
                            </div>

                            {/* Step 4: Pending */}
                            <div className="flex gap-6 items-start relative z-10 opacity-30">
                                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                                    4
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-main leading-tight">Liveness Check</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Face scan verification</span>
                                </div>
                            </div>

                            {/* Step 5: Pending */}
                            <div className="flex gap-6 items-start relative z-10 opacity-30">
                                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                                    5
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-main leading-tight">Review & Submit</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Final confirmation</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50 space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 group cursor-pointer hover:bg-gray-50 transition-all">
                                <div className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-lg">support_agent</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-text-main leading-none mb-1">Need help?</p>
                                    <button className="text-[11px] font-bold text-primary hover:underline">Contact Support</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer Exit Link */}
            <div className="mt-12 flex justify-center">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-text-sub hover:text-alerts transition-all font-bold text-sm"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                    Cancel Verification
                </button>
            </div>
        </div>
    );
};
