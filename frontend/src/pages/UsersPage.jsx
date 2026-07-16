// pages/UsersPage.js

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, InputGroup, Form } from 'react-bootstrap';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiUser,
  FiMail,
  FiUserCheck,
  FiUserX,
  FiKey,
  FiShield,
  FiBriefcase,
  FiRefreshCw
} from 'react-icons/fi';
import { userApi } from '../api';
import Loading from '../components/common/Loading';
import UserForm from '../components/users/UserForm';
import EmployeeForm from '../components/employees/EmployeeForm';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== '') params.is_active = statusFilter === 'active';
      
      const response = await userApi.getAll(params);
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const clearSearch = () => {
    setSearch('');
    fetchUsers();
  };

  const handleAddUser = () => {
    setEditData(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setEditData(user);
    setShowUserForm(true);
  };

  const handleAddEmployee = (user) => {
    if (user.role === 'employee' || user.role === 'delivery' || user.role === 'manager') {
      toast.error('User is already an employee');
      return;
    }
    setSelectedUser(user);
    setShowEmployeeForm(true);
  };

  const handleDeleteUser = async (user) => {
    if (user.role === 'admin') {
      toast.error('Cannot delete admin user');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${user.full_name}"?`)) return;
    
    try {
      await userApi.delete(user.user_id);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (user) => {
    if (user.role === 'admin') {
      toast.error('Cannot reset admin password');
      return;
    }

    const newPassword = window.prompt(`Enter new password for ${user.full_name}:`);
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await userApi.changePassword(user.user_id, { new_password: newPassword });
      toast.success('Password reset successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleUserFormSuccess = () => {
    fetchUsers();
    setShowUserForm(false);
    setEditData(null);
  };

  const handleEmployeeFormSuccess = () => {
    fetchUsers();
    setShowEmployeeForm(false);
    setSelectedUser(null);
    toast.success('Employee created successfully!');
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'danger',
      manager: 'primary',
      employee: 'info',
      delivery: 'warning',
      customer: 'secondary'
    };
    return colors[role] || 'secondary';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      manager: 'Manager',
      employee: 'Employee',
      delivery: 'Delivery',
      customer: 'Customer'
    };
    return labels[role] || role;
  };

  const canBeEmployee = (user) => {
    return user.role !== 'admin' && 
           user.role !== 'employee' && 
           user.role !== 'delivery' && 
           user.role !== 'manager';
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">👤 Users</h4>
          <p className="text-secondary small mb-0">Manage system users and their access</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={fetchUsers}
            className="d-flex align-items-center gap-2"
            size="sm"
          >
            <FiRefreshCw size={16} /> Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddUser}
            className="d-flex align-items-center gap-2 px-4 py-2 rounded-3"
          >
            <FiPlus size={18} /> Add User
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <Form onSubmit={handleSearchSubmit}>
            <div className="d-flex flex-wrap gap-2">
              <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                <InputGroup className="rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-white border-end-0">
                    <FiSearch className="text-secondary" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, username or email..."
                    value={search}
                    onChange={handleSearch}
                    className="border-start-0"
                    style={{ fontSize: '14px' }}
                  />
                  {search && (
                    <Button variant="light" onClick={clearSearch} className="border-start-0">
                      <FiX />
                    </Button>
                  )}
                </InputGroup>
              </div>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-3"
                style={{ width: '140px', fontSize: '14px' }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="delivery">Delivery</option>
                <option value="customer">Customer</option>
              </Form.Select>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-3"
                style={{ width: '140px', fontSize: '14px' }}
              >
                <option value="">All Status</option>
                <option value="active">✅ Active</option>
                <option value="inactive">⛔ Inactive</option>
              </Form.Select>
              <Button type="submit" variant="primary" className="px-4">
                Search
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Users Table - Desktop */}
      <Card className="shadow-sm border-0 d-none d-sm-block">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ minWidth: '650px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="ps-3" style={{ width: '40px' }}>#</th>
                  <th style={{ minWidth: '130px' }}>User</th>
                  <th style={{ minWidth: '150px' }}>Contact</th>
                  <th style={{ minWidth: '100px' }}>Role</th>
                  <th className="text-center" style={{ width: '100px' }}>Status</th>
                  <th className="text-center pe-3" style={{ width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-secondary">
                        <FiUser size={48} className="mb-2 opacity-25" />
                        <p className="mb-1">No users found</p>
                        <small>Click "Add User" to create one</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.user_id} className="align-middle">
                      <td className="ps-3" style={{ fontSize: '13px' }}>
                        <span className="fw-medium">{index + 1}</span>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-medium" style={{ fontSize: '14px' }}>{user.full_name}</span>
                          <small className="text-secondary" style={{ fontSize: '12px' }}>@{user.username}</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <small className="text-secondary" style={{ fontSize: '12px' }}>
                            <FiMail className="me-1" size={12} />
                            {user.email}
                          </small>
                          {user.phone && (
                            <small className="text-secondary" style={{ fontSize: '12px' }}>
                              <FiUser className="me-1" size={12} />
                              {user.phone}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getRoleBadgeColor(user.role)} className="px-3 py-2" style={{ fontSize: '12px' }}>
                          {user.role === 'admin' && <FiShield className="me-1" size={12} />}
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge 
                          bg={user.is_active ? 'success' : 'danger'}
                          className="rounded-pill px-3 py-2"
                          style={{ fontSize: '12px' }}
                        >
                          {user.is_active ? (
                            <><FiUserCheck size={12} className="me-1" /> Active</>
                          ) : (
                            <><FiUserX size={12} className="me-1" /> Inactive</>
                          )}
                        </Badge>
                      </td>
                      <td className="text-center pe-3">
                        <div className="d-flex justify-content-center gap-1">
                          {canBeEmployee(user) && user.is_active && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              className="rounded-circle p-1"
                              style={{ width: '30px', height: '30px', minWidth: '30px' }}
                              onClick={() => handleAddEmployee(user)}
                              title="Make Employee"
                            >
                              <FiBriefcase size={13} />
                            </Button>
                          )}
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                            disabled={user.role === 'admin'}
                          >
                            <FiEdit size={13} />
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleResetPassword(user)}
                            title="Reset Password"
                            disabled={user.role === 'admin'}
                          >
                            <FiKey size={13} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                            disabled={user.role === 'admin'}
                          >
                            <FiTrash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          {users.length > 0 && (
            <div className="p-3 border-top text-secondary small">
              Total: {users.length} users
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mobile Card View */}
      <div className="d-block d-sm-none">
        {users.length === 0 ? (
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center py-5">
              <FiUser size={48} className="text-secondary mb-2 opacity-25" />
              <p className="text-secondary mb-1">No users found</p>
              <small className="text-secondary">Click "Add User" to create one</small>
            </Card.Body>
          </Card>
        ) : (
          users.map((user, index) => (
            <Card key={user.user_id} className="shadow-sm border-0 mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold" style={{ fontSize: '15px' }}>{user.full_name}</div>
                    <div className="text-secondary small">@{user.username}</div>
                  </div>
                  <Badge 
                    bg={user.is_active ? 'success' : 'danger'}
                    className="rounded-pill px-3"
                    style={{ fontSize: '11px' }}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="mb-2">
                  <div className="text-secondary small">
                    <FiMail className="me-1" /> {user.email}
                  </div>
                  {user.phone && (
                    <div className="text-secondary small">
                      <FiUser className="me-1" /> {user.phone}
                    </div>
                  )}
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg={getRoleBadgeColor(user.role)} className="px-3 py-2" style={{ fontSize: '12px' }}>
                    {user.role === 'admin' && <FiShield className="me-1" size={12} />}
                    {getRoleLabel(user.role)}
                  </Badge>
                  <div className="d-flex gap-1">
                    {canBeEmployee(user) && user.is_active && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        className="rounded-circle p-1"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => handleAddEmployee(user)}
                        title="Make Employee"
                      >
                        <FiBriefcase size={14} />
                      </Button>
                    )}
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      className="rounded-circle p-1"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
                      disabled={user.role === 'admin'}
                    >
                      <FiEdit size={14} />
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      className="rounded-circle p-1"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleResetPassword(user)}
                      title="Reset Password"
                      disabled={user.role === 'admin'}
                    >
                      <FiKey size={14} />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      className="rounded-circle p-1"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleDeleteUser(user)}
                      title="Delete User"
                      disabled={user.role === 'admin'}
                    >
                      <FiTrash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
        {users.length > 0 && (
          <div className="text-center text-secondary small py-2">
            Total: {users.length} users
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserForm
        show={showUserForm}
        onHide={() => {
          setShowUserForm(false);
          setEditData(null);
        }}
        onSuccess={handleUserFormSuccess}
        editData={editData}
      />

      {/* Employee Form Modal */}
      <EmployeeForm
        show={showEmployeeForm}
        onHide={() => {
          setShowEmployeeForm(false);
          setSelectedUser(null);
        }}
        onSuccess={handleEmployeeFormSuccess}
        editData={null}
        preselectedUser={selectedUser}
      />
    </div>
  );
};

export default UsersPage;