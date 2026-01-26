import React, { useState } from 'react';
import { Briefcase, Eye, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';

const PartnerDisplay = ({ partners = [], isSelected = false }) => {
    const [showModal, setShowModal] = useState(false);

    if (!partners || partners.length === 0) {
        return null; // Don't show anything if no partners
    }

    return (
        <div className={`mt-3 pt-3 border-t ${isSelected ? "border-white/10" : "border-gray-50"}`}>
            <div className="flex items-center justify-between mb-2">
                <div onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="flex items-center cursor-pointer group/partners">
                    <div className="flex items-center gap-2">
                        <Briefcase size={12} className={isSelected ? "text-indigo-200" : "text-gray-400"} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                            Partners:
                        </span>

                        <div className="flex items-center -space-x-1.5 ml-1">
                            {partners.slice(0, 3).map((p, i) => {
                                const name = p.partnerId?.clinicName || p.partnerId?.name || "P";
                                const status = p.status || "pending";
                                return (
                                    <div
                                        key={i}
                                        className={`w-6 h-6 rounded-full border-2 relative ${isSelected ? "border-indigo-600 bg-white text-indigo-600" : "border-white bg-purple-50 text-purple-600"} flex items-center justify-center font-bold text-[9px] shadow-sm transition-transform group-hover/partners:-translate-y-0.5`}
                                        title={`${name} (${status})`}
                                    >
                                        {name.charAt(0).toUpperCase()}
                                        {/* Tiny Status Dot */}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${status === 'accepted' ? 'bg-emerald-500' :
                                                status === 'rejected' ? 'bg-rose-500' : 'bg-amber-400'
                                            }`} />
                                    </div>
                                );
                            })}
                            {partners.length > 3 && (
                                <div className={`w-6 h-6 rounded-full border-2 ${isSelected ? "border-indigo-600 bg-indigo-800 text-white" : "border-white bg-gray-100 text-gray-500"} flex items-center justify-center font-bold text-[9px] shadow-sm transition-transform group-hover/partners:-translate-y-0.5`}>
                                    +{partners.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                    className={`p-1.5 rounded-lg transition-all ${isSelected ? "bg-white/20 text-white hover:bg-white/30" : "bg-purple-50 text-purple-600 hover:bg-purple-100"}`}
                    title="View Partners"
                >
                    <Eye size={14} />
                </button>
            </div>

            {showModal && createPortal(
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Assigned Partners</h3>
                                    <p className="text-xs text-purple-100">{partners.length} clinics assigned</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3 custom-scrollbar">
                            {partners.map((p, i) => {
                                const name = p.partnerId?.clinicName || p.partnerId?.name || "Partner";
                                const status = p.status || "pending";
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold text-sm shadow-sm border border-gray-100 group-hover:border-purple-200 transition-colors">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-gray-700 font-bold leading-tight">{name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{p.partnerId?.specialization || 'Clinical Partner'}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase
                                            ${status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'}`}>
                                            {status === 'accepted' ? <CheckCircle size={12} /> :
                                                status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                                            {status}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm active:scale-[0.98]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PartnerDisplay;
