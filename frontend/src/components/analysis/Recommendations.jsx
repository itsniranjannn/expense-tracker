import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Download,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

const Recommendations = ({ insights }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [sortBy, setSortBy] = useState('impact');
  const [sortOrder, setSortOrder] = useState('desc');
  const [likedItems, setLikedItems] = useState([]);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);

  const categories = [
    { id: 'all', label: 'All Recommendations', count: insights.length, icon: '💡' },
    { id: 'budgeting', label: 'Budgeting', count: 3, icon: '💰' },
    { id: 'savings', label: 'Savings', count: 2, icon: '🏦' },
    { id: 'spending', label: 'Spending Habits', count: 4, icon: '🛒' },
    { id: 'investment', label: 'Investment', count: 1, icon: '📈' },
    { id: 'planning', label: 'Financial Planning', count: 2, icon: '📅' },
  ];

  const impacts = [
    { id: 'all', label: 'All Impacts', color: 'gray' },
    { id: 'high', label: 'High Impact', color: 'red' },
    { id: 'medium', label: 'Medium Impact', color: 'yellow' },
    { id: 'low', label: 'Low Impact', color: 'green' },
  ];

  // Add more sample insights
// In Recommendations.jsx, replace the allInsights array initialization with:

// Use real insights from props
const allInsights = insights && Array.isArray(insights) ? insights.map((insight, index) => ({
  id: index + 1,
  title: insight.title || `Recommendation ${index + 1}`,
  description: insight.description || 'Optimize your spending based on detected patterns',
  impact: insight.impact || (index === 0 ? 'High' : 'Medium'),
  category: insight.category || 'budgeting',
  estimatedSavings: insight.estimatedSavings || Math.floor(Math.random() * 10000) + 1000,
  timeToImplement: insight.timeToImplement || ['15 minutes', '1 hour', '2 hours'][index % 3],
  difficulty: insight.difficulty || ['Easy', 'Medium', 'Hard'][index % 3],
  priority: insight.priority || index + 1,
  tags: insight.tags || ['Budget', 'Savings', 'Optimization']
})) : [
  // Fallback sample data if no insights
  {
    id: 1,
    title: 'Review High Spending Categories',
    description: 'Focus on reducing expenses in your highest spending categories',
    impact: 'High',
    category: 'budgeting',
    estimatedSavings: 12000,
    timeToImplement: '30 minutes',
    difficulty: 'Easy',
    priority: 1,
    tags: ['Budget', 'Review', 'High Impact']
  },{
      id: 5,
      title: 'Automate Savings',
      description: 'Set up automatic transfers to savings account on payday',
      impact: 'High',
      category: 'savings',
      estimatedSavings: 15000,
      timeToImplement: '15 minutes',
      difficulty: 'Easy',
      priority: 1,
      tags: ['Automation', 'Savings', 'Smart']
    },
    {
      id: 6,
      title: 'Review Insurance Policies',
      description: 'Consolidate insurance policies to get better rates',
      impact: 'Medium',
      category: 'planning',
      estimatedSavings: 8000,
      timeToImplement: '2 hours',
      difficulty: 'Medium',
      priority: 3,
      tags: ['Insurance', 'Consolidation']
    },
    {
      id: 7,
      title: 'Meal Planning',
      description: 'Plan meals weekly to reduce food waste and eating out',
      impact: 'Medium',
      category: 'spending',
      estimatedSavings: 5000,
      timeToImplement: '1 hour',
      difficulty: 'Easy',
      priority: 2,
      tags: ['Food', 'Planning', 'Health']
    },
    {
      id: 8,
      title: 'Start Emergency Fund',
      description: 'Build 3-6 months of expenses in an emergency fund',
      impact: 'High',
      category: 'savings',
      estimatedSavings: 'N/A',
      timeToImplement: 'Ongoing',
      difficulty: 'Medium',
      priority: 1,
      tags: ['Emergency', 'Security', 'Essential']
    }
  ];

  const filteredInsights = allInsights.filter(insight => {
    if (selectedCategory !== 'all' && insight.category !== selectedCategory) return false;
    if (selectedImpact !== 'all' && insight.impact.toLowerCase() !== selectedImpact) return false;
    return true;
  });

  // Sort insights
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    let aValue, bValue;
    
    switch(sortBy) {
      case 'impact':
        const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        aValue = impactOrder[a.impact];
        bValue = impactOrder[b.impact];
        break;
      case 'savings':
        aValue = a.estimatedSavings || 0;
        bValue = b.estimatedSavings || 0;
        break;
      case 'priority':
        aValue = a.priority || 0;
        bValue = b.priority || 0;
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleLike = (id) => {
    setLikedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBookmark = (id) => {
    setBookmarkedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleMarkAsDone = (id) => {
    // Implement mark as done functionality
    alert(`Marked recommendation ${id} as done`);
  };

  const exportRecommendations = () => {
    const exportData = sortedInsights.map(insight => ({
      Title: insight.title,
      Description: insight.description,
      Impact: insight.impact,
      Category: insight.category,
      'Estimated Savings': insight.estimatedSavings || 'N/A',
      'Time to Implement': insight.timeToImplement,
      Difficulty: insight.difficulty,
      Priority: insight.priority
    }));

    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recommendations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Personalized Recommendations</h2>
            <p className="text-blue-100">AI-powered suggestions to optimize your finances</p>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-3xl font-bold">{sortedInsights.length}</div>
              <div className="text-blue-200 text-sm">Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">3</div>
              <div className="text-blue-200 text-sm">High Impact</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">Rs 45,000</div>
              <div className="text-blue-200 text-sm">Potential Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {/* Category Filters */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Filters */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Impact:</span>
              <div className="flex gap-2">
                {impacts.map(impact => (
                  <button
                    key={impact.id}
                    onClick={() => setSelectedImpact(impact.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedImpact === impact.id
                        ? impact.id === 'all' 
                          ? 'bg-gray-800 text-white'
                          : `bg-${impact.color}-600 text-white`
                        : `bg-${impact.color}-100 text-${impact.color}-800 hover:bg-${impact.color}-200`
                    }`}
                  >
                    {impact.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="impact">Impact</option>
                <option value="savings">Potential Savings</option>
                <option value="priority">Priority</option>
                <option value="difficulty">Difficulty</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={exportRecommendations}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
              expandedItem === insight.id ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getImpactColor(insight.impact)}`}>
                      {insight.impact} Impact
                    </span>
                    <span className="text-xs text-gray-500">
                      Priority: {insight.priority || 'Medium'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{insight.title}</h3>
                  <p className="text-gray-600">{insight.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLike(insight.id)}
                    className={`p-2 rounded-lg ${
                      likedItems.includes(insight.id)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {likedItems.includes(insight.id) ? (
                      <ThumbsUp className="w-5 h-5" />
                    ) : (
                      <ThumbsUp className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleBookmark(insight.id)}
                    className={`p-2 rounded-lg ${
                      bookmarkedItems.includes(insight.id)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {insight.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-700">Potential Savings</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {insight.estimatedSavings === 'N/A' 
                      ? 'N/A' 
                      : `Rs ${insight.estimatedSavings?.toLocaleString()}`
                    }
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-gray-700">Time Required</span>
                  </div>
                  <div className={`text-lg font-bold ${getDifficultyColor(insight.difficulty)}`}>
                    {insight.timeToImplement}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium text-gray-700">Difficulty</span>
                  </div>
                  <div className={`text-lg font-bold ${getDifficultyColor(insight.difficulty)}`}>
                    {insight.difficulty}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleMarkAsDone(insight.id)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Done
                  </button>
                  
                  <button
                    onClick={() => setExpandedItem(expandedItem === insight.id ? null : insight.id)}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    {expandedItem === insight.id ? 'Show Less' : 'Learn More'}
                  </button>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedItem === insight.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <h4 className="font-bold text-gray-800 mb-3">Implementation Steps</h4>
                    <ol className="space-y-2 mb-4">
                      {[
                        'Review current spending in this category',
                        'Set specific, measurable goals',
                        'Create an action plan with timelines',
                        'Monitor progress weekly',
                        'Adjust strategy as needed'
                      ].map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">Pro Tip</span>
                      </div>
                      <p className="text-blue-700 text-sm">
                        Start with small, achievable changes and gradually increase your goals. 
                        Track your progress using our budgeting tools.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {sortedInsights.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No recommendations found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters to see more recommendations
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedImpact('all');
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Potential Impact Summary</h3>
            <p className="text-green-100">
              Implementing all high-impact recommendations could save you approximately
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">Rs 45,000</div>
            <div className="text-green-200">per year</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingDown className="w-5 h-5 mr-2" />
              <span className="font-bold">Immediate Impact</span>
            </div>
            <p className="text-green-100 text-sm">
              3 recommendations can be implemented this week
            </p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="font-bold">Long-term Benefits</span>
            </div>
            <p className="text-green-100 text-sm">
              5 recommendations build financial security over time
            </p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Star className="w-5 h-5 mr-2" />
              <span className="font-bold">Quick Wins</span>
            </div>
            <p className="text-green-100 text-sm">
              2 recommendations take less than 30 minutes to implement
            </p>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">30-Day Action Plan</h3>
        
        <div className="space-y-6">
          {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, weekIndex) => (
            <div key={week} className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4">
                  {weekIndex + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{week}</h4>
                  <p className="text-sm text-gray-600">
                    {weekIndex === 0 && 'Focus on high-impact, easy wins'}
                    {weekIndex === 1 && 'Implement medium-difficulty changes'}
                    {weekIndex === 2 && 'Review and adjust strategies'}
                    {weekIndex === 3 && 'Plan for next month'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedInsights
                  .filter((_, index) => index % 4 === weekIndex)
                  .slice(0, 2)
                  .map(insight => (
                    <div key={insight.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{insight.title}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                          {insight.impact}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-800">Track Your Progress</p>
              <p className="text-sm text-blue-700">
                Use our progress tracking feature to monitor your implementation journey
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;