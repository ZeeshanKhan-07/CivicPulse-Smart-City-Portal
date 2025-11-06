import React, { useState, useEffect, useRef } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell // Import Cell component for dynamic color assignment
} from 'recharts';
import { fetchCityComplaintCount } from '../../api/AdminAPI';
// Adjust path as needed
import { gsap } from 'gsap';

// --- CONFIGURATION ---
const COMPLAINT_THRESHOLD = 10;
const Y_AXIS_MAX = 15; // Set the fixed range for the Y-axis

const ComplaintsByZoneChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);

    // GSAP Animation effect
    useEffect(() => {
        // Only run animation if we have data and loading is complete
        if (!loading && data.length > 0 && chartRef.current) {
            gsap.fromTo(chartRef.current, 
                { opacity: 0, y: 50 }, 
                { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
            );
        }
    }, [loading, data]);

    // Data fetching logic
    useEffect(() => {
        const loadData = async () => {
            try {
                const chartData = await fetchCityComplaintCount();
                // Data mapping (including fill color) is now primarily handled in the API utility
                setData(chartData);
            } catch (error) {
                console.error("Failed to load zone chart data:", error);
            } finally {
                // Ensure data is set to an array, even if empty, to stop the spinner
                setTimeout(() => setLoading(false), 500);
            }
        };

        loadData();
    }, []);

    // Custom Tooltip component for Recharts
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { name, value } = payload[0].payload;
            const isHigh = value >= COMPLAINT_THRESHOLD;
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg text-sm transition-all duration-300">
                    <p className="font-semibold text-gray-700">{name}</p>
                    <p className={`font-bold ${isHigh ? 'text-red-600' : 'text-green-600'}`}>
                        Complaints: {value}
                    </p>
                    {isHigh && <p className="text-xs text-red-500 font-medium mt-1">⚠️ High Priority Zone</p>}
                </div>
            );
        }
        return null;
    };

    // --- Loading and No Data State ---
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-2xl h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-500"></div>
                <p className="ml-4 text-lg text-gray-600">Loading Zone Data...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-2xl text-center h-80 flex items-center justify-center">
                <p className="text-xl text-gray-500">No city/zone complaint data available.</p>
            </div>
        );
    }

    // --- Chart Renderer ---
    return (
        <div 
            ref={chartRef}
            className="bg-white p-6 rounded-xl shadow-2xl transition-shadow"
            // Set opacity to 0 only initially, GSAP will manage the fade-in
            style={!loading ? { opacity: 1 } : { opacity: 0 }} 
        >
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                🏙️ Complaints Density by Zone
            </h2>
            <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#4B5563"
                            tick={{ fontSize: 12, fill: '#4B5563' }}
                            interval={0}
                            angle={-15}
                            textAnchor="end"
                            height={40}
                        />
                        <YAxis 
                            dataKey="value"
                            stroke="#4B5563"
                            tick={{ fontSize: 12, fill: '#4B5563' }}
                            // FIX 2: Fixed domain to show the full range 0 to 15
                            domain={[0, Y_AXIS_MAX]} 
                            allowDataOverflow={false}
                            ticks={[0, 5, 10, 15]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="value" 
                            name="Complaints"
                            radius={[10, 10, 0, 0]}
                        >
                            {/* FIX 3: Use Cell to map the dynamic 'fill' property */}
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ComplaintsByZoneChart;