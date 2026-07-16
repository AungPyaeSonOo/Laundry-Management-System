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
  FiPhone,
  FiMapPin,
  FiRefreshCw
} from 'react-icons/fi';
import { customerApi } from '../api';
import Loading from '../components/common/Loading';
import CustomerForm from '../components/customers/CustomerForm';
import toast from 'react-hot-toast';
import "../styles/CustomerDetail.css";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAll({ search: search || undefined });
      setCustomers(response.data.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const clearSearch = () => {
    setSearch('');
    fetchCustomers();
  };

  const handleAddCustomer = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  const handleEditCustomer = (customer) => {
    setEditData(customer);
    setShowForm(true);
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete "${customer.name}"?`)) return;
    
    try {
      await customerApi.delete(customer.customer_id);
      toast.success('Customer deleted successfully!');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleFormSuccess = () => {
    fetchCustomers();
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">👥 Customers</h4>
          <p className="text-secondary small mb-0">Manage your customer database</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={fetchCustomers}
            className="d-flex align-items-center gap-2"
            size="sm"
          >
            <FiRefreshCw size={16} /> Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddCustomer}
            className="d-flex align-items-center gap-2 px-4 py-2 rounded-3"
          >
            <FiPlus size={18} /> Add Customer
          </Button>
        </div>
      </div>

      {/* Search */}
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
                    placeholder="Search by name or phone..."
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

      {/* Customers Table - Desktop */}
      <Card className="shadow-sm border-0 d-none d-sm-block">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ minWidth: '650px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="ps-3" style={{ width: '40px' }}>#</th>
                  <th style={{ minWidth: '120px' }}>Name</th>
                  <th style={{ minWidth: '110px' }}>Phone</th>
                  <th style={{ minWidth: '150px' }}>Address</th>
                  <th className="text-center" style={{ width: '70px' }}>Orders</th>
                  <th className="text-center" style={{ width: '90px' }}>Status</th>
                  <th className="text-center pe-3" style={{ width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-secondary">
                        <FiUser size={48} className="mb-2 opacity-25" />
                        <p className="mb-1">No customers found</p>
                        <small>Click "Add Customer" to create one</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer, index) => (
                    <tr key={customer.customer_id} className="align-middle">
                      <td className="ps-3 text-secondary" style={{ fontSize: '13px' }}>{index + 1}</td>
                      <td>
                        <div className="fw-medium" style={{ fontSize: '14px' }}>{customer.name}</div>
                        {customer.note && (
                          <small className="text-secondary" style={{ fontSize: '11px' }}>{customer.note}</small>
                        )}
                      </td>
                      <td style={{ fontSize: '13px' }}>{customer.phone}</td>
                      <td>
                        {customer.address ? (
                          <span 
                            style={{ 
                              fontFamily: '"Pyidaungsu", "Myanmar Text", sans-serif',
                              fontSize: '13px',
                              display: 'block',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {customer.address}
                          </span>
                        ) : (
                          <span className="text-secondary" style={{ fontSize: '13px' }}>-</span>
                        )}
                      </td>
                      <td className="text-center">
                        <Badge bg="secondary" className="rounded-pill px-3" style={{ fontSize: '12px' }}>
                          {customer.orders?.length || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge 
                          bg={customer.is_active ? 'success' : 'danger'}
                          className="rounded-pill px-3"
                          style={{ fontSize: '12px' }}
                        >
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-center pe-3">
                        <div className="d-flex justify-content-center gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleViewCustomer(customer)}
                            title="View Details"
                          >
                            <FiEye size={13} />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleEditCustomer(customer)}
                            title="Edit Customer"
                          >
                            <FiEdit size={13} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleDeleteCustomer(customer)}
                            title="Delete Customer"
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
          {customers.length > 0 && (
            <div className="p-3 border-top text-secondary small">
              Total: {customers.length} customers
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mobile Card View */}
      <div className="d-block d-sm-none">
        {customers.length === 0 ? (
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center py-5">
              <FiUser size={48} className="text-secondary mb-2 opacity-25" />
              <p className="text-secondary mb-1">No customers found</p>
              <small className="text-secondary">Click "Add Customer" to create one</small>
            </Card.Body>
          </Card>
        ) : (
          customers.map((customer, index) => (
            <Card key={customer.customer_id} className="shadow-sm border-0 mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold" style={{ fontSize: '15px' }}>{customer.name}</div>
                    <div className="text-secondary small">
                      <FiPhone className="me-1" /> {customer.phone}
                    </div>
                  </div>
                  <Badge 
                    bg={customer.is_active ? 'success' : 'danger'}
                    className="rounded-pill px-3"
                    style={{ fontSize: '11px' }}
                  >
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {customer.address && (
                  <div className="mb-2">
                    <div className="text-secondary small d-flex align-items-start gap-1">
                      <FiMapPin className="mt-1 flex-shrink-0" size={14} />
                      <span 
                        style={{ 
                          fontFamily: '"Pyidaungsu", "Myanmar Text", sans-serif',
                          fontSize: '13px',
                          lineHeight: '1.6'
                        }}
                      >
                        {customer.address}
                      </span>
                    </div>
                  </div>
                )}
                
                {customer.note && (
                  <div className="text-secondary small mb-2">
                    📝 {customer.note}
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                  <Badge bg="secondary" className="rounded-pill px-3" style={{ fontSize: '12px' }}>
                    📦 {customer.orders?.length || 0} orders
                  </Badge>
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="rounded-circle p-1"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleViewCustomer(customer)}
                      title="View Details"
                    >
                      <FiEye size={14} />
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      className="rounded-circle p-1"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleEditCustomer(customer)}
                      title="Edit Customer"
                    >
                      <FiEdit size={14} />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      className="rounded-circle p-1"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleDeleteCustomer(customer)}
                      title="Delete Customer"
                    >
                      <FiTrash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
        {customers.length > 0 && (
          <div className="text-center text-secondary small py-2">
            Total: {customers.length} customers
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        show={showForm}
        onHide={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
        editData={editData}
      />

      {/* Customer Detail Modal - Mobile Responsive */}
      {selectedCustomer && (
        <Modal 
          show={showDetail} 
          onHide={() => setShowDetail(false)}
          centered
          size="lg"
          fullscreen="sm-down"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FiEye className="me-2" /> Customer Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Full Name</small>
                  <div className="fw-medium fs-5">{selectedCustomer.name}</div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Phone Number</small>
                  <div className="fw-medium fs-5">{selectedCustomer.phone}</div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Address</small>
                  <div 
                    className="fw-medium fs-5"
                    style={{ 
                      fontFamily: '"Pyidaungsu", "Myanmar Text", sans-serif',
                      fontSize: '16px',
                      lineHeight: '1.8'
                    }}
                  >
                    {selectedCustomer.address || 'No address provided'}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Note</small>
                  <div className="fw-medium">
                    {selectedCustomer.note || 'No notes'}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Status</small>
                  <div>
                    <Badge 
                      bg={selectedCustomer.is_active ? 'success' : 'danger'}
                      className="rounded-pill px-3 py-2"
                    >
                      {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Total Orders</small>
                  <div className="fw-medium fs-5">
                    {selectedCustomer.orders?.length || 0}
                  </div>
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                    <div className="mt-2">
                      <small className="text-secondary">Recent Orders:</small>
                      <ul className="list-unstyled mt-1">
                        {selectedCustomer.orders.slice(0, 3).map((order, idx) => (
                          <li key={idx} className="small text-secondary">
                            #{order.order_number} - {order.total_price} MMK
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="flex-wrap gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowDetail(false)}
            >
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setShowDetail(false);
                handleEditCustomer(selectedCustomer);
              }}
            >
              <FiEdit className="me-2" /> Edit Customer
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default CustomersPage;