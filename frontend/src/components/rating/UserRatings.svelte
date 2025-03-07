<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { ratingStore } from '../../stores/ratingStore';
  
  let isLoading = true;
  let error = null;
  
  // Sort options
  const sortOptions = [
    { value: 'date', label: 'Date (Newest)' },
    { value: 'score', label: 'Score (Highest)' },
    { value: 'whiskey', label: 'Whiskey Name' }
  ];
  let selectedSort = 'date';
  
  $: ratings = $ratingStore.userRatings;
  $: sortedRatings = sortRatings(ratings, selectedSort);
  
  onMount(async () => {
    try {
      await ratingStore.getUserRatings();
    } catch (err) {
      error = 'Failed to load ratings';
      console.error(err);
    } finally {
      isLoading = false;
    }
  });
  
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
  
  async function deleteRating(id) {
    if (confirm('Are you sure you want to delete this rating?')) {
      await ratingStore.deleteRating(id);
    }
  }
</script>

<div class="max-w-6xl mx-auto mt-8">
  <h1 class="text-3xl font-bold text-amber-800 mb-6">My Whiskey Ratings</h1>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
    </div>
  {:else if error}
    <div class="p-6 bg-red-100 rounded-lg">
      <p class="text-red-700">{error}</p>
    </div>
  {:else if ratings.length === 0}
    <div class="bg-white rounded-lg shadow-md p-8 text-center">
      <h2 class="text-xl text-gray-700 mb-4">You haven't rated any whiskies yet</h2>
      <p class="text-gray-600 mb-6">Start rating whiskies to build your tasting profile.</p>
      <a 
        href="/whiskies" 
        use:link
        class="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
      >
        Browse Whiskies to Rate
      </a>
    </div>
  {:else}
    <!-- Sort Controls -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-end">
      <div class="flex items-center space-x-2">
        <label for="sort-select" class="text-gray-700">Sort by:</label>
        <select 
          id="sort-select"
          bind:value={selectedSort}
          class="p-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
        >
          {#each sortOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <!-- Ratings List -->
    <div class="space-y-6">
      {#each sortedRatings as rating (rating.id)}
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6">
            <div class="flex flex-col sm:flex-row justify-between mb-4">
              <div>
                <a 
                  href={`/whiskey/${rating.WhiskeyId}`} 
                  use:link
                  class="text-xl font-bold text-amber-800 hover:text-amber-600"
                >
                  {rating.Whiskey.name}
                </a>
                <p class="text-gray-700">{rating.Whiskey.distillery}</p>
              </div>
              
              <div class="mt-2 sm:mt-0 flex items-center">
                <span class="text-2xl font-bold text-amber-700">{rating.score}</span>
                <span class="text-gray-600 ml-1">/100</span>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div class="bg-amber-50 p-3 rounded">
                <div class="text-sm text-gray-600">Nose</div>
                <div class="font-bold">{rating.nose || 'N/A'}/10</div>
              </div>
              
              <div class="bg-amber-50 p-3 rounded">
                <div class="text-sm text-gray-600">Taste</div>
                <div class="font-bold">{rating.taste || 'N/A'}/10</div>
              </div>
              
              <div class="bg-amber-50 p-3 rounded">
                <div class="text-sm text-gray-600">Finish</div>
                <div class="font-bold">{rating.finish || 'N/A'}/10</div>
              </div>
            </div>
            
            {#if rating.notes}
              <div class="mb-4">
                <h3 class="font-semibold text-gray-700 mb-1">Notes:</h3>
                <p class="text-gray-700">{rating.notes}</p>
              </div>
            {/if}
            
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-500">
                Rated on {new Date(rating.createdAt).toLocaleDateString()}
                {#if rating.createdAt !== rating.updatedAt}
                  (Updated on {new Date(rating.updatedAt).toLocaleDateString()})
                {/if}
              </div>
              
              <div class="flex space-x-2">
                <a 
                  href={`/rate/${rating.WhiskeyId}`} 
                  use:link
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                >
                  Edit
                </a>
                
                <button 
                  on:click={() => deleteRating(rating.id)}
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>