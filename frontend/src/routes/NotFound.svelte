<script>
  import { link } from 'svelte-spa-router';
</script>

<div class="max-w-lg mx-auto mt-16 p-8 bg-white rounded-lg shadow-md text-center">
  <h1 class="text-4xl font-bold text-amber-800 mb-4">404</h1>
  <h2 class="text-2xl font-bold text-gray-700 mb-6">Page Not Found</h2>
  <p class="text-gray-600 mb-8">
    The page you are looking for doesn't exist or has been moved.
  </p>
  <a 
    href="/" 
    use:link
    class="px-6 py-3 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-600 inline-block"
  >
    Go Back Home
  </a>
</div>