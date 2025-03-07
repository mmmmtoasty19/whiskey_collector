<script>
  import { onMount } from 'svelte';
  import { whiskeyStore } from '../../stores/whiskeyStore';
  import { ratingStore } from '../../stores/ratingStore';
  import { collectionStore } from '../../stores/collectionStore';
  import { authStore } from '../../stores/authStore';
  
  export let params = {};
  
  let whiskey = null;
  let ratings = [];
  let userRating = null;
  let inCollection = false;
  let isLoading = true;
  let error = null;
  
  onMount(async () => {
    try {
      // Get whiskey details
      const whiskeyResult = await whiskeyStore.getWhiskeyById(params.id);
      
      if (!whiskeyResult.success) {
        error = whiskeyResult.message;
        isLoading = false;
        return;
      }
      
      whiskey = whiskeyResult.data;
      
      // Get whiskey ratings
      const ratingsResult = await ratingStore.getWhiskeyRatings(params.id);
      
      if (ratingsResult.success) {
        ratings = ratingsResult.data;
      }
      
      // If user is authenticated, check if whiskey is in collection
      if ($authStore.isAuthenticated) {
        await collectionStore.getUserCollection();
        inCollection = $collectionStore.collection.some(item => item.WhiskeyId === parseInt(params.id));
        
        // Get user's rating for this whiskey
        await ratingStore.getUserRatings();
        userRating = $ratingStore.userRatings.find(r => r.WhiskeyId === parseInt(params.id));
      }
    } catch (err) {
      error = 'Failed to load whiskey details';
      console.error(err);
    } finally {
      isLoading = false;
    }
  });
  
  async function addToCollection() {
    const result = await collectionStore.addToCollection({
      whiskeyId: whiskey.id,
      purchaseDate: new Date().toISOString().split('T')[0],
      bottleStatus: 'sealed'
    });
    
    if (result.success) {
      inCollection = true;
    }
  }
  
  function getAverageRating() {
    if (ratings.length === 0) return 'No ratings yet';
    
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return `${(sum / ratings.length).toFixed(1)}/100 (${ratings.length} ${ratings.length === 1 ? 'rating' : 'ratings'})`;
  }
</script>

{#if isLoading}
  <div class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
  </div>
{:else if error}
  <div class="max-w-3xl mx-auto mt-8 p-6 bg-red-100 rounded-lg">
    <p class="text-red-700">{error}</p>
  </div>
{:else if whiskey}
  <div class="max-w-3xl mx-auto mt-8">
    <!-- Whiskey Header -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Image or placeholder -->
        <div class="w-full md:w-1/3">
          {#if whiskey.imageUrl}
            <img 
              src={whiskey.imageUrl} 
              alt={whiskey.name} 
              class="w-full h-64 object-cover rounded-md"
            />
          {:else}
            <div class="w-full h-64 bg-amber-100 rounded-md flex items-center justify-center">
              <span class="text-amber-800 text-lg">No Image Available</span>
            </div>
          {/if}
        </div>
        
        <!-- Whiskey details -->
        <div class="w-full md:w-2/3">
          <h1 class="text-3xl font-bold text-amber-800 mb-2">{whiskey.name}</h1>
          <p class="text-xl text-gray-700 mb-4">{whiskey.distillery}</p>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-gray-600"><span class="font-semibold">Type:</span> {whiskey.type}</p>
              <p class="text-gray-600"><span class="font-semibold">Country:</span> {whiskey.country}</p>
              {#if whiskey.region}
                <p class="text-gray-600"><span class="font-semibold">Region:</span> {whiskey.region}</p>
              {/if}
            </div>
            <div>
              {#if whiskey.age}
                <p class="text-gray-600"><span class="font-semibold">Age:</span> {whiskey.age} Years</p>
              {/if}
              {#if whiskey.abv}
                <p class="text-gray-600"><span class="font-semibold">ABV:</span> {whiskey.abv}%</p>
              {/if}
              {#if whiskey.price}
                <p class="text-gray-600"><span class="font-semibold">Price:</span> ${whiskey.price}</p>
              {/if}
            </div>
          </div>
          
          <p class="text-gray-700 mb-4">
            <span class="font-semibold">Average Rating:</span> {getAverageRating()}
          </p>
          
          {#if whiskey.description}
            <p class="text-gray-700 mb-6">{whiskey.description}</p>
          {/if}
          
          <div class="flex space-x-3">
            {#if $authStore.isAuthenticated}
              {#if !inCollection}
                <button 
                  on:click={addToCollection}
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                >
                  Add to Collection
                </button>
              {:else}
                <span class="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center">
                  In Collection
                </span>
              {/if}
              
              <a 
                href={`/rate/${whiskey.id}`} 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                {userRating ? 'Edit Rating' : 'Rate Whiskey'}
              </a>
            {:else}
              <a 
                href="/login" 
                class="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
              >
                Login to Rate & Collect
              </a>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ratings Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-amber-800 mb-4">Ratings & Reviews</h2>
      
      {#if ratings.length > 0}
        <div class="space-y-4">
          {#each ratings as rating}
            <div class="border-b border-gray-200 pb-4">
              <div class="flex justify-between items-center mb-2">
                <div>
                  <span class="font-semibold">{rating.User?.username || 'Anonymous'}</span>
                  <span class="text-amber-700 ml-2">{rating.score}/100</span>
                </div>
                <div class="text-gray-500 text-sm">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {#if rating.nose || rating.taste || rating.finish}
                <div class="grid grid-cols-3 gap-2 mb-2 text-sm text-gray-700">
                  {#if rating.nose}
                    <div>Nose: {rating.nose}/10</div>
                  {/if}
                  {#if rating.taste}
                    <div>Taste: {rating.taste}/10</div>
                  {/if}
                  {#if rating.finish}
                    <div>Finish: {rating.finish}/10</div>
                  {/if}
                </div>
              {/if}
              
              {#if rating.notes}
                <p class="text-gray-700">{rating.notes}</p>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-600 italic">No ratings yet. Be the first to rate this whiskey!</p>
      {/if}
    </div>
  </div>
{/if}