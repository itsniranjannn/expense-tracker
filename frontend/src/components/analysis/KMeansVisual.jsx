import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Brain, Play, RefreshCw, Download } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const KMeansVisual = () => {
    const [data, setData] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState([]);

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const runAnalysis = async () => {
        try {
            setLoading(true);
            const response = await api.post('/analysis/cluster');
            const { clusters: clusterData, insights: analysisInsights } = response.data.data;
            
            // Transform data for visualization
            const scatterData = clusterData.flatMap((cluster, clusterIndex) => 
                cluster.points.map(point => ({
                    x: point[0], // amount
                    y: point[1], // day of month
                    z: point[2], // category encoded
                    cluster: clusterIndex,
                    size: point[0] / 1000 // scale for bubble size
                }))
            );

            setData(scatterData);
            setClusters(clusterData);
            setInsights(analysisInsights);
            
            toast.success('Analysis completed successfully!');
        } catch (error) {
            toast.error('Failed to run analysis');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load previous analysis if exists
        api.get('/analysis/results')
            .then(response => {
                if (response.data.data.clusters) {
                    setClusters(response.data.data.clusters);
                    setInsights(response.data.data.insights || []);
                }
            })
            .catch(() => {
                // No previous analysis, ignore
            });
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                    <p className="font-bold text-gray-900">Expense Details</p>
                    <p className="text-sm text-gray-600">Amount: ₹{payload[0].payload.x.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Day: {payload[0].payload.y}</p>
                    <p className="text-sm text-gray-600">Cluster: {payload[0].payload.cluster}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Spending Analysis</h2>
                    <p className="text-gray-600">K-Means clustering reveals your spending patterns</p>
                </div>
                <button
                    onClick={runAnalysis}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            Run Analysis
                        </>
                    )}
                </button>
            </div>

            {/* Main Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scatter Plot */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    type="number" 
                                    dataKey="x" 
                                    name="Amount" 
                                    label={{ value: 'Amount (₹)', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis 
                                    type="number" 
                                    dataKey="y" 
                                    name="Day" 
                                    label={{ value: 'Day of Month', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Scatter name="Expenses" data={data} fill="#8884d8">
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[entry.cluster % COLORS.length]}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-8 h-8 text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-900">How It Works</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            K-Means groups your expenses based on amount, category, and timing.
                            Each cluster represents a distinct spending pattern.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                High-value purchases
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                Daily essentials
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                Weekend spending
                            </li>
                        </ul>
                    </motion.div>

                    {/* Cluster Insights */}
                    {insights.map((insight, index) => (
                        <motion.div
                            key={insight.clusterId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl p-4 shadow border border-gray-200"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: insight.color }}
                                    ></div>
                                    <h4 className="font-bold text-gray-900">{insight.label}</h4>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    {insight.size} expenses
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{insight.insight}</p>
                            <p className="text-sm text-blue-600 font-medium">💡 {insight.recommendation}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Cluster Details */}
            {clusters.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Cluster Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {clusters.map((cluster, index) => (
                            <div 
                                key={index}
                                className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                                style={{ borderLeftColor: COLORS[index], borderLeftWidth: '4px' }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-gray-900">Cluster {index + 1}</h4>
                                    <span className="text-sm text-gray-500">{cluster.size} items</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Avg amount: ₹{(cluster.averageDistance * 1000).toFixed(2)}
                                </p>
                                <div className="text-xs text-gray-500">
                                    Variance: {(cluster.averageDistance * 100).toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
                <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Data
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-shadow">
                    Generate Report
                </button>
            </div>
        </div>
    );
};

export default KMeansVisual;