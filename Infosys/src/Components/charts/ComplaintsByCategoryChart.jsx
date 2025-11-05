import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDepartmentComplaintCount } from '../../api/AdminAPI';
import { gsap } from 'gsap';

// Define custom colors for the chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000'];

const ComplaintsByCategoryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  // Animation effect using GSAP
  useEffect(() => {
    if (loading) {
      // Setup the initial state for the loading animation
      gsap.set(chartRef.current, { opacity: 0, y: 50 });
    } else {
      // Animate in the chart once data is loaded
      gsap.to(chartRef.current, {
        opacity: 1,
        y: 0,
        duration: 1, // 1 second animation
        ease: "power3.out"
      });
    }
  }, [loading]);

  // Data fetching logic
  useEffect(() => {
    const loadData = async () => {
      try {
        const chartData = await fetchDepartmentComplaintCount();
        setData(chartData);
      } catch (error) {
        // Handle error state if needed
        console.error("Failed to load chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Simulate a slight delay for the loading animation to be visible
    const timer = setTimeout(loadData, 500); // 0.5s delay
    return () => clearTimeout(timer);
  }, []);

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-md text-sm">
          <p className="font-semibold text-gray-700">{name}</p>
          <p className="text-gray-600">Complaints: <span className="font-bold">{value}</span></p>
        </div>
      );
    }
    return null;
  };

  // Display a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-600">Loading Chart...</p>
      </div>
    );
  }

  // Display a message if no data is available
  if (data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg text-center">
        <p className="text-xl text-gray-500">No complaint data available.</p>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className="bg-white p-6 rounded-xl shadow-2xl transition-shadow"
      style={{ opacity: 0 }} // GSAP sets the initial opacity
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
        📊 Complaints by Department
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Chart Area */}
        <div className="w-full md:w-3/5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                labelLine={false}
              >
                {/* Map over data to apply custom colors */}
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Area */}
        <div className="w-full md:w-2/5 p-4">
          <ul className="space-y-2">
            {data.map((entry, index) => (
              <li key={`legend-${index}`} className="flex items-center text-sm font-medium text-gray-700">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                {entry.name}: <span className="font-bold ml-1">{entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsByCategoryChart;