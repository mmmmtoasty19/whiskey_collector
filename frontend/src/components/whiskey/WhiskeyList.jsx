// src/components/whiskey/WhiskeyList.jsx

import { useEffect, useState } from 'react';
import { useWhiskey } from '../../contexts/WhiskeyContext';
import { useCollection } from '../../contexts/CollectionContext';
import { useRating } from '../../contexts/RatingContext';
import { useAuth } from '../../contexts/AuthContext';
import WhiskeyCard from './WhiskeyCard';

function WhiskeyList() {
  const { whiskies, isLoading, error, getAllWhiskies, searchWhiskies } = useWhiskey();
  const { isAuthenticated } = useAuth();
  const { collection, getUserCollection } = useCollection();
  const { getUserRatings } = useRating();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Type and country options for filtering
  const [typeOptions, setTypeOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load all whiskies
        await getAllWhiskies();
        
        // If user is logged in, get their collection and ratings
        if (isAuthenticated) {
          await getUserCollection();
          await getUserRatings();
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);
  
  useEffect(() => {
    // Extract unique types and countries for filters
    if (whiskies.length > 0) {
      const types = new Set();
      const countries = new Set();
      
      whiskies.forEach(whiskey => {
        if (whiskey.type) types.add(whiskey.type);
        if (whiskey.country) countries.add(whiskey.country);
      });
      
      setTypeOptions(Array.from(types).sort());
      setCountryOptions(Array.from(countries).sort());
    }
  }, [whiskies]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    searchWhiskies({
      query: searchQuery,
      type: selectedType,
      country: selectedCountry
    });
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedCountry('');
    getAllWhiskies();
  };
  
  const checkInCollection = (whiskeyId) => {
    return collection.some(item => item.WhiskeyId === whiskeyId);
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Whiskey Collection</h1>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search whiskies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
            >
              <option value="">All Types</option>
              {typeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
            >
              <option value="">All Countries</option>
              {countryOptions.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 focus:outline-none"
            >
              Search
            </button>
            
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-100 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      ) : whiskies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl text-gray-700 mb-4">No whiskies found</h2>
          <p className="text-gray-600">Try adjusting your search criteria or reset filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whiskies.map(whiskey => (
            <WhiskeyCard 
              key={whiskey.id}
              whiskey={whiskey} 
              inCollection={isAuthenticated && checkInCollection(whiskey.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WhiskeyList;