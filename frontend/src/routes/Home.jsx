// src/routes/Home.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWhiskey } from '../contexts/WhiskeyContext';
import { useAuth } from '../contexts/AuthContext';
import WhiskeyCard from '../components/whiskey/WhiskeyCard';

function Home() {
  const [featuredWhiskies, setFeaturedWhiskies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { whiskies, getAllWhiskies } = useWhiskey();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      await getAllWhiskies();
      
      // Get a few random whiskies to feature on homepage
      if (whiskies.length > 0) {
        const shuffled = [...whiskies].sort(() => 0.5 - Math.random());
        setFeaturedWhiskies(shuffled.slice(0, 3));
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-amber-800 text-white py-16 px-4 rounded-lg shadow-lg mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Track Your Whiskey Journey</h1>
          <p className="text-xl mb-8">
            Collect, rate, and discover new whiskies with our comprehensive whiskey collection app.
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/collection"
                className="px-6 py-3 bg-white text-amber-800 rounded-lg font-bold hover:bg-amber-100"
              >
                View My Collection
              </Link>
              <Link 
                to="/whiskies"
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500"
              >
                Explore Whiskies
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register"
                className="px-6 py-3 bg-white text-amber-800 rounded-lg font-bold hover:bg-amber-100"
              >
                Sign Up
              </Link>
              <Link 
                to="/login" 
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-amber-700 text-2xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Track Your Collection</h3>
            <p className="text-gray-700">
              Keep track of all your whiskies, including purchase dates, prices, and bottle status.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-amber-700 text-2xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">Rate & Review</h3>
            <p className="text-gray-700">
              Rate whiskies on nose, taste, and finish. Share your tasting notes and experiences.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-amber-700 text-2xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Discover New Whiskies</h3>
            <p className="text-gray-700">
              Explore our database of whiskies from around the world and find your next favorite.
            </p>
          </div>
        </div>
      </div>
      
      {/* Featured Whiskies Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">Featured Whiskies</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
          </div>
        ) : featuredWhiskies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-700">No whiskies available at the moment. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredWhiskies.map(whiskey => (
                <WhiskeyCard key={whiskey.id} whiskey={whiskey} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                to="/whiskies"
                className="px-6 py-3 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-600 inline-block"
              >
                View All Whiskies
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;