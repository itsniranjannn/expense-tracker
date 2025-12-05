import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Cpu } from 'lucide-react';

const Analysis = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">K-Means Analysis</h1>
        <p className="text-gray-600">AI-powered spending pattern analysis</p>
      </motion.div>

      <div className="card bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Cpu className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">K-Means Clustering Algorithm</h2>
            <p className="text-gray-600">Core algorithm for expense pattern analysis</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Algorithm Flow:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Zap,
                  title: 'Data Collection',
                  desc: 'Expense data preparation and feature extraction'
                },
                {
                  icon: Brain,
                  title: 'Clustering',
                  desc: 'K-Means groups similar expenses into clusters'
                },
                {
                  icon: TrendingUp,
                  title: 'Insights',
                  desc: 'Generate actionable spending insights'
                }
              ].map((step, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                  <step.icon className="w-6 h-6 text-primary-600 mb-2" />
                  <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎓 Academic Requirement</h3>
            <p className="text-blue-700">
              This module fulfills the TU BCA Project-II requirement for implementing a 
              decision-making/business intelligence algorithm. K-Means clustering helps 
              identify spending patterns automatically.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              <span className="font-semibold">Status:</span> Algorithm implementation in progress. 
              The JavaScript implementation will run on the Node.js backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;