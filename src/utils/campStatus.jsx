import React from 'react';

/**
 * Robustly parses a date string in DD-MM-YYYY format and a time string like "10:00 AM - 4:00 PM"
 * and returns the current status: 'Live', 'Today', 'Upcoming', or 'Completed'.
 */
export const getCampStatus = (dateStr, timeStr) => {
    if (!dateStr) return { status: 'unknown', text: 'Date TBD' };

    const now = new Date();
    const nowY = now.getFullYear();
    const nowM = now.getMonth() + 1; // 1-indexed
    const nowD = now.getDate();
    const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Parse Date Numerically (Avoids timezone shifting bugs)
    const dateDigits = dateStr.match(/\d+/g);
    if (!dateDigits || dateDigits.length < 3) return { status: 'unknown', text: 'Invalid Date' };

    let cY, cM, cD;
    const d1 = parseInt(dateDigits[0], 10);
    const d2 = parseInt(dateDigits[1], 10);
    const d3 = parseInt(dateDigits[2], 10);

    if (d1 > 1000) { // YYYY-MM-DD
        cY = d1; cM = d2; cD = d3;
    } else if (d3 > 1000) { // DD-MM-YYYY
        cY = d3; cM = d2; cD = d1;
    } else {
        return { status: 'unknown', text: 'Invalid Date format' };
    }

    // Compare Date Numerically
    if (cY < nowY) return { status: 'completed', text: 'Completed', colorClass: 'bg-gray-100 text-gray-500 border-gray-200' };
    if (cY > nowY) return { status: 'upcoming', text: 'Upcoming', colorClass: 'bg-blue-50 text-blue-600 border-blue-100' };

    if (cM < nowM) return { status: 'completed', text: 'Completed', colorClass: 'bg-gray-100 text-gray-500 border-gray-200' };
    if (cM > nowM) return { status: 'upcoming', text: 'Upcoming', colorClass: 'bg-blue-50 text-blue-600 border-blue-100' };

    if (cD < nowD) return { status: 'completed', text: 'Completed', colorClass: 'bg-gray-100 text-gray-500 border-gray-200' };
    if (cD > nowD) return { status: 'upcoming', text: 'Upcoming', colorClass: 'bg-blue-50 text-blue-600 border-blue-100' };

    // 2. It's Today - Check Time range numerically
    if (!timeStr) {
        return { status: 'today', text: 'Today', colorClass: 'bg-green-50 text-green-600 border-green-100' };
    }

    try {
        // 1. Split by common separators (handling TO, T0, -, or THROUGH)
        const upperTime = timeStr.toUpperCase();
        const segments = upperTime.split(/\s+TO\s+|\s+T0\s+|-|THROUGH|\s+TO|TO\s+/).map(s => s.trim());

        if (segments.length < 2) {
            return { status: 'today', text: 'Today', colorClass: 'bg-green-50 text-green-600 border-green-100' };
        }

        const parseToMinutes = (s) => {
            // Correct typos like 'O' to '0' within the time segment
            const cleanStr = s.replace(/O/g, '0').replace(/[^\d\sAMP:]/g, '');
            const nums = cleanStr.match(/\d+/g);
            if (!nums) return null;

            let h = parseInt(nums[0], 10);
            let m = nums.length > 1 ? parseInt(nums[1], 10) : 0;

            const isPM = cleanStr.includes('PM') || (h >= 1 && h < 8 && !cleanStr.includes('AM'));
            const isAM = cleanStr.includes('AM');

            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;

            return h * 60 + m;
        };

        const startMins = parseToMinutes(segments[0]);
        const endMins = parseToMinutes(segments[1]);

        if (startMins === null || endMins === null) {
            return { status: 'today', text: 'Today', colorClass: 'bg-green-50 text-green-600 border-green-100' };
        }

        if (nowTotalMinutes >= startMins && nowTotalMinutes <= endMins) {
            return { status: 'live', text: 'Live', colorClass: 'bg-green-50 text-green-600 border-green-100 animate-pulse' };
        } else if (nowTotalMinutes < startMins) {
            return { status: 'today', text: 'Today', colorClass: 'bg-red-50 text-red-600 border-red-100' };
        } else {
            return { status: 'completed', text: 'Completed', colorClass: 'bg-gray-100 text-gray-500 border-gray-200' };
        }
    } catch (e) {
        return { status: 'today', text: 'Today', colorClass: 'bg-green-50 text-green-600 border-green-100' };
    }
};

/**
 * Returns a React component (Badge) for the camp status.
 */
export const CampStatusBadge = ({ date, time, className = "" }) => {
    const { text, colorClass } = getCampStatus(date, time);

    return (
        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${colorClass} ${className}`}>
            {text === 'Live' && <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>}
            {text}
        </span>
    );
};

/**
 * Robustly parses a date string in DD-MM-YYYY or YYYY-MM-DD format numerically
 * into a JavaScript Date object, avoiding NaN and timezone shifting bugs.
 */
const parseDateString = (dateStr) => {
    if (!dateStr) return new Date(0);
    const dateDigits = dateStr.match(/\d+/g);
    if (!dateDigits || dateDigits.length < 3) return new Date(0);

    const d1 = parseInt(dateDigits[0], 10);
    const d2 = parseInt(dateDigits[1], 10);
    const d3 = parseInt(dateDigits[2], 10);

    if (d1 > 1000) { // YYYY-MM-DD
        return new Date(d1, d2 - 1, d3);
    } else if (d3 > 1000) { // DD-MM-YYYY
        return new Date(d3, d2 - 1, d1);
    }
    return new Date(0);
};

/**
 * Sorts an array of camps by status priority: Live > Today > Upcoming > Completed.
 * Upcoming camps are sorted ascending by date (earliest first).
 * Completed camps are sorted descending by date (most recently completed first).
 */
export const sortCampsByStatus = (camps) => {
    if (!camps || !Array.isArray(camps)) return [];

    const priority = {
        'live': 0,
        'today': 1,
        'upcoming': 2,
        'completed': 3,
        'unknown': 4
    };

    return [...camps].sort((a, b) => {
        const statusA = getCampStatus(a.date, a.time).status;
        const statusB = getCampStatus(b.date, b.time).status;

        if (priority[statusA] !== priority[statusB]) {
            return priority[statusA] - priority[statusB];
        }

        const dateA = parseDateString(a.date);
        const dateB = parseDateString(b.date);

        if (statusA === 'completed') {
            // Newest completed camps first
            return dateB - dateA;
        }

        // Upcoming/Today/Live: earliest first
        return dateA - dateB;
    });
};
