import React from 'react';

const AdminFeatureCard = ({ title, description, icon: Icon, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <Icon size={24} className="text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
};

export default AdminFeatureCard;
