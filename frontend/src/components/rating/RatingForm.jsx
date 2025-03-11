// src/components/rating/RatingForm.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWhiskey } from '../../contexts/WhiskeyContext';
import { useRating } from '../../contexts/RatingContext';

function RatingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWhiskeyById } = useWhiskey();
  const { getUserRatings, rateWhiskey } = useRating();
  
  const [whiskey, setWhiskey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Rating form data
  const [score, setScore] = useState(75);
  const [nose, setNose] = useState(5);
  const [taste, setTaste] = useState(5);
  const [finish, setFinish] = useState(5);
  const [notes, setNotes] = useState('');
  
  // Existing rating
  const [existingRating, setExistingRating] = useState(null);
  
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
        
        // Check for existing rating
        const ratingsResult = await getUserRatings();
        if (ratingsResult.success) {
          const userRating = ratingsResult.data.find(r => r.WhiskeyId === parseInt(id));
          
          if (userRating) {
            setExistingRating(userRating);
            
            // Pre-fill form
            setScore(userRating.score);
            setNose(userRating.nose || 5);
            setTaste(userRating.taste || 5);
            setFinish(userRating.finish || 5);
            setNotes(userRating.notes || '');
          }
        }
      } catch (err) {
        setError('Failed to load whiskey details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const result = await rateWhiskey(whiskey.id, {
        score,
        nose,
        taste,
        finish,
        notes
      });
      
      if (result.success) {
        setSuccessMessage(existingRating 
          ? 'Your rating has been updated!' 
          : 'Your rating has been submitted!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(`/whiskey/${whiskey.id}`);
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to submit rating');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-100 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Link to="/" className="mt-4 inline-block text-amber-700 hover:text-amber-600">Go back to home</Link>
        </div>
      ) : whiskey ? (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-amber-800 mb-1">Rate Whiskey</h1>
            <h2 className="text-xl text-gray-700 mb-6">{whiskey.name} - {whiskey.distillery}</h2>
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Overall Score */}
              <div className="mb-6">
                <label htmlFor="score-input" className="block font-semibold text-gray-700 mb-2">
                  Overall Score: {score}/100
                </label>
                <input 
                  id="score-input"
                  type="range" 
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  min="0" 
                  max="100" 
                  step="1"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              {/* Nose, Taste, Finish */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label htmlFor="nose-input" className="block font-semibold text-gray-700 mb-2">
                    Nose: {nose}/10
                  </label>
                  <input 
                    id="nose-input"
                    type="range" 
                    value={nose}
                    onChange={(e) => setNose(Number(e.target.value))}
                    min="0" 
                    max="10" 
                    step="1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label htmlFor="taste-input" className="block font-semibold text-gray-700 mb-2">
                    Taste: {taste}/10
                  </label>
                  <input 
                    id="taste-input"
                    type="range" 
                    value={taste}
                    onChange={(e) => setTaste(Number(e.target.value))}
                    min="0" 
                    max="10" 
                    step="1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label htmlFor="finish-input" className="block font-semibold text-gray-700 mb-2">
                    Finish: {finish}/10
                  </label>
                  <input 
                    id="finish-input"
                    type="range" 
                    value={finish}
                    onChange={(e) => setFinish(Number(e.target.value))}
                    min="0" 
                    max="10" 
                    step="1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block font-semibold text-gray-700 mb-2">
                  Tasting Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                  placeholder="Describe your experience with this whiskey..."
                ></textarea>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
                </button>
                
                <Link 
                  to={`/whiskey/${whiskey.id}`}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default RatingForm;