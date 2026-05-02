import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { CheckCircle, XCircle, User, FileText, Camera, Globe, Loader2 } from "lucide-react";
import { useState } from "react";

interface RequestDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    request: any;
    onAction: (approve: boolean) => void;
}

export default function RequestDetailsModal({ isOpen, onClose, request, onAction }: RequestDetailsProps) {
    const [actionLoading, setActionLoading] = useState(false);

    if (!request) {
        console.warn('RequestDetailsModal: No request provided');
        return null;
    }

    const handleAction = async (approve: boolean) => {
        setActionLoading(true);
        await onAction(approve);
        setActionLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {request.first_name ? `${request.first_name} ${request.last_name}` : request.name || "Unknown User"}
                                {request.wallet && (
                                    <Badge variant="outline" className="ml-2 text-xs border-slate-500 text-slate-400 font-mono">
                                        {request.wallet.slice(0, 6)}...{request.wallet.slice(-4)}
                                    </Badge>
                                )}
                                {request.source === 'v2' && (
                                    <Badge variant="outline" className="ml-2 text-xs border-purple-500 text-purple-400">
                                        V2
                                    </Badge>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Requested {request.tier === 'layer_3' ? "Full KYC" : "Basic"} verification on {new Date(request.created_at).toLocaleDateString()}
                            </DialogDescription>
                        </div>
                        <Badge className={`${request.status === 'approved' || request.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            request.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                            }`}>
                            {request.status.toUpperCase()}
                        </Badge>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="profile" className="w-full mt-4">
                    <TabsList className="bg-slate-800 border-slate-700 w-full justify-start">
                        <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Profile Info</TabsTrigger>
                        <TabsTrigger value="identity"><Camera className="w-4 h-4 mr-2" /> Identity Proof</TabsTrigger>
                        <TabsTrigger value="socials"><Globe className="w-4 h-4 mr-2" /> Social & Web3</TabsTrigger>
                    </TabsList>

                    {/* --- TAB: PROFILE --- */}
                    <TabsContent value="profile" className="space-y-4 p-4 bg-slate-800/20 rounded-lg mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400">Full Name</h4>
                                <p>{request.first_name} {request.last_name}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400">Email</h4>
                                <p>{request.email || "N/A"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400">Phone</h4>
                                <p>{request.phone_number || "N/A"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400">Date of Birth</h4>
                                <p>{request.date_of_birth || "N/A"}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-700">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Address</h4>
                            <p>{
                                typeof request.home_address === 'object' && request.home_address
                                    ? [
                                        request.home_address.street,
                                        request.home_address.city,
                                        request.home_address.state,
                                        request.home_address.postal_code,
                                        request.home_address.country
                                    ].filter(Boolean).join(', ')
                                    : request.home_address || request.location || "N/A"
                            }</p>
                        </div>
                        <div className="pt-4 border-t border-slate-700">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Professional</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-500 block">Job Title</span>
                                    {request.job_title || "N/A"}
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block">Education</span>
                                    {request.education || "N/A"}
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-700">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Bio</h4>
                            <p className="text-sm text-gray-300">{request.info || "No bio provided"}</p>
                        </div>
                    </TabsContent>

                    {/* --- TAB: IDENTITY --- */}
                    <TabsContent value="identity" className="space-y-6 p-4 bg-slate-800/20 rounded-lg mt-4">
                        {/* Liveness Section */}
                        <div>
                            <h3 className="text-md font-bold mb-3 flex items-center">
                                <Camera className="w-4 h-4 mr-2 text-purple-400" /> Liveness Audit Trail
                            </h3>
                            {request.metadata?.liveness_frames && Array.isArray(request.metadata.liveness_frames) && request.metadata.liveness_frames.length > 0 ? (
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                    {request.metadata.liveness_frames.map((frame: string, i: number) => (
                                        <div key={i} className="aspect-[4/3] bg-black rounded overflow-hidden border border-slate-600">
                                            <img
                                                src={frame}
                                                alt={`Frame ${i}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkltYWdlIEVycm9yPC90ZXh0Pgo8L3N2Zz4K';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded text-sm">
                                    ⚠️ No liveness snapshots found. This might be a legacy request or bypassed check.
                                </div>
                            )}
                            {request.metadata?.liveness_verified !== undefined && (
                                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <p className="text-xs font-semibold text-slate-300 mb-2">AI Analysis</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-slate-500">AI Decision:</span>
                                            <p className={`font-semibold ${request.liveness_ai_passed ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {request.liveness_ai_passed ? 'PASS' : 'NEEDS REVIEW'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Confidence:</span>
                                            <p className="font-semibold text-white">{request.liveness_confidence || request.metadata?.liveness_confidence || 'N/A'}%</p>
                                        </div>
                                    </div>
                                    {(request.liveness_ai_reasoning || request.metadata?.liveness_ai_reasoning) && (
                                        <div className="mt-2 pt-2 border-t border-slate-700">
                                            <span className="text-slate-500 text-xs">Reasoning:</span>
                                            <p className="text-xs text-slate-300 mt-1">{request.liveness_ai_reasoning || request.metadata?.liveness_ai_reasoning}</p>
                                        </div>
                                    )}
                                    {request.metadata?.liveness_completed_at && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Processed: {new Date(request.metadata.liveness_completed_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Documents Section - handles both V1 and V2 */}
                        <div className="border-t border-slate-700 pt-4">
                            <h3 className="text-md font-bold mb-3 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-400" /> ID Documents
                            </h3>
                            {(request.front_image_url || request.back_image_url || request.metadata?.upload_id || request.upload_id) ? (
                                <div className="space-y-3">
                                    {/* V2: Show front and back images */}
                                    {(request.front_image_url || request.back_image_url) && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {request.front_image_url && (
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-2">Front</p>
                                                    <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden border border-slate-600">
                                                        <img
                                                            src={request.front_image_url}
                                                            alt="Document Front"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {request.back_image_url && (
                                                <div>
                                                    <p className="text-xs text-slate-400 mb-2">Back</p>
                                                    <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden border border-slate-600">
                                                        <img
                                                            src={request.back_image_url}
                                                            alt="Document Back"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* V1: Show single upload */}
                                    {!request.front_image_url && (request.metadata?.upload_id || request.upload_id) && (
                                        <div className="aspect-[4/3] max-w-md bg-black rounded-lg overflow-hidden border border-slate-600">
                                            <img
                                                src={`/uploads/${request.upload_id || request.metadata?.upload_id}`}
                                                alt="Uploaded Document"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    if (!target.dataset.retried) {
                                                        target.dataset.retried = 'true';
                                                        target.src = `/api/uploads/${request.upload_id || request.metadata?.upload_id}`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-400 font-mono">Upload ID: {request.upload_id || request.metadata?.upload_id}</p>
                                </div>
                            ) : (
                                <div className="p-8 border-2 border-dashed border-slate-700 rounded-lg text-center text-gray-500">
                                    No document uploaded for this request.
                                </div>
                            )}
                        </div>

                        {/* Liveness Frames Section */}
                        {request.liveness_frame_urls && request.liveness_frame_urls.length > 0 && (
                            <div className="border-t border-slate-700 pt-4">
                                <h3 className="text-md font-bold mb-3 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-green-400" /> Liveness Check Frames
                                    {request.liveness_verified && (
                                        <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Verified</span>
                                    )}
                                </h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {request.liveness_frame_urls.map((url: string, idx: number) => (
                                        <div key={idx} className="aspect-square bg-black rounded-lg overflow-hidden border border-slate-600">
                                            <img
                                                src={url}
                                                alt={`Liveness frame ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {request.liveness_confidence && (
                                    <p className="text-xs text-slate-400 mt-2">
                                        Confidence: {request.liveness_confidence}% | Completed: {request.liveness_completed_at ? new Date(request.liveness_completed_at).toLocaleString() : 'N/A'}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Document Details Section - handles both V1 (metadata) and V2 (direct fields) */}
                        {(request.metadata || request.source === 'v2') && (
                            <div className="border-t border-slate-700 pt-4">
                                <h3 className="text-md font-bold mb-3 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-cyan-400" /> Document Details (OCR Extracted)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-800/50 rounded-lg p-4">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Document Type</span>
                                        <p className="text-white capitalize">{request.document_type || request.metadata?.document_type || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Document Number</span>
                                        <p className="text-white font-mono">{request.document_number || request.metadata?.document_number || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">NIN (National ID)</span>
                                        <p className="text-white font-mono">{request.nin || request.metadata?.nin || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Gender</span>
                                        <p className="text-white capitalize">{request.gender || request.metadata?.gender || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Nationality</span>
                                        <p className="text-white">{request.nationality || request.metadata?.nationality || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Liveness Check</span>
                                        <p className={`flex items-center gap-1 ${(request.liveness_verified || request.metadata?.liveness_verified) ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {(request.liveness_verified || request.metadata?.liveness_verified) ? (
                                                <><CheckCircle className="w-3 h-3" /> Verified</>
                                            ) : (
                                                <><XCircle className="w-3 h-3" /> Not Verified</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* --- TAB: SOCIALS --- */}
                    <TabsContent value="socials" className="space-y-4 p-4 bg-slate-800/20 rounded-lg mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                <span className="text-xs text-gray-500">Human ID</span>
                                <p className="font-mono text-lg text-purple-300">{request.human_id || "Not assigned"}</p>
                            </div>
                            {request.cns_name && (
                                <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                    <span className="text-xs text-gray-500">CNS Name (Premium)</span>
                                    <p className="font-mono text-lg text-cyan-300">{request.cns_name}.cspr</p>
                                </div>
                            )}
                        </div>

                        <h4 className="text-sm font-semibold text-gray-400 mt-4">Connected Accounts</h4>
                        <div className="space-y-2">
                            {Object.entries(request.socials || {}).map(([platform, handle]) => (
                                <div key={platform} className="flex justify-between items-center p-2 bg-slate-800 rounded">
                                    <span className="capitalize">{platform}</span>
                                    <span className="text-blue-400">{String(handle)}</span>
                                </div>
                            ))}
                            {Object.keys(request.socials || {}).length === 0 && (
                                <p className="text-gray-500 text-sm">No social accounts linked.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2 mt-6 border-t border-slate-700 pt-4">
                    <Button variant="outline" onClick={onClose} className="bg-transparent border-white/20 text-white hover:bg-white/10">
                        Close
                    </Button>
                    {(request.status === 'pending' || request.status === 'in_progress') && (
                        <>
                            <Button
                                onClick={() => handleAction(false)}
                                variant="destructive"
                                disabled={actionLoading}
                                className="bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-900/50"
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={() => handleAction(true)}
                                disabled={actionLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve & Mint Credential"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
