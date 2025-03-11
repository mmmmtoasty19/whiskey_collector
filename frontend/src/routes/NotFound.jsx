// src/routes/NotFound.jsx

import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-4xl font-bold text-amber-800 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-amber-700 text-white rounded-lg font-bold hover:bg-amber-600 inline-block"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;