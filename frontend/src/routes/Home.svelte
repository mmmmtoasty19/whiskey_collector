<script>
  import { link } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import { whiskeyStore } from '../stores/whiskeyStore';
  import { authStore } from '../stores/authStore';
  import WhiskeyCard from '../components/whiskey/WhiskeyCard.svelte';
  
  let featuredWhiskies = [];
  let isLoading = true;
  
  onMount(async () => {
    await whiskeyStore.getAllWhiskies();
    
    // Get a few random whiskies to feature on homepage
    if ($whiskeyStore.whiskies.length > 0) {
      const shuffled = [...$whiskeyStore.whiskies].sort(() => 0.5 - Math.random());
      featuredWhiskies = shuffled.slice(0, 3);
    }
    
    isLoading = false;
  });
</script>

<div>
  <!-- Hero Section -->
  <div class="bg-amber-800 text-white py-16 px-4 rounded-lg shadow-lg mb-12">
    <div class="max-w-3xl mx-auto text-center">
      <h1 class="text-4xl font-bold mb-4">Track Your Whiskey Journey</h1>
      <p class="text-xl mb-8">
        Collect, rate, and discover new whiskies with our comprehensive whiskey collection app.
      </p>
      
      {#if $authStore.isAuthenticated}
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="/collection" 
            use:link
            class="px-6 py-3 bg-white text-amber-800 rounded-lg font-bold hover:bg-amber-100"
          >
            View My Collection
          </a>
          <a 
            href="/whiskies" 
            use:link
            class="px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500"
          >
            Explore Whiskies
          </a>
        </div>
      {:else}
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="/register" 
            use:link
            class="px-6 py-3 bg-white text-amber-800 rounded-lg font-bold hover:bg-amber-100"
          >
            Sign Up
          </a>
          <a 
            href="/login" 
            use:link
            class="px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500"
          >
            Login
          </a>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Features Section -->
  <div class="max-w-6xl mx-auto mb-12">
    <h2 class="text-2xl font-bold text-amber-800 mb-6 text-center">Features</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-amber-700 text-2xl mb-4">📋</div>
        <h3 class="text-xl font-bold mb-2">Track Your Collection</h3>
        <p class="text-gray-700">
          Keep track of all your whiskies, including purchase dates, prices, and bottle status.
        </p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-amber-700 text-2xl mb-4">⭐</div>
        <h3 class="text-xl font-bold mb-2">Rate & Review</h3>
        <p class="text-gray-700">
          Rate whiskies on nose, taste, and finish. Share your tasting notes and experiences.
        </p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-amber-700 text-2xl mb-4">🔍</div>
        <h3 class="text-xl font-bold mb-2">Discover New Whiskies</h3>
        <p class="text-gray-700">
          Explore our database of whiskies from around the world and find your next favorite.
        </p>
      </div>
    </div>
  </div>
  
  <!-- Featured Whiskies Section -->
  <div class="max-w-6xl mx-auto">
    <h2 class="text-2xl font-bold text-amber-800 mb-6 text-center">Featured Whiskies</h2>
    
    {#if isLoading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    {:else if featuredWhiskies.length === 0}
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <p class="text-gray-700">No whiskies available at the moment. Check back soon!</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each featuredWhiskies as whiskey (whiskey.id)}
          <WhiskeyCard {whiskey} />
        {/each}
      </div>
      
      <div class="text-center mt-8">
        <a 
          href="/whiskies" 
          use:link
          class="px-6 py-3 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-600 inline-block"
        >
          View All Whiskies
        </a>
      </div>
    {/if}
  </div>
</div>