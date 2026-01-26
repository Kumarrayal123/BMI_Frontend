import React, { useState } from 'react';
import { Users, Eye, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const VolunteerDisplay = ({ volunteers = [], isSelected = false }) => {
    const [showModal, setShowModal] = useState(false);

    if (!volunteers || volunteers.length === 0) {
        return (
            <div className={`mt-2 flex items-center gap-2 text-xs opacity-60 ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
                <Users size={12} />
                <span>No volunteers</span>
            </div>
        );
    }

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
                <div onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="flex items-center cursor-pointer group/vols">
                    <div className="flex items-center gap-2">
                        <Users size={12} className={isSelected ? "text-indigo-200" : "text-gray-400"} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                            Volunteers:
                        </span>

                        <div className="flex items-center -space-x-1.5 ml-1">
                            {volunteers.slice(0, 3).map((v, i) => (
                                <div
                                    key={i}
                                    className={`w-6 h-6 rounded-full border-2 ${isSelected ? "border-indigo-600 bg-white text-indigo-600" : "border-white bg-indigo-50 text-indigo-600"} flex items-center justify-center font-bold text-[9px] shadow-sm transition-transform group-hover/vols:-translate-y-0.5`}
                                    title={v}
                                >
                                    {v.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {volunteers.length > 3 && (
                                <div className={`w-6 h-6 rounded-full border-2 ${isSelected ? "border-indigo-600 bg-indigo-800 text-white" : "border-white bg-gray-100 text-gray-500"} flex items-center justify-center font-bold text-[9px] shadow-sm transition-transform group-hover/vols:-translate-y-0.5`}>
                                    +{volunteers.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                    className={`p-1.5 rounded-lg transition-all ${isSelected ? "bg-white/20 text-white hover:bg-white/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                    title="View Team"
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
                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Team Volunteers</h3>
                                    <p className="text-xs text-indigo-100">{volunteers.length} members assigned</p>
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
                            {volunteers.map((v, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100 group">
                                    <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-gray-100 group-hover:border-indigo-200 transition-colors">
                                        {v.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-gray-700 font-bold">{v}</span>
                                </div>
                            ))}
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

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default VolunteerDisplay;
