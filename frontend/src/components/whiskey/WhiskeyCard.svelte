<script>
  import { link } from 'svelte-spa-router';
  import { collectionStore } from '../../stores/collectionStore';
  import { ratingStore } from '../../stores/ratingStore';
  import { authStore } from '../../stores/authStore';
  
  export let whiskey;
  export let inCollection = false;
  
  let averageRating = { average: 0, count: 0 };
  let userRating = null;
  
  $: {
    if (whiskey && $ratingStore.whiskeyRatings.length > 0) {
      const ratings = $ratingStore.whiskeyRatings.filter(r => r.WhiskeyId === whiskey.id);
      if (ratings.length > 0) {
        averageRating.count = ratings.length;
        averageRating.average = ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length;
      }
    }
    
    if (whiskey && $ratingStore.userRatings.length > 0) {
      userRating = $ratingStore.userRatings.find(r => r.WhiskeyId === whiskey.id);
    }
  }
  
  async function addToCollection() {
    if (!$authStore.isAuthenticated) {
      window.location.href = '/#/login';
      return;
    }
    
    await collectionStore.addToCollection({
      whiskeyId: whiskey.id,
      purchaseDate: new Date().toISOString().split('T')[0],
      bottleStatus: 'sealed'
    });
    
    inCollection = true;
  }
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
  <div class="p-4">
    <div class="flex justify-between items-start">
      <div>
        <a href={`/whiskey/${whiskey.id}`} use:link>
          <h2 class="text-xl font-bold mb-2 text-amber-800 hover:text-amber-600">{whiskey.name}</h2>
        </a>
        <p class="text-gray-700 mb-1">{whiskey.distillery}</p>
        <p class="text-gray-600 mb-1">{whiskey.type} | {whiskey.country}</p>
        {#if whiskey.age}
          <p class="text-gray-600 mb-1">{whiskey.age} Years</p>
        {/if}
        {#if whiskey.abv}
          <p class="text-gray-600 mb-1">{whiskey.abv}% ABV</p>
        {/if}
      </div>
      
      {#if whiskey.imageUrl}
        <img 
          src={whiskey.imageUrl} 
          alt={whiskey.name} 
          class="w-16 h-16 object-cover rounded-md"
        />
      {:else}
        <div class="w-16 h-16 bg-amber-100 rounded-md flex items-center justify-center">
          <span class="text-amber-800 text-xs">No Image</span>
        </div>
      {/if}
    </div>
    
    <div class="mt-3">
      {#if averageRating.count > 0}
        <p class="text-gray-700">
          Rating: {averageRating.average.toFixed(1)}/100 ({averageRating.count} {averageRating.count === 1 ? 'review' : 'reviews'})
        </p>
      {:else}
        <p class="text-gray-500 italic">No ratings yet</p>
      {/if}
      
      {#if userRating}
        <p class="text-gray-700">Your rating: {userRating.score}/100</p>
      {/if}
    </div>
    
    <div class="mt-4 flex space-x-2">
      <a 
        href={`/whiskey/${whiskey.id}`} 
        use:link
        class="px-3 py-1 bg-amber-700 text-white rounded hover:bg-amber-600 text-sm"
      >
        Details
      </a>
      
      {#if $authStore.isAuthenticated}
        {#if !inCollection}
          <button 
            on:click={addToCollection}
            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 text-sm"
          >
            Add to Collection
          </button>
        {:else}
          <span class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm flex items-center">
            In Collection
          </span>
        {/if}
        
        <a 
          href={`/rate/${whiskey.id}`} 
          use:link
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
        >
          {userRating ? 'Edit Rating' : 'Rate'}
        </a>
      {/if}
    </div>
  </div>
</div>