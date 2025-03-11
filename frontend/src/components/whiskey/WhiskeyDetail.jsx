// src/components/whiskey/WhiskeyDetail.jsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWhiskey } from '../../contexts/WhiskeyContext';
import { useRating } from '../../contexts/RatingContext';
import { useCollection } from '../../contexts/CollectionContext';
import { useAuth } from '../../contexts/AuthContext';

function WhiskeyDetail() {
  const { id } = useParams();
  const { getWhiskeyById } = useWhiskey();
  const { getWhiskeyRatings, getUserRatings, whiskeyRatings, userRatings } = useRating();
  const { collection, getUserCollection, addToCollection } = useCollection();
  const { isAuthenticated } = useAuth();
  
  const [whiskey, setWhiskey] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [inCollection, setInCollection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get whiskey details
        const whiskeyResult = await getWhiskeyById(id);
        
        if (!whiskeyResult.success) {
          setError(whiskeyResult.message);
          setIsLoading(false);
          return;
        }
        
        setWhiskey(whiskeyResult.data);
        
        // Get whiskey ratings
        await getWhiskeyRatings(id);
        
        // If user is authenticated, check if whiskey is in collection
        if (isAuthenticated) {
          await getUserCollection();
          setInCollection(collection.some(item => item.WhiskeyId === parseInt(id)));
          
          // Get user's rating for this whiskey
          await getUserRatings();
          setUserRating(userRatings.find(r => r.WhiskeyId === parseInt(id)));
        }
      } catch (err) {
        setError('Failed to load whiskey details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, isAuthenticated]);
  
  const handleAddToCollection = async () => {
    const result = await addToCollection({
      whiskeyId: whiskey.id,
      purchaseDate: new Date().toISOString().split('T')[0],
      bottleStatus: 'sealed'
    });
    
    if (result.success) {
      setInCollection(true);
    }
  };
  
  const getAverageRating = () => {
    if (whiskeyRatings.length === 0) return 'No ratings yet';
    
    const sum = whiskeyRatings.reduce((acc, rating) => acc + rating.score, 0);
    return `${(sum / whiskeyRatings.length).toFixed(1)}/100 (${whiskeyRatings.length} ${whiskeyRatings.length === 1 ? 'rating' : 'ratings'})`;
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
        </div>
      ) : error ? (
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-red-100 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      ) : whiskey ? (
        <div className="max-w-3xl mx-auto mt-8">
          {/* Whiskey Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image or placeholder */}
              <div className="w-full md:w-1/3">
                {whiskey.imageUrl ? (
                  <img 
                    src={whiskey.imageUrl} 
                    alt={whiskey.name} 
                    className="w-full h-64 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-64 bg-amber-100 rounded-md flex items-center justify-center">
                    <span className="text-amber-800 text-lg">No Image Available</span>
                  </div>
                )}
              </div>
              
              {/* Whiskey details */}
              <div className="w-full md:w-2/3">
                <h1 className="text-3xl font-bold text-amber-800 mb-2">{whiskey.name}</h1>
                <p className="text-xl text-gray-700 mb-4">{whiskey.distillery}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600"><span className="font-semibold">Type:</span> {whiskey.type}</p>
                    <p className="text-gray-600"><span className="font-semibold">Country:</span> {whiskey.country}</p>
                    {whiskey.region && (
                      <p className="text-gray-600"><span className="font-semibold">Region:</span> {whiskey.region}</p>
                    )}
                  </div>
                  <div>
                    {whiskey.age && (
                      <p className="text-gray-600"><span className="font-semibold">Age:</span> {whiskey.age} Years</p>
                    )}
                    {whiskey.abv && (
                      <p className="text-gray-600"><span className="font-semibold">ABV:</span> {whiskey.abv}%</p>
                    )}
                    {whiskey.price && (
                      <p className="text-gray-600"><span className="font-semibold">Price:</span> ${whiskey.price}</p>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold">Average Rating:</span> {getAverageRating()}
                </p>
                
                {whiskey.description && (
                  <p className="text-gray-700 mb-6">{whiskey.description}</p>
                )}
                
                <div className="flex space-x-3">
                  {isAuthenticated ? (
                    <>
                      {!inCollection ? (
                        <button 
                          onClick={handleAddToCollection}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                        >
                          Add to Collection
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center">
                          In Collection
                        </span>
                      )}
                      
                      <Link 
                        to={`/rate/${whiskey.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                      >
                        {userRating ? 'Edit Rating' : 'Rate Whiskey'}
                      </Link>
                    </>
                  ) : (
                    <Link 
                      to="/login"
                      className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
                    >
                      Login to Rate & Collect
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Ratings Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Ratings & Reviews</h2>
            
            {whiskeyRatings.length > 0 ? (
              <div className="space-y-4">
                {whiskeyRatings.map(rating => (
                  <div key={rating.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold">{rating.User?.username || 'Anonymous'}</span>
                        <span className="text-amber-700 ml-2">{rating.score}/100</span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {(rating.nose || rating.taste || rating.finish) && (
                      <div className="grid grid-cols-3 gap-2 mb-2 text-sm text-gray-700">
                        {rating.nose && (
                          <div>Nose: {rating.nose}/10</div>
                        )}
                        {rating.taste && (
                          <div>Taste: {rating.taste}/10</div>
                        )}
                        {rating.finish && (
                          <div>Finish: {rating.finish}/10</div>
                        )}
                      </div>
                    )}
                    
                    {rating.notes && (
                      <p className="text-gray-700">{rating.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">No ratings yet. Be the first to rate this whiskey!</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default WhiskeyDetail;