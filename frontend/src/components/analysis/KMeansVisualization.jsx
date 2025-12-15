import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, ZAxis
} from 'recharts';
import { Target, Maximize2, Minimize2, Eye, EyeOff, Info, DollarSign, Calendar } from 'lucide-react';

const KMeansVisualization = ({ clusters, scatterData = [], centroids = [], onClusterClick }) => {
  const [viewMode, setViewMode] = useState('2d');
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [processedData, setProcessedData] = useState({ scatterPoints: [], centroidPoints: [] });

  // Process data when scatterData or centroids change
  useEffect(() => {
    const { scatterPoints, centroidPoints } = prepareVisualizationData();
    setProcessedData({ scatterPoints, centroidPoints });
  }, [scatterData, centroids]);

  // Prepare data for scatter plot - FIXED VERSION
  const prepareVisualizationData = () => {
    if (!scatterData || scatterData.length === 0) {
      return { scatterPoints: [], centroidPoints: [] };
    }

    // Filter out invalid data
    const validScatterData = scatterData.filter(point => {
      const amount = point.amount || point.y || 0;
      const date = point.date || point.x;
      return amount > 0 && date;
    });

    // Prepare scatter points
    const scatterPoints = validScatterData.map((point, index) => {
      const amount = point.amount || point.y || 0;
      let dateValue;
      
      // Handle date properly
      if (point.date) {
        if (typeof point.date === 'string') {
          dateValue = new Date(point.date).getTime();
        } else if (typeof point.date === 'number') {
          dateValue = point.date;
        } else {
          dateValue = index; // Fallback
        }
      } else {
        dateValue = index; // Fallback
      }

      return {
        id: point.id || `point-${index}`,
        x: amount, // Use actual amount for x-axis
        y: dateValue, // Use timestamp for y-axis (will be formatted)
        z: point.z || Math.sqrt(amount) * 10,
        amount: parseFloat(amount),
        category: point.category || 'Unknown',
        title: point.title || `Expense ${index + 1}`,
        clusterId: point.clusterId || 0,
        date: point.date || new Date(dateValue).toISOString().split('T')[0],
        distance: point.distanceToCenter || 0,
        paymentMethod: point.paymentMethod || 'Cash'
      };
    });

    // Prepare centroid points - FIXED
    const centroidPoints = [];
    if (centroids && centroids.length > 0) {
      // Find min/max values from scatter data for proper centroid scaling
      const amounts = scatterPoints.map(p => p.x).filter(val => !isNaN(val));
      const dates = scatterPoints.map(p => p.y).filter(val => !isNaN(val));
      
      const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
      const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 1000;
      const minDate = dates.length > 0 ? Math.min(...dates) : Date.now() - 30 * 24 * 60 * 60 * 1000;
      const maxDate = dates.length > 0 ? Math.max(...dates) : Date.now();

      centroids.forEach((centroid, index) => {
        if (centroid.coordinates && Array.isArray(centroid.coordinates) && centroid.coordinates.length >= 2) {
          // Convert normalized centroid coordinates (0-1) back to actual values
          const normalizedAmount = centroid.coordinates[0] || 0;
          const normalizedDate = centroid.coordinates[1] || 0;
          
          const actualAmount = minAmount + (normalizedAmount * (maxAmount - minAmount));
          const actualDate = minDate + (normalizedDate * (maxDate - minDate));
          
          centroidPoints.push({
            id: `centroid-${index}`,
            x: actualAmount,
            y: actualDate,
            z: 5, // Higher z-index to appear above points
            label: centroid.label || `Cluster ${index + 1} Center`,
            clusterId: index + 1,
            isCentroid: true,
            size: 20
          });
        } else if (centroid.x && centroid.y) {
          // If centroids already have x,y values
          centroidPoints.push({
            id: `centroid-${index}`,
            x: parseFloat(centroid.x) || 0,
            y: parseFloat(centroid.y) || Date.now(),
            z: 5,
            label: centroid.label || `Cluster ${index + 1} Center`,
            clusterId: index + 1,
            isCentroid: true,
            size: 20
          });
        }
      });
    }

    return { scatterPoints, centroidPoints };
  };

  // Color palette for clusters
  const clusterColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
    '#EF4444', '#EC4899', '#14B8A6', '#F97316'
  ];

  const getClusterColor = (clusterId) => {
    return clusterColors[(clusterId - 1) % clusterColors.length] || '#6B7280';
  };

  const handleClusterSelect = (clusterId) => {
    setSelectedCluster(clusterId === selectedCluster ? null : clusterId);
    if (onClusterClick) {
      onClusterClick(clusterId);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          {data.isCentroid ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-white bg-black rotate-45"></div>
                <p className="font-bold text-lg">{data.label}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Center of Cluster {data.clusterId}</p>
                <p className="text-sm text-gray-600">
                  Avg Position: Rs {(data.x || 0).toLocaleString()}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="font-bold text-gray-800 mb-2">{data.title}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Amount: Rs {data.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getClusterColor(data.clusterId) }}
                  />
                  <span className="text-sm text-gray-600">Cluster: {data.clusterId || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Date: {new Date(data.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Category: {data.category}</p>
                <p className="text-sm text-gray-600">Payment: {data.paymentMethod}</p>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Format date for Y-axis
  const formatYAxis = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Cluster summary cards
  const renderClusterCards = () => {
    if (!clusters || clusters.length === 0) {
      return (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No clusters to display. Run K-Means analysis first.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {clusters.map((cluster) => (
          <motion.div
            key={cluster.id}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => handleClusterSelect(cluster.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedCluster === cluster.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getClusterColor(cluster.id) }}
                ></div>
                <span className="font-bold text-gray-800">{cluster.label}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                {cluster.size || 0} items
              </span>
            </div>
            
            <div className="text-2xl font-bold text-gray-800 mb-1">
              Rs {cluster.totalAmount?.toLocaleString() || '0'}
            </div>
            
            <div className="text-sm text-gray-600">
              Avg: Rs {cluster.avgAmount?.toLocaleString() || '0'}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Distance to center:</span>
                <span className="font-medium">
                  {cluster.averageDistance?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Handle empty data state
  if (processedData.scatterPoints.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
          <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Visualization Data Available</h3>
          <p className="text-gray-600 mb-4">
            Run K-Means analysis to see your expenses clustered on the chart.
          </p>
          <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-600">
              The visualization will show:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Each expense as a colored dot based on its cluster</li>
              <li>• Cluster centers as diamond markers</li>
              <li>• X-axis: Expense Amount (Rs)</li>
              <li>• Y-axis: Date of expense</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-700">
            {processedData.scatterPoints.length} expenses • {clusters?.length || 0} clusters
          </div>
          
          <button
            onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
            className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            {viewMode === '2d' ? (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                3D View
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                2D View
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            {showTooltip ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Tooltip
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Tooltip
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            disabled={zoom <= 0.5}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Zoom Out
          </button>
          
          <span className="text-sm font-medium bg-white px-3 py-1 rounded-lg border">
            {zoom.toFixed(1)}x
          </span>
          
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            disabled={zoom >= 2}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Zoom In
          </button>
        </div>
      </div>

      {/* Cluster Cards */}
      {renderClusterCards()}

      {/* Visualization Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">K-Means Clusters Visualization</h3>
            <p className="text-sm text-gray-600 mt-1">
              Each point represents an expense. Similar expenses are grouped together in clusters.
            </p>
          </div>
          <div className="flex items-center text-sm text-blue-600">
            <Info className="w-4 h-4 mr-2" />
            Click on points/clusters for details
          </div>
        </div>
        
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                dataKey="x"
                name="Amount"
                label={{ 
                  value: 'Expense Amount (Rs)', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { fill: '#4B5563', fontWeight: '500' }
                }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `Rs ${(value/1000000).toFixed(1)}M`;
                  if (value >= 1000) return `Rs ${(value/1000).toFixed(0)}k`;
                  return `Rs ${value}`;
                }}
                domain={['dataMin - 100', 'dataMax + 100']}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Date"
                label={{ 
                  value: 'Date', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#4B5563', fontWeight: '500' }
                }}
                tickFormatter={formatYAxis}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              {viewMode === '3d' && (
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[50, 400]}
                  name="Density"
                />
              )}
              
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: '3 3', stroke: '#9CA3AF' }}
              />
              
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                )}
              />
              
              {/* Expense points */}
              <Scatter
                name="Expenses"
                data={processedData.scatterPoints}
                fillOpacity={0.7}
                strokeWidth={1}
                shape="circle"
              >
                {processedData.scatterPoints.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getClusterColor(entry.clusterId)}
                    stroke={selectedCluster === entry.clusterId ? '#1F2937' : '#ffffff'}
                    strokeWidth={selectedCluster === entry.clusterId ? 2 : 1}
                    onClick={() => handleClusterSelect(entry.clusterId)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Scatter>
              
              {/* Centroid points */}
              {processedData.centroidPoints.length > 0 && (
                <Scatter
                  name="Cluster Centers"
                  data={processedData.centroidPoints}
                  shape="diamond"
                  fill="#1F2937"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Legend:</span>
            {clusters?.map((cluster) => (
              <div key={cluster.id} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getClusterColor(cluster.id) }}
                ></div>
                <span className="text-sm text-gray-600">{cluster.label}</span>
              </div>
            ))}
            {processedData.centroidPoints.length > 0 && (
              <div className="flex items-center ml-4">
                <div className="w-4 h-4 border-2 border-white bg-black rotate-45 mr-2"></div>
                <span className="text-sm text-gray-600">Cluster Center</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Explanation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-4">How to Read This Chart:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h5 className="font-bold text-gray-800">Colored Dots</h5>
            </div>
            <p className="text-sm text-gray-600">
              Each dot represents an expense. Color indicates which cluster it belongs to.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-white bg-black rotate-45"></div>
              <h5 className="font-bold text-gray-800">Diamond Markers</h5>
            </div>
            <p className="text-sm text-gray-600">
              Show the center (average position) of each cluster.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-600 font-bold">X-Axis</div>
            </div>
            <p className="text-sm text-gray-600">
              Expense amount in Rupees. Higher values = more expensive items.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-600 font-bold">Y-Axis</div>
            </div>
            <p className="text-sm text-gray-600">
              Date of expense. Points near top = recent, bottom = older.
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white/50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Interpretation:</span> Expenses that are close together on this chart 
            have similar spending patterns (similar amounts around similar times). K-Means algorithm automatically 
            groups these into clusters for analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KMeansVisualization;