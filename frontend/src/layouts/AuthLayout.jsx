import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const AuthLayout = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // ✅ Animation on mount
    const timer = setTimeout(() => {
      setShow(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light auth-layout">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <div className={`bg-white rounded-4 shadow-lg p-4 p-md-5 auth-card ${show ? 'show' : ''}`}>
              <div className="text-center mb-4">
                <h1 className="display-5 fw-bold text-primary">🧺 Laundry</h1>
                <p className="text-secondary">Management System</p>
              </div>
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .auth-layout {
          background: var(--bg-body);
          min-height: 100vh;
        }

        .auth-card {
          opacity: 0;
          transform: translateY(30px) scale(0.98);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-card.show {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .dark-mode .auth-card {
          background: #1a2332 !important;
          color: #f1f5f9 !important;
          border: 1px solid #334155 !important;
        }

        .dark-mode .auth-layout {
          background: #0a0f1e !important;
        }

        .dark-mode .text-secondary {
          color: #94a3b8 !important;
        }

        @media (max-width: 576px) {
          .auth-card {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;