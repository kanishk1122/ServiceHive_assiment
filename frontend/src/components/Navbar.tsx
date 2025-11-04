import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardIcon, MarketplaceIcon, RequestsIcon, SwapIcon } from './Icons';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <div>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SwapIcon size={24} />
          SlotSwapper
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DashboardIcon size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MarketplaceIcon size={18} />
              Marketplace
            </NavLink>
            <NavLink to="/requests" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RequestsIcon size={18} />
              Requests
            </NavLink>
          </>
        )}
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
