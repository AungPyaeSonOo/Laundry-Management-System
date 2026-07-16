import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import '../styles/MainLayout.css'; 

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout d-flex vh-100 overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-overlay open"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="main-content d-flex flex-column min-vh-100 overflow-hidden flex-grow-1">
        <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        <main className="content-area flex-grow-1 overflow-y-auto p-3 p-md-4">
          <Container fluid className="px-0">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;