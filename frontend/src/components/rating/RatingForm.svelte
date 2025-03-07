<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { whiskeyStore } from '../../stores/whiskeyStore';
  import { ratingStore } from '../../stores/ratingStore';
  
  export let params = {};
  
  let whiskey = null;
  let isLoading = true;
  let isSubmitting = false;
  let error = null;
  let successMessage = '';
  
  // Rating form data
  let score = 75;
  let nose = 5;
  let taste = 5;
  let finish = 5;
  let notes = '';
  
  // Existing rating
  let existingRating = null;
  
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
      
      // Check for existing rating
      await ratingStore.getUserRatings();
      existingRating = $ratingStore.userRatings.find(r => r.WhiskeyId === parseInt(params.id));
      
      // If existing rating, pre-fill form
      if (existingRating) {
        score = existingRating.score;
        nose = existingRating.nose || 5;
        taste = existingRating.taste || 5;
        finish = existingRating.finish || 5;
        notes = existingRating.notes || '';
      }
    } catch (err) {
      error = 'Failed to load whiskey details';
      console.error(err);
    } finally {
      isLoading = false;
    }
  });
  
  async function handleSubmit() {
    isSubmitting = true;
    error = null;
    successMessage = '';
    
    try {
      const result = await ratingStore.rateWhiskey(whiskey.id, {
        score,
        nose,
        taste,
        finish,
        notes
      });
      
      if (result.success) {
        successMessage = existingRating 
          ? 'Your rating has been updated!' 
          : 'Your rating has been submitted!';
        
        // Redirect after a short delay
        setTimeout(() => {
          push(`/whiskey/${whiskey.id}`);
        }, 1500);
      } else {
        error = result.message;
      }
    } catch (err) {
      error = 'Failed to submit rating';
      console.error(err);
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isLoading}
  <div class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
  </div>
{:else if error}
  <div class="max-w-2xl mx-auto mt-8 p-6 bg-red-100 rounded-lg">
    <p class="text-red-700">{error}</p>
    <a href="/" class="mt-4 inline-block text-amber-700 hover:text-amber-600">Go back to home</a>
  </div>
{:else if whiskey}
  <div class="max-w-2xl mx-auto mt-8">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-amber-800 mb-1">Rate Whiskey</h1>
      <h2 class="text-xl text-gray-700 mb-6">{whiskey.name} - {whiskey.distillery}</h2>
      
      {#if successMessage}
        <div class="mb-6 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      {/if}
      
      {#if error}
        <div class="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit}>
        <!-- Overall Score -->
        <div class="mb-6">
          <label for="score-input" class="block font-semibold text-gray-700 mb-2">
            Overall Score: {score}/100
          </label>
          <input 
            id="score-input"
            type="range" 
            bind:value={score} 
            min="0" 
            max="100" 
            step="1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Poor</span>
            <span>Average</span>
            <span>Excellent</span>
          </div>
        </div>
        
        <!-- Nose, Taste, Finish -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label for="nose-input" class="block font-semibold text-gray-700 mb-2">
              Nose: {nose}/10
            </label>
            <input 
              id="nose-input"
              type="range" 
              bind:value={nose} 
              min="0" 
              max="10" 
              step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label for="taste-input" class="block font-semibold text-gray-700 mb-2">
              Taste: {taste}/10
            </label>
            <input 
              id="taste-input"
              type="range" 
              bind:value={taste} 
              min="0" 
              max="10" 
              step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label for="finish-input" class="block font-semibold text-gray-700 mb-2">
              Finish: {finish}/10
            </label>
            <input 
              id="finish-input"
              type="range" 
              bind:value={finish} 
              min="0" 
              max="10" 
              step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        <!-- Notes -->
        <div class="mb-6">
          <label for="notes" class="block font-semibold text-gray-700 mb-2">
            Tasting Notes (Optional)
          </label>
          <textarea
            id="notes"
            bind:value={notes}
            rows="5"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
            placeholder="Describe your experience with this whiskey..."
          ></textarea>
        </div>
        
        <div class="flex space-x-3">
          <button
            type="submit"
            class="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 focus:outline-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
          </button>
          
          <a 
            href={`/whiskey/${whiskey.id}`}
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  </div>
{/if}