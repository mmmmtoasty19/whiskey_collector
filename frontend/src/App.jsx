import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Nav';
import Home from './routes/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import WhiskeyList from './components/whiskey/WhiskeyList';
import WhiskeyDetail from './components/whiskey/WhiskeyDetail';
import RatingForm from './components/rating/RatingForm';
import CollectionList from './components/collection/CollectionList';
import CollectionForm from './components/collection/CollectionForm';
import UserRatings from './components/rating/UserRatings';
import NotFound from './routes/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return(
    <Router>
      <div className="min-h-screen bg-amber-50">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/whiskies" element={<WhiskeyList />} />
            <Route path="/whiskey/:id" element={<WhiskeyDetail />} />

            {/* Protect routes */}
            <Route path="/collection" element={
              <ProtectedRoute>
                <CollectionList />
              </ProtectedRoute>
            } />
            <Route path="/collection/add/:id" element={
              <ProtectedRoute>
                <CollectionForm />
              </ProtectedRoute>
            } />
            <Route path="/collection/edit/:id" element={
              <ProtectedRoute>
                <CollectionForm />
              </ProtectedRoute>
            } />
            <Route path="/rate/:id" element={
              <ProtectedRoute>
                <RatingForm />
              </ProtectedRoute>
            } />
            <Route path="/ratings" element={
              <ProtectedRoute>
                <UserRatings />
              </ProtectedRoute>
            } />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="bg-amber-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Whiskey Collection App</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;