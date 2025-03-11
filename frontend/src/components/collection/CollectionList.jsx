import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../../contexts/CollectionContext';

function CollectionList() {
  const { collection, isLoading, error, getUserCollection, updateCollectionEntry, removeFromCollection } = useCollection();
  
  // Bottle status options for filtering
  const bottleStatusOptions = ['All', 'Sealed', 'Opened', 'Empty'];
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'distillery', label: 'Distillery' },
    { value: 'type', label: 'Type' },
    { value: 'age', label: 'Age' },
    { value: 'purchaseDate', label: 'Purchase Date' }
  ];
  const [selectedSort, setSelectedSort] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Collection data
  const [filteredCollection, setFilteredCollection] = useState([]);
  const [sortedCollection, setSortedCollection] = useState([]);
  
  useEffect(() => {
    getUserCollection();
  }, []);
  
  useEffect(() => {
    setFilteredCollection(filterCollection(collection, selectedStatus));
  }, [collection, selectedStatus]);
  
  useEffect(() => {
    setSortedCollection(sortCollection(filteredCollection, selectedSort, sortDirection));
  }, [filteredCollection, selectedSort, sortDirection]);
  
  function filterCollection(collection, status) {
    if (status === 'All') return collection;
    
    return collection.filter(item => 
      item.bottleStatus.toLowerCase() === status.toLowerCase()
    );
  }
  
  function sortCollection(collection, sortBy, direction) {
    return [...collection].sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'name') {
        valueA = a.Whiskey.name.toLowerCase();
        valueB = b.Whiskey.name.toLowerCase();
      } else if (sortBy === 'distillery') {
        valueA = a.Whiskey.distillery.toLowerCase();
        valueB = b.Whiskey.distillery.toLowerCase();
      } else if (sortBy === 'type') {
        valueA = a.Whiskey.type.toLowerCase();
        valueB = b.Whiskey.type.toLowerCase();
      } else if (sortBy === 'age') {
        valueA = a.Whiskey.age || 0;
        valueB = b.Whiskey.age || 0;
      } else if (sortBy === 'purchaseDate') {
        valueA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
        valueB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
      }
      
      if (direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }
  
  function toggleSortDirection() {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  }
  
  async function handleUpdateBottleStatus(id, newStatus) {
    await updateCollectionEntry(id, { bottleStatus: newStatus });
  }
  
  async function handleRemoveFromCollection(id) {
    if (window.confirm('Are you sure you want to remove this whiskey from your collection?')) {
      await removeFromCollection(id);
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">My Whiskey Collection</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-100 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      ) : collection.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl text-gray-700 mb-4">Your collection is empty</h2>
          <p className="text-gray-600 mb-6">Start building your whiskey collection by browsing available whiskies.</p>
          <Link 
            to="/whiskies" 
            className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
          >
            Browse Whiskies
          </Link>
        </div>
      ) : (
        <>
          {/* Filters and Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <label htmlFor="select-status" className="text-gray-700">Status:</label>
                <select 
                  id="select-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                >
                  {bottleStatusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <label htmlFor="select-sort" className="text-gray-700">Sort by:</label>
                <select 
                  id="select-sort"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <button 
                  onClick={toggleSortDirection}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Collection Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Whiskey</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedCollection.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.Whiskey.imageUrl && (
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={item.Whiskey.imageUrl} 
                                alt={item.Whiskey.name}
                              />
                            </div>
                          )}
                          <div className="ml-4">
                            <Link 
                              to={`/whiskey/${item.Whiskey.id}`}
                              className="text-sm font-medium text-amber-800 hover:text-amber-600"
                            >
                              {item.Whiskey.name}
                            </Link>
                            <div className="text-sm text-gray-500">{item.Whiskey.distillery}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.Whiskey.type}</div>
                        <div className="text-sm text-gray-500">
                          {item.Whiskey.country}
                          {item.Whiskey.region && ` - ${item.Whiskey.region}`}
                        </div>
                        {item.Whiskey.age && (
                          <div className="text-sm text-gray-500">{item.Whiskey.age} Years</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.purchaseDate && (
                          <div className="text-sm text-gray-900">
                            {new Date(item.purchaseDate).toLocaleDateString()}
                          </div>
                        )}
                        {item.purchasePrice && (
                          <div className="text-sm text-gray-500">${item.purchasePrice}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          value={item.bottleStatus}
                          onChange={(e) => handleUpdateBottleStatus(item.id, e.target.value)}
                          className="text-sm p-1 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                        >
                          <option value="sealed">Sealed</option>
                          <option value="opened">Opened</option>
                          <option value="empty">Empty</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/collection/edit/${item.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleRemoveFromCollection(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CollectionList;