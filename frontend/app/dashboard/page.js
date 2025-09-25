"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FaChartLine, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';

const API_BASE_URL = "http://localhost:8001";

const generateMockChartData = () => {
    const data = [];
    const statuses = ['scheduled', 'published', 'failed'];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateString = format(date, 'MMM d');
        data.push({
            date: dateString,
            scheduled: Math.floor(Math.random() * 5) + 1,
            published: Math.floor(Math.random() * 8) + 1,
            failed: Math.floor(Math.random() * 2),
        });
    }
    return data;
};

const getPieChartData = (stats) => {
    return [
        { name: 'Published', value: stats?.posts_published || 0, color: '#22C55E' },
        { name: 'Scheduled', value: stats?.posts_scheduled || 0, color: '#3B82F6' },
        { name: 'Failed', value: stats?.posts_failed || 0, color: '#EF4444' },
    ];
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [insight, setInsight] = useState("Loading AI insights...");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState([]);

    const getGeminiKey = () => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('geminiKey') || '';
        }
        return '';
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const geminiKey = getGeminiKey();
            
            try {
                // 1. Fetch Post Statistics
                const statsRes = await fetch(`${API_BASE_URL}/analytics/stats`);
                const statsData = await statsRes.json();
                setStats(statsData);

                // 2. Fetch Dynamic AI Insight
                const insightRes = await fetch(`${API_BASE_URL}/analytics/ai/dynamic_insight`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        post_counts: {
                            published: statsData.posts_published,
                            failed: statsData.posts_failed,
                            scheduled: statsData.posts_scheduled 
                        },
                        gemini_key: geminiKey
                    }),
                });
                const insightData = await insightRes.json();
                
                let source = insightData.source;
                let insightText = `${insightData.insight} (Source: ${source})`;

                setInsight(insightText);

                // Generate mock data for charts
                setChartData(generateMockChartData());

            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Failed to load dashboard data. Check backend connection.");
                setInsight("AI Insight unavailable due to connectivity error.");
            } finally {
                setLoading(false);
            }
        };

        fetchData(); 
    }, []); 

    if (loading) {
        return (
            <div className="p-8 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
                <LoadingSpinner message="Loading dashboard and generating AI insights..." />
            </div>
        );
    }

    const getCardProps = (status) => {
        switch (status) {
            case 'published': return { color: 'green', icon: <FaCheck /> };
            case 'scheduled': return { color: 'blue', icon: <FaHourglassHalf /> };
            case 'failed': return { color: 'red', icon: <FaTimes /> };
            default: return { color: 'gray', icon: null };
        }
    };

    const pieData = getPieChartData(stats);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-4 md:p-8 font-sans antialiased text-gray-800 dark:text-text-gray-200">
            <header className="py-8 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                    Analytics Dashboard 📊
                </h1>
                <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400">
                    Your social media performance at a glance.
                </p>
            </header>
            
            <main className="max-w-6xl mx-auto space-y-8">
                {error && <div className="text-center p-3 mb-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700">{error}</div>}

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-3 text-purple-600 dark:text-purple-400 flex items-center">
                        <FaChartLine className="mr-2 text-2xl"/> 
                        Actionable AI Recommendation
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{insight}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Published Posts" 
                        value={stats?.posts_published || 0} 
                        {...getCardProps('published')} 
                    />
                    <StatCard 
                        title="Scheduled (Pending)" 
                        value={stats?.posts_scheduled || 0} 
                        {...getCardProps('scheduled')} 
                    />
                    <StatCard 
                        title="Failed to Publish" 
                        value={stats?.posts_failed || 0} 
                        {...getCardProps('failed')} 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                            Daily Post Activity
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="published" name="Published" fill="#22C55E" />
                                <Bar dataKey="scheduled" name="Scheduled" fill="#3B82F6" />
                                <Bar dataKey="failed" name="Failed" fill="#EF4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                            Post Status Breakdown
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}

const StatCard = ({ title, value, color, icon }) => {
    const colorClasses = {
        green: "bg-green-100 text-green-800 border-green-400 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
        blue: "bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
        red: "bg-red-100 text-red-800 border-red-400 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
        gray: "bg-gray-100 text-gray-800 border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
    };
    return (
        <div className={`p-5 rounded-2xl shadow-lg border ${colorClasses[color]}`}>
            <div className="flex items-center text-sm font-semibold mb-2">
                {icon && <span className="mr-2 text-lg opacity-75">{icon}</span>}
                <span className="opacity-90">{title}</span>
            </div>
            <p className="text-4xl font-bold mt-1">{value}</p>
        </div>
    );
};
