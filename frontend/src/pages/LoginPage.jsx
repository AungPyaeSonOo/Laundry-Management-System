import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRedirectPath = (user) => {
    const role = user?.role || 'employee';
    
    if (role === 'admin' || role === 'accountant' || role === 'manager') {
      return '/dashboard';
    }
    if (role === 'delivery') {
      return '/delivery-dashboard';
    }
    if (role === 'employee') {
      // ✅ Use position from user object
      if (user?.position) {
        const positionMap = {
          'washer': '/washer-dashboard',
          'ironer': '/ironer-dashboard',
          'packer': '/packer-dashboard',
          'delivery': '/delivery-dashboard'
        };
        return positionMap[user.position] || '/washer-dashboard';
      }
      
      // Fallback: check username
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
    <>
      <h4 className="text-center fw-bold mb-3">Welcome Back!</h4>
      <p className="text-center text-secondary mb-4">Sign in to your account</p>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="fw-medium">Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            required
            className="py-2"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-medium">Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
            className="py-2"
          />
        </Form.Group>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-100 py-2 fw-medium"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Form>

      <div className="text-center mt-3">
        <Link to="/register" className="text-decoration-none text-primary">
          Don't have an account? Register
        </Link>
      </div>
    </>
  );
};

export default LoginPage;