<script>
  import { onMount } from 'svelte';
  import { whiskeyStore } from '../../stores/whiskeyStore';
  import { collectionStore } from '../../stores/collectionStore';
  import { ratingStore } from '../../stores/ratingStore';
  import { authStore } from '../../stores/authStore';
  import WhiskeyCard from './WhiskeyCard.svelte';
  
  let isLoading = true;
  let error = null;
  let searchQuery = '';
  let selectedType = '';
  let selectedCountry = '';
  
  // Type and country options for filtering
  let typeOptions = [];
  let countryOptions = [];
  
  $: whiskies = $whiskeyStore.whiskies;
  
  onMount(async () => {
    try {
      // Load all whiskies
      await whiskeyStore.getAllWhiskies();
      
      // If user is logged in, get their collection and ratings
      if ($authStore.isAuthenticated) {
        await collectionStore.getUserCollection();
        await ratingStore.getUserRatings();
      }
      
      // Extract unique types and countries for filters
      const types = new Set();
      const countries = new Set();
      
      whiskies.forEach(whiskey => {
        if (whiskey.type) types.add(whiskey.type);
        if (whiskey.country) countries.add(whiskey.country);
      });
      
      typeOptions = Array.from(types).sort();
      countryOptions = Array.from(countries).sort();
    } catch (err) {
      error = 'Failed to load whiskies';
      console.error(err);
    } finally {
      isLoading = false;
    }
  });
  
  function handleSearch() {
    isLoading = true;
    
    whiskeyStore.searchWhiskies({
      query: searchQuery,
      type: selectedType,
      country: selectedCountry
    }).finally(() => {
      isLoading = false;
    });
  }
  
  function resetFilters() {
    searchQuery = '';
    selectedType = '';
    selectedCountry = '';
    handleSearch();
  }
  
  function checkInCollection(whiskeyId) {
    return $collectionStore.collection.some(item => item.WhiskeyId === whiskeyId);
  }
</script>

<div class="max-w-6xl mx-auto mt-8">
  <h1 class="text-3xl font-bold text-amber-800 mb-6">Whiskey Collection</h1>
  
  <!-- Search and Filters -->
  <div class="bg-white rounded-lg shadow-md p-4 mb-6">
    <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
      <div class="w-full md:w-1/3">
        <input
          type="text"
          placeholder="Search whiskies..."
          bind:value={searchQuery}
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
        />
      </div>
      
      <div class="w-full md:w-1/4">
        <select
          bind:value={selectedType}
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
        >
          <option value="">All Types</option>
          {#each typeOptions as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </div>
      
      <div class="w-full md:w-1/4">
        <select
          bind:value={selectedCountry}
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
        >
          <option value="">All Countries</option>
          {#each countryOptions as country}
            <option value={country}>{country}</option>
          {/each}
        </select>
      </div>
      
      <div class="flex space-x-2">
        <button
          on:click={handleSearch}
          class="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 focus:outline-none"
        >
          Search
        </button>
        
        <button
          on:click={resetFilters}
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
    </div>
  {:else if error}
    <div class="p-6 bg-red-100 rounded-lg">
      <p class="text-red-700">{error}</p>
    </div>
  {:else if whiskies.length === 0}
    <div class="bg-white rounded-lg shadow-md p-8 text-center">
      <h2 class="text-xl text-gray-700 mb-4">No whiskies found</h2>
      <p class="text-gray-600">Try adjusting your search criteria or reset filters.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each whiskies as whiskey (whiskey.id)}
        <WhiskeyCard 
          {whiskey} 
          inCollection={$authStore.isAuthenticated && checkInCollection(whiskey.id)}
        />
      {/each}
    </div>
  {/if}
</div>