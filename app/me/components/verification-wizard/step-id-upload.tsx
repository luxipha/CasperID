import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { VerificationRequest } from '@/lib/api-client';

interface StepIdUploadProps {
    data: Partial<VerificationRequest>;
    onUpdate: (data: Partial<VerificationRequest>) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepIdUpload({ data, onUpdate, onNext, onBack }: StepIdUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(data.image_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create preview URL
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);

            // In a real app, we would upload this to IPFS/S3 here
            // For now, we simulate by updating image_url with the object URL (or base64)
            // But ideally we pass the File object up or upload immediately
            onUpdate({ image_url: objectUrl });
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">Upload Identity Document</h3>
                <p className="text-sm text-gray-400">
                    Please upload a clear photo of your Passport, Driver's License, or National ID.
                </p>
            </div>

            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {preview ? (
                    <div className="relative w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden">
                        <img src={preview} alt="ID Preview" className="w-full h-full object-contain" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setPreview(null);
                                onUpdate({ image_url: undefined });
                            }}
                            className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-white font-medium">Click to upload document</p>
                        <p className="text-xs text-gray-400 mt-2">JPG, PNG or PDF (Max 5MB)</p>
                    </>
                )}
            </div>

            <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} className="w-1/3 border-slate-600 text-white hover:bg-slate-700">
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!preview}
                    className="w-2/3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                    Next: Liveness Check
                </Button>
            </div>
        </div>
    );
}
