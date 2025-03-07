<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { collectionStore } from '../../stores/collectionStore';
  
  let isLoading = true;
  let error = null;
  
  // Bottle status options for filtering
  const bottleStatusOptions = ['All', 'Sealed', 'Opened', 'Empty'];
  let selectedStatus = 'All';
  
  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'distillery', label: 'Distillery' },
    { value: 'type', label: 'Type' },
    { value: 'age', label: 'Age' },
    { value: 'purchaseDate', label: 'Purchase Date' }
  ];
  let selectedSort = 'name';
  let sortDirection = 'asc';
  
  // Collection data
  $: collection = $collectionStore.collection;
  $: filteredCollection = filterCollection(collection, selectedStatus);
  $: sortedCollection = sortCollection(filteredCollection, selectedSort, sortDirection);
  
  onMount(async () => {
    try {
      await collectionStore.getUserCollection();
    } catch (err) {
      error = 'Failed to load collection';
      console.error(err);
    } finally {
      isLoading = false;
    }
  });
  
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
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  }
  
  async function updateBottleStatus(id, newStatus) {
    await collectionStore.updateCollectionEntry(id, { bottleStatus: newStatus });
  }
  
  async function removeFromCollection(id) {
    if (confirm('Are you sure you want to remove this whiskey from your collection?')) {
      await collectionStore.removeFromCollection(id);
    }
  }
</script>

<div class="max-w-6xl mx-auto mt-8">
  <h1 class="text-3xl font-bold text-amber-800 mb-6">My Whiskey Collection</h1>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
    </div>
  {:else if error}
    <div class="p-6 bg-red-100 rounded-lg">
      <p class="text-red-700">{error}</p>
    </div>
  {:else if collection.length === 0}
    <div class="bg-white rounded-lg shadow-md p-8 text-center">
      <h2 class="text-xl text-gray-700 mb-4">Your collection is empty</h2>
      <p class="text-gray-600 mb-6">Start building your whiskey collection by browsing available whiskies.</p>
      <a 
        href="/whiskies" 
        use:link
        class="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
      >
        Browse Whiskies
      </a>
    </div>
  {:else}
    <!-- Filters and Controls -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div class="flex items-center space-x-4">
          <label for="select-status" class="text-gray-700">Status:</label>
          <select 
            id="select-status"
            bind:value={selectedStatus}
            class="p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
          >
            {#each bottleStatusOptions as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
        </div>
        
        <div class="flex items-center space-x-4">
          <label for="select-sort" class="text-gray-700">Sort by:</label>
          <select 
            id="select-sort"
            bind:value={selectedSort}
            class="p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
          >
            {#each sortOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          
          <button 
            on:click={toggleSortDirection}
            class="p-2 bg-gray-100 rounded hover:bg-gray-200"
            title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Collection Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Whiskey</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Info</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each sortedCollection as item}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    {#if item.Whiskey.imageUrl}
                      <div class="flex-shrink-0 h-10 w-10">
                        <img 
                          class="h-10 w-10 rounded-full object-cover" 
                          src={item.Whiskey.imageUrl} 
                          alt={item.Whiskey.name}
                        />
                      </div>
                    {/if}
                    <div class="ml-4">
                      <a 
                        href={`/whiskey/${item.Whiskey.id}`} 
                        use:link
                        class="text-sm font-medium text-amber-800 hover:text-amber-600"
                      >
                        {item.Whiskey.name}
                      </a>
                      <div class="text-sm text-gray-500">{item.Whiskey.distillery}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{item.Whiskey.type}</div>
                  <div class="text-sm text-gray-500">
                    {item.Whiskey.country}
                    {#if item.Whiskey.region} - {item.Whiskey.region}{/if}
                  </div>
                  {#if item.Whiskey.age}
                    <div class="text-sm text-gray-500">{item.Whiskey.age} Years</div>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {#if item.purchaseDate}
                    <div class="text-sm text-gray-900">
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </div>
                  {/if}
                  {#if item.purchasePrice}
                    <div class="text-sm text-gray-500">${item.purchasePrice}</div>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={item.bottleStatus}
                    on:change={(e) => updateBottleStatus(item.id, e.target.value)}
                    class="text-sm p-1 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
                  >
                    <option value="sealed">Sealed</option>
                    <option value="opened">Opened</option>
                    <option value="empty">Empty</option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a 
                    href={`/collection/edit/${item.id}`} 
                    use:link
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </a>
                  <button 
                    on:click={() => removeFromCollection(item.id)}
                    class="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>