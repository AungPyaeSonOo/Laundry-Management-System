import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(true); // ✅ Page load animation

  // ✅ Page load animation - 600ms ကြာ
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const getRedirectPath = (user) => {
    const role = user?.role || 'employee';
    
    if (role === 'admin' || role === 'accountant' || role === 'manager') {
      return '/dashboard';
    }
    if (role === 'delivery') {
      return '/delivery-dashboard';
    }
    if (role === 'employee') {
      if (user?.position) {
        const positionMap = {
          'washer': '/washer-dashboard',
          'ironer': '/ironer-dashboard',
          'packer': '/packer-dashboard',
          'delivery': '/delivery-dashboard'
        };
        return positionMap[user.position] || '/washer-dashboard';
      }
      const username = user?.username?.toLowerCase() || '';
      if (username.includes('ironer')) return '/ironer-dashboard';
      if (username.includes('packer')) return '/packer-dashboard';
      if (username.includes('washer')) return '/washer-dashboard';
      return '/washer-dashboard';
    }
    return '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      const redirectPath = getRedirectPath(result.user);
      console.log('🔀 Redirecting to:', redirectPath);
      navigate(redirectPath);
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      {/* ✅ Page Load Animation - Loading Screen */}
      <div className={`login-animation ${showAnimation ? 'active' : ''}`}>
        <div className="login-loader">
          <div className="login-loader-icon">🧺</div>
          <div className="login-loader-text">Loading...</div>
        </div>
      </div>

      {/* ✅ Main Login Form with Fade In */}
      <div className={`login-content ${showAnimation ? 'hidden' : 'visible'}`}>
        <h4 className="text-center fw-bold mb-3 welcome-title">Welcome Back!</h4>
        <p className="text-center text-secondary mb-4 welcome-subtitle">Sign in to your account</p>

        {error && (
          <Alert variant="danger" className="mb-3 error-alert">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 form-group">
            <Form.Label className="fw-medium">Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              className="py-2 form-input"
              disabled={loading || authLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3 form-group">
            <Form.Label className="fw-medium">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              className="py-2 form-input"
              disabled={loading || authLoading}
            />
          </Form.Group>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-100 py-2 fw-medium login-btn"
            disabled={loading || authLoading}
          >
            {loading || authLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <Link to="/register" className="text-decoration-none text-primary register-link">
            Don't have an account? Register
          </Link>
        </div>
      </div>

      {/* ✅ CSS Styles */}
      <style jsx>{`
        .login-container {
          position: relative;
          min-height: 400px;
        }

        /* ============================================
           PAGE LOAD ANIMATION
           ============================================ */
        .login-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 16px;
          z-index: 10;
          opacity: 1;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: all;
        }

        .login-animation.active {
          opacity: 1;
          transform: scale(1);
        }

        .login-animation:not(.active) {
          opacity: 0;
          transform: scale(0.95);
          pointer-events: none;
        }

        .login-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .login-loader-icon {
          font-size: 4rem;
          animation: bounce 1s ease-in-out infinite;
        }

        .login-loader-text {
          font-size: 1rem;
          color: #94a3b8;
          font-weight: 500;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* ============================================
           LOGIN CONTENT FADE IN
           ============================================ */
        .login-content {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-content.hidden {
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
        }

        .login-content.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }

        /* ============================================
           TITLE ANIMATION
           ============================================ */
        .welcome-title {
          animation: fadeInDown 0.8s ease-out 0.2s both;
        }

        .welcome-subtitle {
          animation: fadeInDown 0.8s ease-out 0.3s both;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ============================================
           FORM GROUP STAGGER ANIMATION
           ============================================ */
        .form-group {
          opacity: 0;
          animation: slideInRight 0.6s ease-out forwards;
        }

        .form-group:nth-child(1) {
          animation-delay: 0.3s;
        }

        .form-group:nth-child(2) {
          animation-delay: 0.4s;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ============================================
           FORM INPUT FOCUS ANIMATION
           ============================================ */
        .form-input {
          transition: all 0.3s ease;
        }

        .form-input:focus {
          transform: scale(1.02);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2) !important;
          border-color: #6366f1 !important;
        }

        /* ============================================
           LOGIN BUTTON ANIMATION
           ============================================ */
        .login-btn {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out 0.5s both;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ============================================
           REGISTER LINK ANIMATION
           ============================================ */
        .register-link {
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease-out 0.6s both;
        }

        .register-link:hover {
          color: #4338ca !important;
          text-decoration: underline !important;
        }

        /* ============================================
           ERROR ALERT ANIMATION
           ============================================ */
        .error-alert {
          animation: shakeX 0.5s ease-out;
        }

        @keyframes shakeX {
          0%, 100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-10px);
          }
          40% {
            transform: translateX(10px);
          }
          60% {
            transform: translateX(-6px);
          }
          80% {
            transform: translateX(6px);
          }
        }

        /* ============================================
           DARK MODE SUPPORT
           ============================================ */
        .dark-mode .login-animation {
          background: #1a2332;
        }

        .dark-mode .login-loader-text {
          color: #94a3b8;
        }

        .dark-mode .login-content {
          color: #f1f5f9;
        }

        .dark-mode .form-input {
          background-color: #1e293b !important;
          color: #f1f5f9 !important;
          border-color: #334155 !important;
        }

        .dark-mode .form-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2) !important;
        }

        .dark-mode .form-input::placeholder {
          color: #64748b !important;
        }

        .dark-mode .form-label {
          color: #cbd5e1 !important;
        }

        .dark-mode .welcome-title {
          color: #f1f5f9 !important;
        }

        .dark-mode .welcome-subtitle {
          color: #94a3b8 !important;
        }

        .dark-mode .register-link {
          color: #818cf8 !important;
        }

        .dark-mode .register-link:hover {
          color: #a5b4fc !important;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 576px) {
          .login-loader-icon {
            font-size: 3rem;
          }

          .login-loader-text {
            font-size: 0.9rem;
          }

          .welcome-title {
            font-size: 1.5rem !important;
          }

          .welcome-subtitle {
            font-size: 0.9rem !important;
          }

          .form-input {
            font-size: 14px !important;
            padding: 0.5rem 0.75rem !important;
          }

          .login-btn {
            font-size: 14px !important;
            padding: 0.5rem !important;
          }
        }

        /* ============================================
           REDUCED MOTION PREFERENCE
           ============================================ */
        @media (prefers-reduced-motion: reduce) {
          .login-animation,
          .login-content,
          .welcome-title,
          .welcome-subtitle,
          .form-group,
          .login-btn,
          .register-link,
          .error-alert {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .login-loader-icon {
            animation: none !important;
          }

          .login-loader-text {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;