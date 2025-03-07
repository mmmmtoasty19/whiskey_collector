<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { whiskeyStore } from '../../stores/whiskeyStore';
  import { collectionStore } from '../../stores/collectionStore';
  
  export let params = {};
  
  let isLoading = true;
  let isSubmitting = false;
  let error = null;
  let successMessage = '';
  
  let whiskey = null;
  let collectionEntry = null;
  let isEdit = false;
  
  // Form data
  let purchaseDate = new Date().toISOString().split('T')[0];
  let purchasePrice = '';
  let bottleStatus = 'sealed';
  let notes = '';
  
  onMount(async () => {
    try {
      isEdit = params.id && !isNaN(params.id);
      
      if (isEdit) {
        // Editing existing collection entry
        await collectionStore.getUserCollection();
        
        collectionEntry = $collectionStore.collection.find(
          entry => entry.id === parseInt(params.id)
        );
        
        if (!collectionEntry) {
          error = 'Collection entry not found';
          isLoading = false;
          return;
        }
        
        // Load whiskey details
        const whiskeyResult = await whiskeyStore.getWhiskeyById(collectionEntry.WhiskeyId);
        if (!whiskeyResult.success) {
          error = whiskeyResult.message;
          isLoading = false;
          return;
        }
        
        whiskey = whiskeyResult.data;
        
        // Pre-fill form with existing data
        purchaseDate = collectionEntry.purchaseDate ? 
          new Date(collectionEntry.purchaseDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0];
        purchasePrice = collectionEntry.purchasePrice || '';
        bottleStatus = collectionEntry.bottleStatus || 'sealed';
        notes = collectionEntry.notes || '';
      } else {
        // Adding new entry
        const whiskeyResult = await whiskeyStore.getWhiskeyById(params.id);
        
        if (!whiskeyResult.success) {
          error = whiskeyResult.message;
          isLoading = false;
          return;
        }
        
        whiskey = whiskeyResult.data;
      }
    } catch (err) {
      error = 'Failed to load data';
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
      const collectionData = {
        purchaseDate,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        bottleStatus,
        notes
      };
      
      let result;
      
      if (isEdit) {
        // Update existing entry
        result = await collectionStore.updateCollectionEntry(params.id, collectionData);
      } else {
        // Add new entry
        collectionData.whiskeyId = whiskey.id;
        result = await collectionStore.addToCollection(collectionData);
      }
      
      if (result.success) {
        successMessage = isEdit 
          ? 'Collection entry updated successfully!' 
          : 'Whiskey added to your collection!';
        
        // Redirect after a short delay
        setTimeout(() => {
          push('/collection');
        }, 1500);
      } else {
        error = result.message;
      }
    } catch (err) {
      error = 'Failed to save collection entry';
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
    <a href="/collection" class="mt-4 inline-block text-amber-700 hover:text-amber-600">
      Go back to collection
    </a>
  </div>
{:else if whiskey}
  <div class="max-w-2xl mx-auto mt-8">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-amber-800 mb-1">
        {isEdit ? 'Edit Collection Entry' : 'Add to Collection'}
      </h1>
      <h2 class="text-xl text-gray-700 mb-6">{whiskey.name} - {whiskey.distillery}</h2>
      
      {#if successMessage}
        <div class="mb-6 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-4">
          <label for="purchaseDate" class="block font-semibold text-gray-700 mb-2">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            bind:value={purchaseDate}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
          />
        </div>
        
        <div class="mb-4">
          <label for="purchasePrice" class="block font-semibold text-gray-700 mb-2">
            Purchase Price (Optional)
          </label>
          <input
            type="number"
            id="purchasePrice"
            bind:value={purchasePrice}
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
            placeholder="Enter purchase price..."
          />
        </div>
        
        <div class="mb-4">
          <label for="bottleStatus" class="block font-semibold text-gray-700 mb-2">
            Bottle Status
          </label>
          <select
            id="bottleStatus"
            bind:value={bottleStatus}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
          >
            <option value="sealed">Sealed</option>
            <option value="opened">Opened</option>
            <option value="empty">Empty</option>
          </select>
        </div>
        
        <div class="mb-6">
          <label for="notes" class="block font-semibold text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            bind:value={notes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-amber-500"
            placeholder="Enter any notes about this bottle..."
          ></textarea>
        </div>
        
        <div class="flex space-x-3">
          <button
            type="submit"
            class="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 focus:outline-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Entry' : 'Add to Collection'}
          </button>
          
          <a 
            href={isEdit ? '/collection' : `/whiskey/${whiskey.id}`}
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  </div>
{/if}