import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, ZAxis
} from 'recharts';
import { Target, Maximize2, Minimize2, Eye, EyeOff, Info } from 'lucide-react';

const KMeansVisualization = ({ clusters, scatterData, centroids, onClusterClick }) => {
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Prepare data for scatter plot
  const prepareScatterData = () => {
    if (!scatterData || scatterData.length === 0) {
      return [];
    }
    
    return scatterData.map((point, index) => ({
      id: point.id || index,
      x: point.x || point.amount || 0,
      y: point.y || (point.date ? new Date(point.date).getTime() : index),
      z: point.z || point.distanceToCenter || 1,
      amount: point.amount || point.y || 0,
      category: point.category || 'Unknown',
      title: point.title || `Expense ${index + 1}`,
      clusterId: point.clusterId || 0,
      date: point.date || new Date().toISOString(),
      distance: point.distanceToCenter || 0
    }));
  };

  // Prepare centroid data
  const prepareCentroidData = () => {
    if (!centroids || centroids.length === 0) {
      return [];
    }
    
    return centroids.map((centroid, index) => ({
      id: `centroid-${index}`,
      x: centroid.coordinates?.[0] || centroid.x || 0,
      y: centroid.coordinates?.[1] || centroid.y || 0,
      z: 3,
      label: centroid.label || `Cluster ${index + 1}`,
      clusterId: index + 1,
      isCentroid: true
    }));
  };

  const scatterPoints = prepareScatterData();
  const centroidPoints = prepareCentroidData();
  const allData = [...scatterPoints, ...centroidPoints];

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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          {data.isCentroid ? (
            <>
              <p className="font-bold text-lg mb-2">{data.label}</p>
              <p className="text-sm text-gray-600">Cluster Center Point</p>
            </>
          ) : (
            <>
              <p className="font-bold">{data.title}</p>
              <p className="text-sm text-gray-600">Amount: Rs {data.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Category: {data.category}</p>
              <p className="text-sm text-gray-600">
                Cluster: {data.clusterId || 'Unassigned'}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Cluster summary cards
  const renderClusterCards = () => {
    if (!clusters || clusters.length === 0) {
      return (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No clusters to display</p>
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-700">
            {scatterPoints.length} expenses • {clusters?.length || 0} clusters
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
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            Zoom Out
          </button>
          
          <span className="text-sm font-medium">{zoom.toFixed(1)}x</span>
          
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            disabled={zoom >= 2}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50"
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
          <h3 className="text-lg font-bold text-gray-800">K-Means Clusters Visualization</h3>
          <div className="flex items-center text-sm text-gray-600">
            <Info className="w-4 h-4 mr-2" />
            Each point represents an expense. Similar expenses are grouped together.
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
                label={{ value: 'Expense Amount (Rs)', position: 'insideBottom', offset: -10 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Time"
                label={{ value: 'Time Sequence', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              {viewMode === '3d' && (
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[50, 400]}
                  name="Cluster Density"
                />
              )}
              
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: '3 3' }}
              />
              
              <Legend />
              
              {/* Expense points */}
              <Scatter
                name="Expenses"
                data={scatterPoints}
                fillOpacity={0.7}
                strokeWidth={1}
              >
                {scatterPoints.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getClusterColor(entry.clusterId)}
                    stroke={selectedCluster === entry.clusterId ? '#000' : '#fff'}
                    strokeWidth={selectedCluster === entry.clusterId ? 2 : 1}
                    onClick={() => handleClusterSelect(entry.clusterId)}
                  />
                ))}
              </Scatter>
              
              {/* Centroid points */}
              <Scatter
                name="Cluster Centers"
                data={centroidPoints}
                shape="diamond"
                fill="#000"
                stroke="#fff"
                strokeWidth={2}
              />
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
            <div className="flex items-center ml-4">
              <div className="w-4 h-4 border-2 border-white bg-black rotate-45 mr-2"></div>
              <span className="text-sm text-gray-600">Cluster Center</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-4">How K-Means Clustering Works:</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
            <h5 className="font-bold mb-2">Choose K Clusters</h5>
            <p className="text-sm text-gray-600">Algorithm decides optimal number of groups (K) based on your data</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
            <h5 className="font-bold mb-2">Initialize Centroids</h5>
            <p className="text-sm text-gray-600">Random starting points placed in data space</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
            <h5 className="font-bold mb-2">Assign Points</h5>
            <p className="text-sm text-gray-600">Each expense assigned to nearest centroid based on amount & time</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">4</div>
            <h5 className="font-bold mb-2">Update & Repeat</h5>
            <p className="text-sm text-gray-600">Centroids move to cluster center until positions stabilize</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KMeansVisualization;