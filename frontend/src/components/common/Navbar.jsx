import React from 'react';
import { Navbar as BsNavbar, Container, Dropdown, Badge } from 'react-bootstrap';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSun, FiMoon, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, isMobile }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BsNavbar 
      className="shadow-sm px-3 px-md-4" 
      style={{ 
        backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
        minHeight: '64px',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
      }}
    >
      <Container fluid className="px-0">
        <div className="d-flex align-items-center gap-3">
          {isMobile && (
            <button 
              className="btn btn-link p-0"
              onClick={toggleSidebar}
              style={{ fontSize: '1.5rem', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}
            >
              <FiMenu />
            </button>
          )}
          <BsNavbar.Brand className="fw-bold text-primary d-none d-sm-block">
            🧺 Laundry
          </BsNavbar.Brand>
          <BsNavbar.Brand className="fw-bold text-primary d-sm-none">
            🧺
          </BsNavbar.Brand>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-3">
          {/* Theme Toggle */}
          <button
            className="btn btn-link p-0"
            onClick={toggleTheme}
            style={{ fontSize: '1.2rem', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}
          >
            {isDarkMode ? <FiSun className="text-warning" /> : <FiMoon />}
          </button>

          {/* Notifications */}
          <button className="btn btn-link p-0 position-relative" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
            <FiBell style={{ fontSize: '1.2rem' }} />
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle rounded-circle"
              style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}
            >
              3
            </Badge>
          </button>

          {/* User Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="link" 
              className="text-decoration-none p-0 d-flex align-items-center gap-2"
              id="user-dropdown"
              style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}
            >
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                style={{ width: '36px', height: '36px', fontSize: '0.9rem', fontWeight: '600' }}
              >
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="d-none d-md-inline fw-medium">
                {user?.full_name || 'User'}
              </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-sm border-0 mt-2">
              <Dropdown.Item 
                className="d-flex align-items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                <FiUser /> Profile
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                className="d-flex align-items-center gap-2 text-danger"
                onClick={handleLogout}
              >
                <FiLogOut /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;