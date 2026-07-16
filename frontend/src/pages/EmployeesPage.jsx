import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, InputGroup, Form, Modal, Row, Col } from 'react-bootstrap';
import {
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiCalendar,
  FiUserCheck,
  FiUserX,
  FiRefreshCw
} from 'react-icons/fi';
import { employeeApi } from '../api';
import Loading from '../components/common/Loading';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeDetail from '../components/employees/EmployeeDetail';
import { formatCurrency, formatShortDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [positionFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (positionFilter) params.position = positionFilter;
      
      const response = await employeeApi.getAll(params);
      setEmployees(response.data.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const clearSearch = () => {
    setSearch('');
    fetchEmployees();
  };

  const handleAddEmployee = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDetail(true);
  };

  const handleEditEmployee = (employee) => {
    setEditData(employee);
    setShowForm(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete "${employee.user?.full_name || employee.employee_id}"?`)) return;
    
    try {
      await employeeApi.delete(employee.employee_id);
      toast.success('Employee deleted successfully!');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleFormSuccess = () => {
    fetchEmployees();
    setShowForm(false);
    setEditData(null);
  };

  const getPositionBadgeColor = (position) => {
    const colors = {
      manager: 'primary',
      washer: 'info',
      ironer: 'info',
      packer: 'success',
      delivery: 'warning'
    };
    return colors[position] || 'secondary';
  };

  const getPositionLabel = (position) => {
    const labels = {
      manager: 'Manager',
      washer: 'Washer',
      ironer: 'Ironer',
      packer: 'Packer',
      delivery: 'Delivery'
    };
    return labels[position] || position;
  };

  const getSalaryTypeLabel = (type) => {
    const labels = {
      fixed: 'Fixed',
      hourly: 'Hourly',
      daily: 'Daily'
    };
    return labels[type] || type;
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">👥 Employees</h4>
          <p className="text-secondary small mb-0">Manage your workforce</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={fetchEmployees}
            className="d-flex align-items-center gap-2"
            size="sm"
          >
            <FiRefreshCw size={16} /> Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddEmployee}
            className="d-flex align-items-center gap-2 px-4 py-2 rounded-3"
          >
            <FiPlus size={18} /> Add Employee
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
                    placeholder="Search by name..."
                    value={search}
                    onChange={handleSearch}
                    className="border-start-0"
                    style={{ fontSize: '14px' }}
                  />
                  {search && (
                    <Button 
                      variant="light" 
                      onClick={clearSearch}
                      className="border-start-0"
                    >
                      <FiX />
                    </Button>
                  )}
                </InputGroup>
              </div>
              <Form.Select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="rounded-3"
                style={{ width: '160px', fontSize: '14px' }}
              >
                <option value="">All Positions</option>
                <option value="manager">Manager</option>
                <option value="washer">Washer</option>
                <option value="ironer">Ironer</option>
                <option value="packer">Packer</option>
                <option value="delivery">Delivery</option>
              </Form.Select>
              <Button 
                type="submit" 
                variant="primary"
                className="px-4"
              >
                Search
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Employees Table - Desktop */}
      <Card className="shadow-sm border-0 d-none d-sm-block">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ minWidth: '700px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="ps-3" style={{ width: '40px' }}>#</th>
                  <th style={{ minWidth: '120px' }}>Name</th>
                  <th style={{ minWidth: '100px' }}>Position</th>
                  <th style={{ minWidth: '90px' }}>Salary Type</th>
                  <th style={{ minWidth: '110px' }}>Salary</th>
                  <th style={{ minWidth: '100px' }}>Hire Date</th>
                  <th className="text-center" style={{ width: '100px' }}>Status</th>
                  <th className="text-center pe-3" style={{ width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-secondary">
                        <FiUser size={48} className="mb-2 opacity-25" />
                        <p className="mb-1">No employees found</p>
                        <small>Click "Add Employee" to create one</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr key={employee.employee_id} className="align-middle">
                      <td className="ps-3" style={{ fontSize: '13px' }}>
                        <span className="fw-medium">{index + 1}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FiUser size={12} className="text-secondary flex-shrink-0" />
                          <span style={{ fontSize: '14px' }}>{employee.user?.full_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getPositionBadgeColor(employee.position)} style={{ fontSize: '12px' }}>
                          {getPositionLabel(employee.position)}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '13px' }}>{getSalaryTypeLabel(employee.salary_type)}</td>
                      <td>
                        <span className="fw-medium" style={{ fontSize: '13px' }}>
                          {formatCurrency(employee.salary_amount)} MMK
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        <div className="d-flex align-items-center gap-1">
                          <FiCalendar size={12} className="text-secondary flex-shrink-0" />
                          {formatShortDate(employee.hire_date)}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge 
                          bg={employee.is_active ? 'success' : 'danger'}
                          className="rounded-pill px-3"
                          style={{ fontSize: '12px' }}
                        >
                          {employee.is_active ? (
                            <><FiUserCheck size={12} className="me-1" /> Active</>
                          ) : (
                            <><FiUserX size={12} className="me-1" /> Inactive</>
                          )}
                        </Badge>
                      </td>
                      <td className="text-center pe-3">
                        <div className="d-flex justify-content-center gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleViewEmployee(employee)}
                            title="View Details"
                          >
                            <FiEye size={13} />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleEditEmployee(employee)}
                            title="Edit Employee"
                          >
                            <FiEdit size={13} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleDeleteEmployee(employee)}
                            title="Delete Employee"
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
          {employees.length > 0 && (
            <div className="p-3 border-top text-secondary small">
              Total: {employees.length} employees
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mobile Card View */}
      <div className="d-block d-sm-none">
        {employees.length === 0 ? (
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center py-5">
              <FiUser size={48} className="text-secondary mb-2 opacity-25" />
              <p className="text-secondary mb-1">No employees found</p>
              <small className="text-secondary">Click "Add Employee" to create one</small>
            </Card.Body>
          </Card>
        ) : (
          employees.map((employee, index) => (
            <Card key={employee.employee_id} className="shadow-sm border-0 mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold" style={{ fontSize: '15px' }}>
                      <FiUser className="me-1" /> {employee.user?.full_name || 'N/A'}
                    </div>
                    <Badge bg={getPositionBadgeColor(employee.position)} className="mt-1" style={{ fontSize: '11px' }}>
                      {getPositionLabel(employee.position)}
                    </Badge>
                  </div>
                  <Badge 
                    bg={employee.is_active ? 'success' : 'danger'}
                    className="rounded-pill px-3"
                    style={{ fontSize: '11px' }}
                  >
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="row g-1 small mt-2">
                  <div className="col-6">
                    <span className="text-secondary">Salary Type:</span>{' '}
                    {getSalaryTypeLabel(employee.salary_type)}
                  </div>
                  <div className="col-6">
                    <span className="text-secondary">Salary:</span>{' '}
                    <span className="fw-bold">{formatCurrency(employee.salary_amount)} MMK</span>
                  </div>
                  <div className="col-12">
                    <span className="text-secondary">Hire Date:</span>{' '}
                    {formatShortDate(employee.hire_date)}
                  </div>
                </div>
                
                <div className="d-flex gap-2 mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleViewEmployee(employee)}
                  >
                    <FiEye className="me-1" /> View
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleEditEmployee(employee)}
                  >
                    <FiEdit className="me-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleDeleteEmployee(employee)}
                  >
                    <FiTrash2 className="me-1" /> Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
        {employees.length > 0 && (
          <div className="text-center text-secondary small py-2">
            Total: {employees.length} employees
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      <EmployeeForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSuccess={handleFormSuccess}
        editData={editData}
      />

      {/* Employee Detail Modal - Mobile Responsive */}
      <EmployeeDetail
        show={showDetail}
        onHide={() => {
          setShowDetail(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onEdit={(employee) => {
          setShowDetail(false);
          handleEditEmployee(employee);
        }}
      />
    </div>
  );
};

export default EmployeesPage;