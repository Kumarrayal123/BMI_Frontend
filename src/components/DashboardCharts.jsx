import React, { useState, useMemo } from 'react';
import { Download, Activity, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { getCampStatus } from "../utils/campStatus";

/* ================= HELPERS ================= */

const downloadCSV = (data, prefix) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => {
        return Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${prefix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const getSugarStatus = (val, type) => {
    if (!val) return null;
    const v = Number(val);
    const t = (type || "Random").toLowerCase();
    if (t.includes("fasting")) {
        if (v < 70) return "Low";
        if (v <= 100) return "Normal";
        return "High";
    }
    if (v < 80) return "Low";
    if (v <= 140) return "Normal";
    return "High";
};

const getBPStatus = (sys, dia) => {
    if (!sys || !dia) return null;
    const s = Number(sys);
    const d = Number(dia);
    if (s < 90 || d < 60) return "Low";
    if (s <= 120 && d <= 80) return "Normal";
    return "High";
};

/* ================= CHART PIECES ================= */

const ChartCard = ({ title, children, onDownload, subtitle, headerExtra }) => (
    <div className="bg-white rounded-xl p-6 border shadow-sm flex flex-col items-center w-full h-full relative overflow-hidden">
        {/* Decorative corner background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-6 gap-4 relative z-10">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <div>
                    <h3 className="text-base font-bold text-gray-800 tracking-tight">{title}</h3>
                    {subtitle && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
                </div>
                <button
                    onClick={onDownload}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 sm:hidden flex items-center gap-2 text-xs font-bold"
                >
                    <Download size={14} />
                </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {headerExtra}
                <button
                    onClick={onDownload}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 group"
                >
                    <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-xs font-bold whitespace-nowrap">Export Data</span>
                </button>
            </div>
        </div>
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            {children}
        </div>
    </div>
);

/* ================= COMPONENTS ================= */

export const CampPieChart = ({ camps, patients, totalCamps, liveCamps, todayCamps, upcomingCamps, completedCamps }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const total = totalCamps || 1;
    const stats = [
        { label: 'Live', count: liveCamps, color: '#ef4444', bg: 'bg-red-50', border: 'border-red-100' },
        { label: 'Today', count: todayCamps, color: '#10b981', bg: 'bg-green-50', border: 'border-green-100' },
        { label: 'Upcoming', count: upcomingCamps, color: '#a855f7', bg: 'bg-purple-50', border: 'border-purple-100' },
        { label: 'Completed', count: completedCamps, color: '#6366f1', bg: 'bg-indigo-50', border: 'border-indigo-100' }
    ];

    const activeStats = stats.filter(s => s.count > 0);

    const handleDownload = () => {
        const detailedData = camps.map(camp => {
            const { status } = getCampStatus(camp.date, camp.time);
            const patientCount = patients.filter(p => String(p.campId?._id || p.campId) === String(camp._id)).length;
            return {
                "Camp Name": camp.name,
                "Status": status.charAt(0).toUpperCase() + status.slice(1),
                "Location": camp.location,
                "Date": camp.date || "N/A",
                "Time": camp.time || "N/A",
                "Volunteers": (camp.volunteers || []).join("; "),
                "Patients Registered": patientCount
            };
        });
        downloadCSV(detailedData, 'detailed_camp_distribution');
    };

    const centerX = 110; const centerY = 90; const radius = 70; const labelRadius = radius * 0.6;
    let currentAngle = 0;
    const segments = activeStats.map(stat => {
        const percentage = (stat.count / total) * 100;
        const angle = (percentage / 100) * 360;
        const startRad = (currentAngle - 90) * (Math.PI / 180);
        const endRad = (currentAngle + angle - 90) * (Math.PI / 180);
        const x1 = centerX + radius * Math.cos(startRad); const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad); const y2 = centerY + radius * Math.sin(endRad);
        const path = percentage >= 100 ? `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius} Z` : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
        const midRad = (currentAngle + angle / 2 - 90) * (Math.PI / 180);
        const res = { path, labelX: centerX + labelRadius * Math.cos(midRad), labelY: centerY + labelRadius * Math.sin(midRad), color: stat.color, label: stat.label, percentage: percentage.toFixed(0) };
        currentAngle += angle;
        return res;
    });

    return (
        <ChartCard title="Camp Distribution" onDownload={handleDownload}>
            <div className="flex flex-col sm:flex-row items-center gap-8 w-full justify-center">
                <div className="relative group flex justify-center items-center">
                    <svg width="220" height="180" viewBox="0 0 220 180" className="drop-shadow-sm">
                        {segments.map((segment, index) => (
                            <g key={index} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                                <path d={segment.path} fill={segment.color} stroke="white" strokeWidth="2" className="transition-all duration-300" style={{ opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6, transformOrigin: '110px 90px' }} />
                                {parseInt(segment.percentage) > 5 && <text x={segment.labelX} y={segment.labelY} textAnchor="middle" dominantBaseline="middle" className="text-white text-[11px] font-bold drop-shadow-md">{segment.percentage}%</text>}
                            </g>
                        ))}
                    </svg>
                    {hoveredIndex !== null && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-white/95 px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 z-10 animate-in fade-in zoom-in duration-200"><span className="text-xs font-bold" style={{ color: segments[hoveredIndex].color }}>{segments[hoveredIndex].label}</span></div></div>}
                </div>
                <div className="space-y-2 min-w-[140px]">
                    {stats.map((stat, i) => (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${stat.bg} ${stat.border}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }}></div>
                                <span className="text-xs font-medium text-gray-700">{stat.label}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{stat.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </ChartCard>
    );
};

export const CampParticipationChart = ({ camps, patients }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const data = useMemo(() => camps.map(camp => ({ name: camp.name, count: patients.filter(p => String(p.campId?._id || p.campId) === String(camp._id)).length })).filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 5), [camps, patients]);
    const handleDownload = () => {
        const detailedData = [];
        camps.forEach(camp => {
            const campPatients = patients.filter(p => String(p.campId?._id || p.campId) === String(camp._id));
            campPatients.forEach(p => {
                detailedData.push({
                    "Patient Name": p.name,
                    "Age": p.age || "N/A",
                    "Contact": p.contact,
                    "Camp Name": camp.name,
                    "Location": camp.location
                });
            });
        });
        downloadCSV(detailedData, 'detailed_camp_participation');
    };
    if (data.length === 0) return <ChartCard title="Camp Participation"><div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">No data available</div></ChartCard>;
    const width = 300; const height = 240; const padding = { top: 20, right: 20, bottom: 80, left: 40 }; const chartHeight = height - padding.top - padding.bottom; const maxCount = Math.max(...data.map(d => d.count)) || 1; const barWidth = 30; const gap = ((width - padding.left - padding.right) - (data.length * barWidth)) / (data.length + 1); const colors = ['#a855f7', '#10b981', '#6366f1', '#a855f7', '#10b981'];
    return (
        <ChartCard title="Camp Participation" onDownload={handleDownload}>
            <div className="relative flex justify-center w-full">
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    {[0, 0.5, 1].map((t, i) => { const y = padding.top + chartHeight - (t * chartHeight); return <g key={i}><line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" /><text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">{Math.round(t * maxCount)}</text></g>; })}
                    {data.map((item, i) => {
                        const bH = (item.count / maxCount) * chartHeight;
                        const x = padding.left + gap + i * (barWidth + gap);
                        const y = padding.top + chartHeight - bH;
                        return (
                            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                                <rect x={x} y={y} width={barWidth} height={bH} fill={colors[i % colors.length]} rx="4" className="transition-all duration-300 hover:opacity-80" />
                                {hoveredIndex === i && <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-[10px] font-bold fill-gray-600">{item.count}</text>}
                                <text
                                    x={x + barWidth / 2}
                                    y={height - padding.bottom + 10}
                                    textAnchor="end"
                                    className="text-[9px] font-medium fill-gray-500 whitespace-nowrap"
                                    transform={`rotate(-90, ${x + barWidth / 2}, ${height - padding.bottom + 10})`}
                                >
                                    {item.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {hoveredIndex !== null && <div className="absolute top-0 right-0 bg-white shadow-md border rounded px-2 py-1 text-xs text-gray-600 font-medium">{data[hoveredIndex].name}: {data[hoveredIndex].count}</div>}
            </div>
        </ChartCard>
    );
};

export const CampBMIChart = ({ camps, patients }) => {
    const [hoveredData, setHoveredData] = useState(null);
    const data = useMemo(() => camps.map(camp => {
        const cp = patients.filter(p => String(p.campId?._id || p.campId) === String(camp._id));
        const c = { underweight: 0, healthy: 0, overweight: 0, obese: 0 };
        cp.forEach(p => { const cat = p.vitals?.bmiCategory?.toLowerCase() || ""; if (cat.includes("under")) c.underweight++; else if (cat.includes("normal") || cat.includes("healthy")) c.healthy++; else if (cat.includes("over")) c.overweight++; else if (cat.includes("obese")) c.obese++; });
        return { name: camp.name, ...c, total: c.underweight + c.healthy + c.overweight + c.obese };
    }).filter(d => d.total > 0).sort((a, b) => b.total - a.total).slice(0, 5), [camps, patients]);
    const handleDownload = () => {
        const detailedData = [];
        camps.forEach(camp => {
            const campPatients = patients.filter(p => String(p.campId?._id || p.campId) === String(camp._id));
            campPatients.forEach(p => {
                const bmi = p.vitals?.bmi || "N/A";
                const cat = p.vitals?.bmiCategory || "N/A";
                detailedData.push({
                    "Date": camp.date || "N/A",
                    "Camp Name": camp.name,
                    "Patient Name": p.name,
                    "Mobile": p.contact,
                    "BMI Result": `${bmi} (${cat})`
                });
            });
        });
        downloadCSV(detailedData, 'detailed_bmi_distribution');
    };
    if (data.length === 0) return <ChartCard title="BMI Distribution"><div className="flex h-[180px] items-center text-gray-400 text-sm">No data available</div></ChartCard>;
    const h = 240; const w = 220; const padding = { top: 10, right: 10, bottom: 80, left: 10 }; const maxV = Math.max(...data.map(d => d.total)) || 1; const barW = 30; const gap = (200 - (data.length * barW)) / (data.length + 1); const colors = { under: '#3b82f6', healthy: '#10b981', over: '#f97316', obese: '#ef4444' };
    return (
        <ChartCard title="BMI Distribution by Camp" onDownload={handleDownload}>
            <div className="flex flex-col sm:flex-row items-center gap-8 w-full justify-center">
                <div className="relative flex justify-center">
                    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>{data.map((item, i) => {
                        const x = padding.left + gap + i * (barW + gap);
                        const hU = (item.underweight / maxV) * 150;
                        const hH = (item.healthy / maxV) * 150;
                        const hOv = (item.overweight / maxV) * 150;
                        const hOb = (item.obese / maxV) * 150;
                        const bY = 160;
                        const rR = (y, hC, f, t, c) => hC > 0 && <rect x={x} y={y} width={barW} height={hC} fill={f} rx="2" className="hover:opacity-80 cursor-pointer" onMouseEnter={() => setHoveredData({ name: item.name, type: t, count: c, fill: f })} onMouseLeave={() => setHoveredData(null)} />;
                        return (
                            <g key={i}>
                                {rR(bY - hU, hU, colors.under, 'Underweight', item.underweight)}
                                {rR(bY - hU - hH, hH, colors.healthy, 'Healthy', item.healthy)}
                                {rR(bY - hU - hH - hOv, hOv, colors.over, 'Overweight', item.overweight)}
                                {rR(bY - hU - hH - hOv - hOb, hOb, colors.obese, 'Obese', item.obese)}
                                <text
                                    x={x + barW / 2}
                                    y={h - padding.bottom + 10}
                                    textAnchor="end"
                                    className="text-[9px] fill-gray-500 font-medium"
                                    transform={`rotate(-90, ${x + barW / 2}, ${h - padding.bottom + 10})`}
                                >
                                    {item.name}
                                </text>
                            </g>
                        );
                    })}</svg>
                    {hoveredData && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 px-2 py-1 rounded shadow border text-[10px] text-center"><p className="font-semibold">{hoveredData.name}</p><span className="font-bold" style={{ color: hoveredData.fill }}>{hoveredData.type}: {hoveredData.count}</span></div>}
                </div>
                <div className="space-y-1"> {Object.entries(colors).map(([k, c]) => <div key={k} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }}></div><span className="text-[10px] capitalize font-medium">{k}</span></div>)}</div>
            </div>
        </ChartCard>
    );
};

export const HealthMetricChart = ({ type, patients, selectedCampName, onToggle, currentMetric }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const colors = { Normal: '#10b981', High: '#ef4444', Low: '#f97316' };
    const statsInfo = useMemo(() => {
        const counts = { Normal: 0, High: 0, Low: 0 }; let total = 0; patients.forEach(p => { const v = p.vitals || {}; const status = type === 'bp' ? getBPStatus(v.bpSys, v.bpDia) : getSugarStatus(v.sugar, v.sugarType); if (status && counts[status] !== undefined) { counts[status]++; total++; } });
        return { data: Object.entries(counts).filter(([_, c]) => c > 0).map(([l, c]) => ({ label: l, count: c, percentage: (c / total) * 100 })), total };
    }, [patients, type]);
    const handleDownload = () => {
        const detailedData = [];
        patients.forEach(p => {
            const v = p.vitals || {};
            const status = type === 'bp' ? getBPStatus(v.bpSys, v.bpDia) : getSugarStatus(v.sugar, v.sugarType);
            if (status) {
                detailedData.push({
                    "Date": p.campId?.date || "N/A",
                    "Camp Name": p.campId?.name || "N/A",
                    "Patient Name": p.name,
                    "Mobile": p.contact,
                    "Metric": type.toUpperCase(),
                    "Result": type === 'bp' ? `${v.bpSys}/${v.bpDia} mmHg (${status})` : `${v.sugar} mg/dL (${v.sugarType || 'Random'}) - ${status}`
                });
            }
        });
        downloadCSV(detailedData, `${type}_detailed_analysis`);
    };
    if (statsInfo.data.length === 0) return <ChartCard title={`${type === 'bp' ? 'BP' : 'Sugar'} Analysis`} onDownload={handleDownload} headerExtra={onToggle && <div className="flex bg-gray-100 p-1 rounded-lg"><button onClick={() => onToggle('bp')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${currentMetric === 'bp' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>BP</button><button onClick={() => onToggle('sugar')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${currentMetric === 'sugar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Sugar</button></div>}><div className="flex h-48 items-center text-gray-400 text-sm">No data available</div></ChartCard>;
    const segments = statsInfo.data.map((s, i, arr) => {
        const centerX = 110; const centerY = 90; const radius = 80; let cA = arr.slice(0, i).reduce((sum, st) => sum + (st.percentage / 100) * 360, 0); const a = (s.percentage / 100) * 360; const sR = (cA - 90) * (Math.PI / 180); const eR = (cA + a - 90) * (Math.PI / 180);
        const path = s.percentage >= 100 ? `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius} Z` : `M ${centerX} ${centerY} L ${centerX + radius * Math.cos(sR)} ${centerY + radius * Math.sin(sR)} A ${radius} ${radius} 0 ${a > 180 ? 1 : 0} 1 ${centerX + radius * Math.cos(eR)} ${centerY + radius * Math.sin(eR)} Z`;
        const mR = (cA + a / 2 - 90) * (Math.PI / 180); return { path, lX: centerX + radius * 0.7 * Math.cos(mR), lY: centerY + radius * 0.7 * Math.sin(mR), color: colors[s.label], ...s };
    });
    return (
        <ChartCard title={`${type === 'bp' ? 'Blood Pressure' : 'Blood Sugar'} Analysis`} onDownload={handleDownload} subtitle={selectedCampName ? `Camp: ${selectedCampName}` : "All Assignments"} headerExtra={onToggle && <div className="flex bg-gray-100 p-1 rounded-lg"><button onClick={() => onToggle('bp')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${currentMetric === 'bp' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>BP</button><button onClick={() => onToggle('sugar')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${currentMetric === 'sugar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Sugar</button></div>}>
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
                <div className="relative group flex justify-center items-center">
                    <svg width="220" height="180" viewBox="0 0 220 180">{segments.map((s, i) => <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer"><path d={s.path} fill={s.color} stroke="white" strokeWidth="2" className="transition-all duration-300" style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.6, transformOrigin: '110px 90px' }} />{s.percentage > 5 && <text x={s.lX} y={s.lY} textAnchor="middle" dominantBaseline="middle" className="text-white text-[10px] font-bold drop-shadow-md">{s.percentage.toFixed(0)}%</text>}</g>)}</svg>
                    {hoveredIndex !== null && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-white/95 px-2 py-1 rounded shadow border text-xs font-bold" style={{ color: segments[hoveredIndex].color }}>{segments[hoveredIndex].label}: {segments[hoveredIndex].count}</div></div>}
                </div>
                <div className="space-y-2 min-w-[100px]">{statsInfo.data.map((s, i) => { const st = { Normal: { bg: 'bg-green-50', dot: '#10b981' }, High: { bg: 'bg-red-50', dot: '#ef4444' }, Low: { bg: 'bg-orange-50', dot: '#f97316' } }[s.label]; return <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${st.bg}`}><div className="flex items-center gap-2 font-medium"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: st.dot }}></div><span className="text-[10px]">{s.label}</span></div><span className="text-xs font-bold">{s.count}</span></div>; })}</div>
            </div>
        </ChartCard>
    );
};
