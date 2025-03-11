import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWhiskey } from '../../contexts/WhiskeyContext';
import { useCollection } from '../../contexts/CollectionContext';

function CollectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWhiskeyById } = useWhiskey();
  const { collection, getUserCollection, addToCollection, updateCollectionEntry } = useCollection();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [whiskey, setWhiskey] = useState(null);
  const [collectionEntry, setCollectionEntry] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  
  // Form data
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [bottleStatus, setBottleStatus] = useState('sealed');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsEdit(id && !isNaN(id));
        
        if (isEdit) {
          // Editing existing collection entry
          await getUserCollection();
          
          const entry = collection.find(
            entry => entry.id === parseInt(id)
          );
          
          if (!entry) {
            setError('Collection entry not found');
            setIsLoading(false);
            return;
          }
          
          setCollectionEntry(entry);
          
          // Load whiskey details
          const whiskeyResult = await getWhiskeyById(entry.WhiskeyId);
          if (!whiskeyResult.success) {
            setError(whiskeyResult.message);
            setIsLoading(false);
            return;
          }
          
          setWhiskey(whiskeyResult.data);
          
          // Pre-fill form with existing data
          setPurchaseDate(entry.purchaseDate ? 
            new Date(entry.purchaseDate).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0]);
          setPurchasePrice(entry.purchasePrice || '');
          setBottleStatus(entry.bottleStatus || 'sealed');
          setNotes(entry.notes || '');
        } else {
          // Adding new entry
          const whiskeyResult = await getWhiskeyById(id);
          
          if (!whiskeyResult.success) {
            setError(whiskeyResult.message);
            setIsLoading(false);
            return;
          }
          
          setWhiskey(whiskeyResult.data);
        }
      } catch (err) {
        setError('Failed to load data');
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
      const collectionData = {
        purchaseDate,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        bottleStatus,
        notes
      };
      
      let result;
      
      if (isEdit) {
        // Update existing entry
        result = await updateCollectionEntry(id, collectionData);
      } else {
        // Add new entry
        collectionData.whiskeyId = whiskey.id;
        result = await addToCollection(collectionData);
      }
      
      if (result.success) {
        setSuccessMessage(isEdit 
          ? 'Collection entry updated successfully!' 
          : 'Whiskey added to your collection!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/collection');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to save collection entry');
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
          <Link to="/collection" className="mt-4 inline-block text-amber-700 hover:text-amber-600">
            Go back to collection
          </Link>
        </div>
      ) : whiskey ? (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-amber-800 mb-1">
              {isEdit ? 'Edit Collection Entry' : 'Add to Collection'}
            </h1>
            <h2 className="text-xl text-gray-700 mb-6">{whiskey.name} - {whiskey.distillery}</h2>
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="purchaseDate" className="block font-semibold text-gray-700 mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="purchasePrice" className="block font-semibold text-gray-700 mb-2">
                  Purchase Price (Optional)
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                  placeholder="Enter purchase price..."
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="bottleStatus" className="block font-semibold text-gray-700 mb-2">
                  Bottle Status
                </label>
                <select
                  id="bottleStatus"
                  value={bottleStatus}
                  onChange={(e) => setBottleStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                >
                  <option value="sealed">Sealed</option>
                  <option value="opened">Opened</option>
                  <option value="empty">Empty</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                  placeholder="Enter any notes about this bottle..."
                ></textarea>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : isEdit ? 'Update Entry' : 'Add to Collection'}
                </button>
                
                <Link 
                  to={isEdit ? '/collection' : `/whiskey/${whiskey.id}`}
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

export default CollectionForm;