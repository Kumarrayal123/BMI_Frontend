import React from 'react';

const StatsCard = ({ title, value, icon: Icon, iconBg, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-4 ${onClick ? "cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]" : ""}`}
        >
            <div
                className={`p-4 rounded-xl ${iconBg}`}
            >
                <Icon size={24} className="text-white" />
            </div>

            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

export default StatsCard;
