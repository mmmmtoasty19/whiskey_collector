import './app.css';
import App from './App.svelte';

// Svelte 5 syntax for mounting a component
const app = App({
  target: document.getElementById('app')
});

export default app;