import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../contexts/CollectionContext';
import { useRating } from '../../contexts/RatingContext';
import { useNavigate } from 'react-router-dom';

function WhiskeyCard({ whiskey, inCollection = false }) {
  const { isAuthenticated } = useAuth();
  const { addToCollection } = useCollection();
  const { userRatings, whiskeyRatings } = useRating();
  
  const navigate = useNavigate();
  
  // Calculate average rating
  const ratings = whiskeyRatings.filter(r => r.WhiskeyId === whiskey.id);
  const averageRating = {
    average: 0,
    count: ratings.length
  };
  
  if (averageRating.count > 0) {
    averageRating.average = ratings.reduce((acc, curr) => acc + curr.score, 0) / averageRating.count;
  }
  
  // Check for user rating
  const userRating = userRatings.find(r => r.WhiskeyId === whiskey.id);
  
  const handleAddToCollection = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    await addToCollection({
      whiskeyId: whiskey.id,
      purchaseDate: new Date().toISOString().split('T')[0],
      bottleStatus: 'sealed'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/whiskey/${whiskey.id}`}>
              <h2 className="text-xl font-bold mb-2 text-amber-800 hover:text-amber-600">{whiskey.name}</h2>
            </Link>
            <p className="text-gray-700 mb-1">{whiskey.distillery}</p>
            <p className="text-gray-600 mb-1">{whiskey.type} | {whiskey.country}</p>
            {whiskey.age && (
              <p className="text-gray-600 mb-1">{whiskey.age} Years</p>
            )}
            {whiskey.abv && (
              <p className="text-gray-600 mb-1">{whiskey.abv}% ABV</p>
            )}
          </div>
          
          {whiskey.imageUrl ? (
            <img 
              src={whiskey.imageUrl} 
              alt={whiskey.name} 
              className="w-16 h-16 object-cover rounded-md"
            />
          ) : (
            <div className="w-16 h-16 bg-amber-100 rounded-md flex items-center justify-center">
              <span className="text-amber-800 text-xs">No Image</span>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          {averageRating.count > 0 ? (
            <p className="text-gray-700">
              Rating: {averageRating.average.toFixed(1)}/100 ({averageRating.count} {averageRating.count === 1 ? 'review' : 'reviews'})
            </p>
          ) : (
            <p className="text-gray-500 italic">No ratings yet</p>
          )}
          
          {userRating && (
            <p className="text-gray-700">Your rating: {userRating.score}/100</p>
          )}
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Link 
            to={`/whiskey/${whiskey.id}`}
            className="px-3 py-1 bg-amber-700 text-white rounded hover:bg-amber-600 text-sm"
          >
            Details
          </Link>
          
          {isAuthenticated && (
            <>
              {!inCollection ? (
                <button 
                  onClick={handleAddToCollection}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 text-sm"
                >
                  Add to Collection
                </button>
              ) : (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm flex items-center">
                  In Collection
                </span>
              )}
              
              <Link 
                to={`/rate/${whiskey.id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
              >
                {userRating ? 'Edit Rating' : 'Rate'}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhiskeyCard;