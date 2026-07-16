import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, InputGroup, Form, Modal, Row, Col } from 'react-bootstrap';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiX,
  FiTag,
  FiDollarSign,
  FiRefreshCw
} from 'react-icons/fi';
import { clothingTypeApi } from '../api';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const ClothingTypesPage = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    type_name: '',
    default_price: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await clothingTypeApi.getAll();
      setTypes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clothing types:', error);
      toast.error('Failed to load clothing types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        type_name: formData.type_name,
        default_price: parseFloat(formData.default_price) || 0,
        description: formData.description,
        is_active: formData.is_active
      };

      if (editData) {
        await clothingTypeApi.update(editData.clothing_type_id, data);
        toast.success('Clothing type updated successfully!');
      } else {
        await clothingTypeApi.create(data);
        toast.success('Clothing type created successfully!');
      }
      
      setShowModal(false);
      setEditData(null);
      setFormData({ type_name: '', default_price: '', description: '', is_active: true });
      fetchTypes();
    } catch (error) {
      console.error('Error saving clothing type:', error);
      toast.error(error.response?.data?.message || 'Failed to save clothing type');
    }
  };

  const handleDelete = async (type) => {
    if (!window.confirm(`Are you sure you want to delete "${type.type_name}"?`)) return;
    try {
      await clothingTypeApi.delete(type.clothing_type_id);
      toast.success('Clothing type deleted!');
      fetchTypes();
    } catch (error) {
      console.error('Error deleting clothing type:', error);
      toast.error('Failed to delete clothing type');
    }
  };

  const handleEdit = (type) => {
    setEditData(type);
    setFormData({
      type_name: type.type_name,
      default_price: type.default_price,
      description: type.description || '',
      is_active: type.is_active
    });
    setShowModal(true);
  };

  const filteredTypes = types.filter(type =>
    type.type_name.toLowerCase().includes(search.toLowerCase()) ||
    type.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">🏷️ Clothing Types</h4>
          <p className="text-secondary small mb-0">Manage clothing types and their prices</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={fetchTypes}
            className="d-flex align-items-center gap-2"
            size="sm"
          >
            <FiRefreshCw size={16} /> Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setEditData(null);
              setFormData({ type_name: '', default_price: '', description: '', is_active: true });
              setShowModal(true);
            }}
            className="d-flex align-items-center gap-2 px-4 py-2 rounded-3"
          >
            <FiPlus size={18} /> Add Type
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <div className="d-flex gap-2">
            <InputGroup className="flex-grow-1" style={{ minWidth: '150px' }}>
              <InputGroup.Text className="bg-white border-end-0">
                <FiSearch className="text-secondary" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-start-0"
                style={{ fontSize: '14px' }}
              />
              {search && (
                <Button variant="outline-secondary" onClick={() => setSearch('')}>
                  <FiX />
                </Button>
              )}
            </InputGroup>
          </div>
        </Card.Body>
      </Card>

      {/* Table - Desktop */}
      <Card className="shadow-sm border-0 d-none d-sm-block">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ minWidth: '550px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="ps-3" style={{ width: '40px' }}>#</th>
                  <th style={{ minWidth: '120px' }}>Type Name</th>
                  <th style={{ minWidth: '110px' }}>Price (MMK)</th>
                  <th style={{ minWidth: '150px' }}>Description</th>
                  <th className="text-center" style={{ width: '90px' }}>Status</th>
                  <th className="text-center pe-3" style={{ width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      <FiTag size={48} className="mb-2 opacity-25" />
                      <p className="mb-1">No clothing types found</p>
                      <small>Click "Add Type" to create one</small>
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((type, index) => (
                    <tr key={type.clothing_type_id} className="align-middle">
                      <td className="ps-3" style={{ fontSize: '13px' }}>{index + 1}</td>
                      <td>
                        <div className="fw-medium" style={{ fontSize: '14px' }}>{type.type_name}</div>
                      </td>
                      <td>
                        <span className="fw-bold text-primary" style={{ fontSize: '13px' }}>
                          {type.default_price?.toLocaleString()} MMK
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {type.description || <span className="text-secondary">-</span>}
                      </td>
                      <td className="text-center">
                        <Badge bg={type.is_active ? 'success' : 'danger'} style={{ fontSize: '12px' }}>
                          {type.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-center pe-3">
                        <div className="d-flex justify-content-center gap-1">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleEdit(type)}
                            title="Edit"
                          >
                            <FiEdit size={13} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleDelete(type)}
                            title="Delete"
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
          {filteredTypes.length > 0 && (
            <div className="p-3 border-top text-secondary small">
              Total: {filteredTypes.length} clothing types
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mobile Card View */}
      <div className="d-block d-sm-none">
        {filteredTypes.length === 0 ? (
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center py-5">
              <FiTag size={48} className="text-secondary mb-2 opacity-25" />
              <p className="text-secondary mb-1">No clothing types found</p>
              <small className="text-secondary">Click "Add Type" to create one</small>
            </Card.Body>
          </Card>
        ) : (
          filteredTypes.map((type, index) => (
            <Card key={type.clothing_type_id} className="shadow-sm border-0 mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold" style={{ fontSize: '15px' }}>
                      <FiTag className="me-1" /> {type.type_name}
                    </div>
                    <div className="text-primary fw-bold" style={{ fontSize: '14px' }}>
                      {type.default_price?.toLocaleString()} MMK
                    </div>
                  </div>
                  <Badge bg={type.is_active ? 'success' : 'danger'} style={{ fontSize: '11px' }}>
                    {type.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {type.description && (
                  <div className="text-secondary small mb-2">
                    {type.description}
                  </div>
                )}
                
                <div className="d-flex gap-2 mt-2">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleEdit(type)}
                  >
                    <FiEdit className="me-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleDelete(type)}
                  >
                    <FiTrash2 className="me-1" /> Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
        {filteredTypes.length > 0 && (
          <div className="text-center text-secondary small py-2">
            Total: {filteredTypes.length} clothing types
          </div>
        )}
      </div>

      {/* Modal - Mobile Responsive */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered fullscreen="sm-down">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '18px' }}>
            {editData ? '✏️ Edit Clothing Type' : '➕ Add Clothing Type'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiTag className="me-1" /> Type Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="type_name"
                    value={formData.type_name}
                    onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                    placeholder="e.g. Hoodies - အထူ"
                    required
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiDollarSign className="me-1" /> Price <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="default_price"
                    value={formData.default_price}
                    onChange={(e) => setFormData({ ...formData, default_price: e.target.value })}
                    placeholder="e.g. 500"
                    required
                    min="0"
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                  <Form.Text className="text-secondary small">
                    Price in MMK (Kyat)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    className="py-2"
                    style={{ resize: 'none', fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">Status</Form.Label>
                  <Form.Select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editData ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ClothingTypesPage;