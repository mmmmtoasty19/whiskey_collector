// src/components/rating/UserRatings.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRating } from '../../contexts/RatingContext';

function UserRatings() {
  const { userRatings, isLoading, error, getUserRatings, deleteRating } = useRating();
  
  // Sort options
  const sortOptions = [
    { value: 'date', label: 'Date (Newest)' },
    { value: 'score', label: 'Score (Highest)' },
    { value: 'whiskey', label: 'Whiskey Name' }
  ];
  const [selectedSort, setSelectedSort] = useState('date');
  
  const [sortedRatings, setSortedRatings] = useState([]);
  
  useEffect(() => {
    getUserRatings();
  }, []);
  
  useEffect(() => {
    setSortedRatings(sortRatings(userRatings, selectedSort));
  }, [userRatings, selectedSort]);
  
  function sortRatings(ratings, sortBy) {
    return [...ratings].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'score') {
        return b.score - a.score;
      } else if (sortBy === 'whiskey') {
        return a.Whiskey.name.localeCompare(b.Whiskey.name);
      }
      return 0;
    });
  }
  
  async function handleDeleteRating(id) {
    if (window.confirm('Are you sure you want to delete this rating?')) {
      await deleteRating(id);
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">My Whiskey Ratings</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-100 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      ) : userRatings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl text-gray-700 mb-4">You haven't rated any whiskies yet</h2>
          <p className="text-gray-600 mb-6">Start rating whiskies to build your tasting profile.</p>
          <Link 
            to="/whiskies"
            className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
          >
            Browse Whiskies to Rate
          </Link>
        </div>
      ) : (
        <>
          {/* Sort Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-end">
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-select" className="text-gray-700">Sort by:</label>
              <select 
                id="sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Ratings List */}
          <div className="space-y-6">
            {sortedRatings.map(rating => (
              <div key={rating.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <div>
                      <Link 
                        to={`/whiskey/${rating.WhiskeyId}`}
                        className="text-xl font-bold text-amber-800 hover:text-amber-600"
                      >
                        {rating.Whiskey.name}
                      </Link>
                      <p className="text-gray-700">{rating.Whiskey.distillery}</p>
                    </div>
                    
                    <div className="mt-2 sm:mt-0 flex items-center">
                      <span className="text-2xl font-bold text-amber-700">{rating.score}</span>
                      <span className="text-gray-600 ml-1">/100</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-amber-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Nose</div>
                      <div className="font-bold">{rating.nose || 'N/A'}/10</div>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Taste</div>
                      <div className="font-bold">{rating.taste || 'N/A'}/10</div>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Finish</div>
                      <div className="font-bold">{rating.finish || 'N/A'}/10</div>
                    </div>
                  </div>
                  
                  {rating.notes && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-700 mb-1">Notes:</h3>
                      <p className="text-gray-700">{rating.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Rated on {new Date(rating.createdAt).toLocaleDateString()}
                      {rating.createdAt !== rating.updatedAt && (
                        <span> (Updated on {new Date(rating.updatedAt).toLocaleDateString()})</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to={`/rate/${rating.WhiskeyId}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                      >
                        Edit
                      </Link>
                      
                      <button 
                        onClick={() => handleDeleteRating(rating.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default UserRatings;