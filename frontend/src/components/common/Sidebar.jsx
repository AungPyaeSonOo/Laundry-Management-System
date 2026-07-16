import React from 'react';
import { Nav, Badge } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiFileText, 
  FiUsers, 
  FiUserCheck, 
  FiDollarSign, 
  FiBox, 
  FiBarChart2,
  FiX,
  FiLogOut,
  FiUser,
  FiTag,
  FiTruck,
  FiClock,
  FiPackage,
  FiWind,
  FiShoppingBag,
  FiGrid
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const userRole = user?.role || 'employee';
  const userPosition = user?.position || '';

  const getMenuItems = () => {
    if (userRole === 'admin') {
      return [
        { path: '/admin-dashboard', icon: FiGrid, label: 'Dashboard' },
        { path: '/orders', icon: FiFileText, label: 'Orders' },
        { path: '/customers', icon: FiUsers, label: 'Customers' },
        { path: '/employees', icon: FiUserCheck, label: 'Employees' },
        { path: '/users', icon: FiUser, label: 'Users' },
        { path: '/clothing-types', icon: FiTag, label: 'Clothing Types' },
        { path: '/expenses', icon: FiDollarSign, label: 'Expenses' },
        { path: '/inventory', icon: FiBox, label: 'Inventory' },
        { path: '/reports', icon: FiBarChart2, label: 'Reports' },
      ];
    }
    
    if (['accountant', 'manager'].includes(userRole)) {
      return [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/orders', icon: FiFileText, label: 'Orders' },
        { path: '/customers', icon: FiUsers, label: 'Customers' },
        { path: '/employees', icon: FiUserCheck, label: 'Employees' },
        { path: '/clothing-types', icon: FiTag, label: 'Clothing Types' },
        { path: '/expenses', icon: FiDollarSign, label: 'Expenses' },
        { path: '/inventory', icon: FiBox, label: 'Inventory' },
        { path: '/reports', icon: FiBarChart2, label: 'Reports' },
      ];
    }

    if (userRole === 'delivery') {
      return [
        { path: '/delivery-dashboard', icon: FiTruck, label: 'Dashboard' },
        { path: '/delivery-history', icon: FiClock, label: 'History' },
      ];
    }

    if (userRole === 'employee') {
      if (userPosition === 'washer') {
        return [
          { path: '/washer-dashboard', icon: FiShoppingBag, label: 'Dashboard' },
          { path: '/washer-history', icon: FiClock, label: 'History' },
        ];
      }
      if (userPosition === 'ironer') {
        return [
          { path: '/ironer-dashboard', icon: FiWind, label: 'Dashboard' },
          { path: '/ironer-history', icon: FiClock, label: 'History' },
        ];
      }
      if (userPosition === 'packer') {
        return [
          { path: '/packer-dashboard', icon: FiPackage, label: 'Dashboard' },
          { path: '/packer-history', icon: FiClock, label: 'History' },
        ];
      }
      return [
        { path: '/washer-dashboard', icon: FiShoppingBag, label: 'Dashboard' },
        { path: '/washer-history', icon: FiClock, label: 'History' },
      ];
    }

    return [
      { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    ];
  };

  const menuItems = getMenuItems();
  const isAdmin = userRole === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`sidebar-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="d-flex flex-column h-100 py-3">
        <div className="px-3 px-md-4 mb-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-3">🧺</span>
            <span className="fw-bold text-primary fs-5">Laundry</span>
            {isAdmin && (
              <Badge bg="danger" className="ms-1 small">Admin</Badge>
            )}
          </div>
          {isMobile && (
            <button 
              className="btn btn-link p-0"
              onClick={onClose}
              style={{ fontSize: '1.5rem', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="px-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
              style={{ width: '36px', height: '36px', fontSize: '0.9rem', fontWeight: '600' }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="fw-medium text-truncate" style={{ fontSize: '0.9rem', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                {user?.full_name || 'User'}
              </div>
              <div className="text-secondary small text-truncate" style={{ fontSize: '0.75rem' }}>
                <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} bg-opacity-10 text-${isAdmin ? 'danger' : 'primary'}`}>
                  {isAdmin ? 'Admin' : (userPosition || userRole)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Nav className="flex-column px-2 flex-grow-1">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={NavLink}
              to={item.path}
              className={({ isActive }) => `
                d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 mb-1 sidebar-link
                ${isActive ? 'active' : ''}
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>

        <div className="border-top pt-3 mt-auto px-3" style={{ borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
          <button
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;