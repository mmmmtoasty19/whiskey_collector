import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Nav() {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
   <nav className="bg-amber-800 text-white p-4">
    <div className="container mx-auto flex flex-wrap items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold">Whiskey Collection</Link>
      </div>

      <div className="flx items-center space-x-4">
        <Link to="/" className="hover:text-amber-200">Home</Link>
        <Link to="/whiskies" className="hover:text-amber-200">Whiskies</Link>
      </div>

      {isAuthenticated ? (
        <>
          <Link to="/collection" className="hover:text-amber-200">My Collection</Link>
          <Link to="/ratings" className="hover:text-amber-200">My Ratings</Link>
          <button onClick={handleLogout} className="hover:text-amber-200">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" className="hover:text-amber-200">Login</Link>
          <Link to="/register" className="hover:text-amber-200">Register</Link>
        </>
      )}
    </div>
   </nav> 
  );
}

export default Nav;