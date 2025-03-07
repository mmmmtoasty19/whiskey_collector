<script>
  import { push } from 'svelte-spa-router';
  import { authStore } from '../../stores/authStore';
  
  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let isLoading = false;
  let errorMessage = '';
  
  async function handleRegister() {
    // Reset error
    errorMessage = '';
    
    // Validate form
    if (!username || !email || !password || !confirmPassword) {
      errorMessage = 'Please fill in all fields';
      return;
    }
    
    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match';
      return;
    }
    
    if (password.length < 6) {
      errorMessage = 'Password must be at least 6 characters';
      return;
    }
    
    isLoading = true;
    
    const result = await authStore.register(username, email, password);
    
    isLoading = false;
    
    if (result.success) {
      push('/');
    } else {
      errorMessage = result.message;
    }
  }
</script>

<div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
  <h1 class="text-2xl font-bold text-center mb-6 text-amber-800">Register</h1>
  
  {#if errorMessage}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {errorMessage}
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleRegister}>
    <div class="mb-4">
      <label for="username" class="block text-gray-700 mb-2">Username</label>
      <input
        type="text"
        id="username"
        bind:value={username}
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
        required
      />
    </div>
    
    <div class="mb-4">
      <label for="email" class="block text-gray-700 mb-2">Email</label>
      <input
        type="email"
        id="email"
        bind:value={email}
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
        required
      />
    </div>
    
    <div class="mb-4">
      <label for="password" class="block text-gray-700 mb-2">Password</label>
      <input
        type="password"
        id="password"
        bind:value={password}
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
        required
      />
    </div>
    
    <div class="mb-6">
      <label for="confirmPassword" class="block text-gray-700 mb-2">Confirm Password</label>
      <input
        type="password"
        id="confirmPassword"
        bind:value={confirmPassword}
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
        required
      />
    </div>
    
    <button
      type="submit"
      class="w-full py-2 px-4 bg-amber-700 text-white rounded hover:bg-amber-600 focus:outline-none"
      disabled={isLoading}
    >
      {isLoading ? 'Registering...' : 'Register'}
    </button>
  </form>
  
  <div class="mt-4 text-center">
    <p class="text-gray-600">
      Already have an account? 
      <a href="#/login" class="text-amber-700 hover:text-amber-600">Login</a>
    </p>
  </div>
</div>