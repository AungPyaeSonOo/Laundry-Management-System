import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, InputGroup, Form, Modal, Row, Col } from 'react-bootstrap';
import {
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { expenseApi } from '../api';
import Loading from '../components/common/Loading';
import { formatCurrency, formatShortDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    expense_category_id: '',
    amount: '',
    description: '',
    expense_date: '',
    reference_no: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [statusFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      
      const response = await expenseApi.getAll(params);
      setExpenses(response.data.data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await expenseApi.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const clearSearch = () => {
    setSearch('');
    fetchExpenses();
  };

  const handleAddExpense = () => {
    setEditData(null);
    setFormData({
      expense_category_id: '',
      amount: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      reference_no: '',
      status: 'pending'
    });
    setShowForm(true);
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowDetail(true);
  };

  const handleEditExpense = (expense) => {
    setEditData(expense);
    setFormData({
      expense_category_id: expense.expense_category_id || '',
      amount: expense.amount || '',
      description: expense.description || '',
      expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
      reference_no: expense.reference_no || '',
      status: expense.status || 'pending'
    });
    setShowForm(true);
  };

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm(`Are you sure you want to delete this expense?`)) return;
    
    try {
      await expenseApi.delete(expense.expense_id);
      toast.success('Expense deleted successfully!');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        expense_category_id: parseInt(formData.expense_category_id),
        amount: parseFloat(formData.amount),
        description: formData.description,
        expense_date: formData.expense_date,
        reference_no: formData.reference_no,
        status: formData.status
      };

      if (editData) {
        await expenseApi.update(editData.expense_id, data);
        toast.success('Expense updated successfully!');
      } else {
        await expenseApi.create(data);
        toast.success('Expense created successfully!');
      }
      
      setShowForm(false);
      setEditData(null);
      setFormData({
        expense_category_id: '',
        amount: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        reference_no: '',
        status: 'pending'
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', icon: FiClock, label: 'Pending' },
      approved: { bg: 'success', icon: FiCheckCircle, label: 'Approved' },
      rejected: { bg: 'danger', icon: FiAlertCircle, label: 'Rejected' }
    };
    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;
    return (
      <Badge bg={config.bg} className="d-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
        <Icon size={12} /> {config.label}
      </Badge>
    );
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.expense_category_id === categoryId);
    return category?.category_name || 'Unknown';
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">💰 Expenses</h4>
          <p className="text-secondary small mb-0">Manage your business expenses</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={fetchExpenses}
            className="d-flex align-items-center gap-2"
            size="sm"
          >
            <FiRefreshCw size={16} /> Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddExpense}
            className="d-flex align-items-center gap-2 px-4 py-2 rounded-3"
          >
            <FiPlus size={18} /> Add Expense
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
                    placeholder="Search by description or reference..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-3"
                style={{ width: '160px', fontSize: '14px' }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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

      {/* Expenses Table - Desktop */}
      <Card className="shadow-sm border-0 d-none d-sm-block">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ minWidth: '700px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="ps-3" style={{ width: '40px' }}>#</th>
                  <th style={{ minWidth: '100px' }}>Date</th>
                  <th style={{ minWidth: '120px' }}>Category</th>
                  <th style={{ minWidth: '150px' }}>Description</th>
                  <th style={{ minWidth: '110px' }}>Amount</th>
                  <th style={{ minWidth: '100px' }}>Reference</th>
                  <th style={{ minWidth: '100px' }}>Status</th>
                  <th className="text-center pe-3" style={{ width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-secondary">
                        <FiDollarSign size={48} className="mb-2 opacity-25" />
                        <p className="mb-1">No expenses found</p>
                        <small>Click "Add Expense" to create one</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense, index) => (
                    <tr key={expense.expense_id} className="align-middle">
                      <td className="ps-3" style={{ fontSize: '13px' }}>{index + 1}</td>
                      <td style={{ fontSize: '13px' }}>
                        <div className="d-flex align-items-center gap-1">
                          <FiCalendar size={12} className="text-secondary flex-shrink-0" />
                          {formatShortDate(expense.expense_date)}
                        </div>
                      </td>
                      <td>
                        <Badge bg="info" className="d-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                          <FiTag size={12} /> {getCategoryName(expense.expense_category_id)}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        <div className="fw-medium">{expense.description}</div>
                      </td>
                      <td>
                        <span className="fw-bold text-danger" style={{ fontSize: '13px' }}>
                          {formatCurrency(expense.amount)} MMK
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {expense.reference_no || <span className="text-secondary">-</span>}
                      </td>
                      <td>{getStatusBadge(expense.status)}</td>
                      <td className="text-center pe-3">
                        <div className="d-flex justify-content-center gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleViewExpense(expense)}
                            title="View Details"
                          >
                            <FiEye size={13} />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleEditExpense(expense)}
                            title="Edit Expense"
                          >
                            <FiEdit size={13} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleDeleteExpense(expense)}
                            title="Delete Expense"
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
          {expenses.length > 0 && (
            <div className="p-3 border-top text-secondary small">
              Total: {expenses.length} expenses
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mobile Card View */}
      <div className="d-block d-sm-none">
        {expenses.length === 0 ? (
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center py-5">
              <FiDollarSign size={48} className="text-secondary mb-2 opacity-25" />
              <p className="text-secondary mb-1">No expenses found</p>
              <small className="text-secondary">Click "Add Expense" to create one</small>
            </Card.Body>
          </Card>
        ) : (
          expenses.map((expense, index) => (
            <Card key={expense.expense_id} className="shadow-sm border-0 mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold text-danger" style={{ fontSize: '16px' }}>
                      {formatCurrency(expense.amount)} MMK
                    </div>
                    <div className="text-secondary small">
                      <FiCalendar className="me-1" /> {formatShortDate(expense.expense_date)}
                    </div>
                  </div>
                  {getStatusBadge(expense.status)}
                </div>
                
                <div className="mb-2">
                  <div className="text-secondary small">
                    <FiTag className="me-1" /> {getCategoryName(expense.expense_category_id)}
                  </div>
                  <div className="fw-medium" style={{ fontSize: '14px' }}>{expense.description}</div>
                  {expense.reference_no && (
                    <div className="text-secondary small">
                      Ref: {expense.reference_no}
                    </div>
                  )}
                </div>
                
                <div className="d-flex gap-2 mt-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleViewExpense(expense)}
                  >
                    <FiEye className="me-1" /> View
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleEditExpense(expense)}
                  >
                    <FiEdit className="me-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleDeleteExpense(expense)}
                  >
                    <FiTrash2 className="me-1" /> Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
        {expenses.length > 0 && (
          <div className="text-center text-secondary small py-2">
            Total: {expenses.length} expenses
          </div>
        )}
      </div>

      {/* Expense Form Modal - Mobile Responsive */}
      <Modal 
        show={showForm} 
        onHide={() => {
          setShowForm(false);
          setEditData(null);
        }} 
        centered 
        size="lg"
        fullscreen="sm-down"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '18px' }}>
            <FiDollarSign className="me-2" />
            {editData ? 'Edit Expense' : 'Add New Expense'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiTag className="me-1" /> Category <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.expense_category_id}
                    onChange={(e) => setFormData({ ...formData, expense_category_id: e.target.value })}
                    required
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.expense_category_id} value={category.expense_category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiDollarSign className="me-1" /> Amount <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    required
                    min="0"
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiCalendar className="me-1" /> Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    required
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiFileText className="me-1" /> Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter expense description"
                    required
                    className="py-2"
                    style={{ resize: 'none', fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">Reference No.</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.reference_no}
                    onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                    placeholder="e.g. INV-001"
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => {
              setShowForm(false);
              setEditData(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editData ? 'Update Expense' : 'Create Expense'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Expense Detail Modal - Mobile Responsive */}
      {selectedExpense && (
        <Modal 
          show={showDetail} 
          onHide={() => {
            setShowDetail(false);
            setSelectedExpense(null);
          }} 
          centered
          size="lg"
          fullscreen="sm-down"
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: '18px' }}>
              <FiEye className="me-2" /> Expense Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <div className="bg-light rounded-3 p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary">Amount</small>
                    <div className="fw-bold fs-4 text-danger">
                      {formatCurrency(selectedExpense.amount)} MMK
                    </div>
                  </div>
                  {getStatusBadge(selectedExpense.status)}
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">
                    <FiTag className="me-1" /> Category
                  </small>
                  <div className="fw-medium">{getCategoryName(selectedExpense.expense_category_id)}</div>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">
                    <FiCalendar className="me-1" /> Date
                  </small>
                  <div className="fw-medium">{formatShortDate(selectedExpense.expense_date)}</div>
                </div>
              </Col>

              <Col xs={12}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">
                    <FiFileText className="me-1" /> Description
                  </small>
                  <div className="fw-medium">{selectedExpense.description}</div>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Reference No.</small>
                  <div className="fw-medium">{selectedExpense.reference_no || 'N/A'}</div>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Created By</small>
                  <div className="fw-medium">{selectedExpense.user?.full_name || 'N/A'}</div>
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="flex-wrap gap-2">
            <Button variant="secondary" onClick={() => {
              setShowDetail(false);
              setSelectedExpense(null);
            }}>
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setShowDetail(false);
                handleEditExpense(selectedExpense);
              }}
            >
              <FiEdit className="me-2" /> Edit Expense
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default ExpensesPage;