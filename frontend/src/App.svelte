<script>
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { authStore } from './stores/authStore';
  
  import Nav from './components/Nav.svelte';
  import Home from './routes/Home.svelte';
  import Login from './components/auth/Login.svelte';
  import Register from './components/auth/Register.svelte';
  import WhiskeyList from './components/whiskey/WhiskeyList.svelte';
  import WhiskeyDetail from './components/whiskey/WhiskeyDetail.svelte';
  import RatingForm from './components/rating/RatingForm.svelte';
  import CollectionList from './components/collection/CollectionList.svelte';
  import CollectionForm from './components/collection/CollectionForm.svelte';
  import UserRatings from './components/rating/UserRatings.svelte';
  import NotFound from './routes/NotFound.svelte';
  
  // Auth guard for protected routes
  function authGuard(detail) {
    if (!$authStore.isAuthenticated) {
      return { redirect: '/login' };
    }
  }
  
  // Define routes
  const routes = {
    // Public routes
    '/': Home,
    '/login': Login,
    '/register': Register,
    '/whiskies': WhiskeyList,
    '/whiskey/:id': WhiskeyDetail,
    
    // Protected routes
    '/collection': wrap({
      component: CollectionList,
      conditions: [authGuard]
    }),
    '/collection/add/:id': wrap({
      component: CollectionForm,
      conditions: [authGuard]
    }),
    '/collection/edit/:id': wrap({
      component: CollectionForm,
      conditions: [authGuard]
    }),
    '/rate/:id': wrap({
      component: RatingForm,
      conditions: [authGuard]
    }),
    '/ratings': wrap({
      component: UserRatings,
      conditions: [authGuard]
    }),
    
    // 404 Not Found
    '*': NotFound
  };
</script>

<div class="min-h-screen bg-amber-50">
  <Nav />
  <main class="container mx-auto px-4 py-6">
    <Router {routes} />
  </main>
  <footer class="bg-amber-800 text-white py-6 mt-12">
    <div class="container mx-auto px-4 text-center">
      <p>© {new Date().getFullYear()} Whiskey Collection App</p>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
  }
</style>