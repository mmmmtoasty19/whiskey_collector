<script>
  import { link } from 'svelte-spa-router';
  import { authStore } from '../stores/authStore';

  function handleLogout() {
    $authStore.logout();
  }
</script>

<nav class="bg-amber-800 text-white p-4">
  <div class="container mx-auto flex flex-wrap items-center justify-between">
    <div class="flex items-center">
      <a href="/" use:link class="text-xl font-bold">Whiskey Collection</a>
    </div>
    
    <div class="flex items-center space-x-4">
      <a href="/" use:link class="hover:text-amber-200">Home</a>
      <a href="/whiskies" use:link class="hover:text-amber-200">Whiskies</a>
      
      {#if $authStore.isAuthenticated}
        <a href="/collection" use:link class="hover:text-amber-200">My Collection</a>
        <a href="/ratings" use:link class="hover:text-amber-200">My Ratings</a>
        <button onclick={handleLogout} class="hover:text-amber-200">Logout</button>
      {:else}
        <a href="/login" use:link class="hover:text-amber-200">Login</a>
        <a href="/register" use:link class="hover:text-amber-200">Register</a>
      {/if}
    </div>
  </div>
</nav>

<style>
  nav {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>