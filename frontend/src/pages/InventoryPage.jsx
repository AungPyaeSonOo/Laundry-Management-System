import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, InputGroup, Form, Modal, Row, Col } from 'react-bootstrap';
import {
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiAlertCircle,
  FiCheckCircle,
  FiBox,
  FiRefreshCw
} from 'react-icons/fi';
import { inventoryApi } from '../api';
import Loading from '../components/common/Loading';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: '',
    unit: '',
    unit_price: '',
    reorder_level: '',
    expiry_date: '',
    supplier: '',
    notes: ''
  });

  const categories = [
    'detergent',
    'fabric_softener',
    'bleach',
    'stain_remover',
    'packaging',
    'spare_part',
    'other'
  ];

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter, lowStockFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockFilter) params.low_stock = 'true';
      
      const response = await inventoryApi.getAll(params);
      setInventory(response.data.data.inventory || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const clearSearch = () => {
    setSearch('');
    fetchInventory();
  };

  const handleAddItem = () => {
    setEditData(null);
    setFormData({
      item_name: '',
      category: '',
      quantity: '',
      unit: '',
      unit_price: '',
      reorder_level: '',
      expiry_date: '',
      supplier: '',
      notes: ''
    });
    setShowForm(true);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleEditItem = (item) => {
    setEditData(item);
    setFormData({
      item_name: item.item_name || '',
      category: item.category || '',
      quantity: item.quantity || '',
      unit: item.unit || '',
      unit_price: item.unit_price || '',
      reorder_level: item.reorder_level || '',
      expiry_date: item.expiry_date || '',
      supplier: item.supplier || '',
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.item_name}"?`)) return;
    
    try {
      await inventoryApi.delete(item.inventory_id);
      toast.success('Item deleted successfully!');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        item_name: formData.item_name,
        category: formData.category,
        quantity: parseFloat(formData.quantity) || 0,
        unit: formData.unit,
        unit_price: parseFloat(formData.unit_price) || 0,
        reorder_level: parseFloat(formData.reorder_level) || 0,
        expiry_date: formData.expiry_date || null,
        supplier: formData.supplier || null,
        notes: formData.notes || null
      };

      if (editData) {
        await inventoryApi.update(editData.inventory_id, data);
        toast.success('Item updated successfully!');
      } else {
        await inventoryApi.create(data);
        toast.success('Item created successfully!');
      }
      
      setShowForm(false);
      setEditData(null);
      setFormData({
        item_name: '',
        category: '',
        quantity: '',
        unit: '',
        unit_price: '',
        reorder_level: '',
        expiry_date: '',
        supplier: '',
        notes: ''
      });
      fetchInventory();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (item) => {
    return item.quantity <= item.reorder_level;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      detergent: 'Detergent',
      fabric_softener: 'Fabric Softener',
      bleach: 'Bleach',
      stain_remover: 'Stain Remover',
      packaging: 'Packaging',
      spare_part: 'Spare Part',
      other: 'Other'
    };
    return labels[category] || category;
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold mb-1">📦 Inventory</h4>
          <p className="text-secondary small mb-0">Manage your stock and supplies</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={fetchInventory}
            className="d-flex align-items-center gap-2"
            size="sm"
          >
            <FiRefreshCw size={16} /> Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddItem}
            className="d-flex align-items-center gap-2 px-4 py-2 rounded-3"
          >
            <FiPlus size={18} /> Add Item
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
                    placeholder="Search by item name..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-3"
                style={{ width: '160px', fontSize: '14px' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                ))}
              </Form.Select>
              <Button 
                variant={lowStockFilter ? 'warning' : 'outline-warning'}
                onClick={() => setLowStockFilter(!lowStockFilter)}
                className="d-flex align-items-center gap-1"
                style={{ fontSize: '14px' }}
              >
                <FiAlertCircle size={16} /> Low Stock
              </Button>
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

      {/* Inventory Table - Desktop */}
      <Card className="shadow-sm border-0 d-none d-sm-block">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ minWidth: '750px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="ps-3" style={{ width: '40px' }}>#</th>
                  <th style={{ minWidth: '130px' }}>Item Name</th>
                  <th style={{ minWidth: '120px' }}>Category</th>
                  <th style={{ minWidth: '80px' }}>Quantity</th>
                  <th style={{ minWidth: '70px' }}>Unit</th>
                  <th style={{ minWidth: '100px' }}>Unit Price</th>
                  <th style={{ minWidth: '100px' }}>Status</th>
                  <th className="text-center pe-3" style={{ width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-secondary">
                        <FiBox size={48} className="mb-2 opacity-25" />
                        <p className="mb-1">No inventory items found</p>
                        <small>Click "Add Item" to create one</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inventory.map((item, index) => (
                    <tr key={item.inventory_id} className="align-middle">
                      <td className="ps-3" style={{ fontSize: '13px' }}>{index + 1}</td>
                      <td>
                        <div className="fw-medium" style={{ fontSize: '14px' }}>{item.item_name}</div>
                        {item.notes && (
                          <small className="text-secondary" style={{ fontSize: '11px' }}>{item.notes}</small>
                        )}
                      </td>
                      <td>
                        <Badge bg="secondary" className="d-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                          <FiTag size={12} /> {getCategoryLabel(item.category)}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        <span className={isLowStock(item) ? 'text-danger fw-bold' : ''}>
                          {item.quantity}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{item.unit}</td>
                      <td>
                        <span className="fw-medium" style={{ fontSize: '13px' }}>
                          {formatCurrency(item.unit_price)} MMK
                        </span>
                      </td>
                      <td>
                        {isLowStock(item) ? (
                          <Badge bg="danger" className="d-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                            <FiAlertCircle size={12} /> Low Stock
                          </Badge>
                        ) : (
                          <Badge bg="success" className="d-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                            <FiCheckCircle size={12} /> In Stock
                          </Badge>
                        )}
                      </td>
                      <td className="text-center pe-3">
                        <div className="d-flex justify-content-center gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleViewItem(item)}
                            title="View Details"
                          >
                            <FiEye size={13} />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleEditItem(item)}
                            title="Edit Item"
                          >
                            <FiEdit size={13} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="rounded-circle p-1"
                            style={{ width: '30px', height: '30px', minWidth: '30px' }}
                            onClick={() => handleDeleteItem(item)}
                            title="Delete Item"
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
          {inventory.length > 0 && (
            <div className="p-3 border-top text-secondary small">
              Total: {inventory.length} items
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mobile Card View */}
      <div className="d-block d-sm-none">
        {inventory.length === 0 ? (
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center py-5">
              <FiBox size={48} className="text-secondary mb-2 opacity-25" />
              <p className="text-secondary mb-1">No inventory items found</p>
              <small className="text-secondary">Click "Add Item" to create one</small>
            </Card.Body>
          </Card>
        ) : (
          inventory.map((item, index) => (
            <Card key={item.inventory_id} className="shadow-sm border-0 mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold" style={{ fontSize: '15px' }}>{item.item_name}</div>
                    <Badge bg="secondary" className="mt-1" style={{ fontSize: '11px' }}>
                      {getCategoryLabel(item.category)}
                    </Badge>
                  </div>
                  {isLowStock(item) ? (
                    <Badge bg="danger" style={{ fontSize: '11px' }}>⚠️ Low Stock</Badge>
                  ) : (
                    <Badge bg="success" style={{ fontSize: '11px' }}>✅ In Stock</Badge>
                  )}
                </div>
                
                <div className="row g-1 small mt-2">
                  <div className="col-4">
                    <span className="text-secondary">Qty:</span>{' '}
                    <span className={isLowStock(item) ? 'text-danger fw-bold' : ''}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="col-4">
                    <span className="text-secondary">Unit:</span> {item.unit}
                  </div>
                  <div className="col-4">
                    <span className="text-secondary">Price:</span>{' '}
                    <span className="fw-bold">{formatCurrency(item.unit_price)}</span>
                  </div>
                </div>
                
                {item.notes && (
                  <div className="text-secondary small mt-1">{item.notes}</div>
                )}
                
                <div className="d-flex gap-2 mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleViewItem(item)}
                  >
                    <FiEye className="me-1" /> View
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleEditItem(item)}
                  >
                    <FiEdit className="me-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => handleDeleteItem(item)}
                  >
                    <FiTrash2 className="me-1" /> Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
        {inventory.length > 0 && (
          <div className="text-center text-secondary small py-2">
            Total: {inventory.length} items
          </div>
        )}
      </div>

      {/* Inventory Form Modal - Mobile Responsive */}
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
            <FiPackage className="me-2" />
            {editData ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiPackage className="me-1" /> Item Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="Enter item name"
                    required
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiTag className="me-1" /> Category <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    Quantity <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    required
                    min="0"
                    step="0.01"
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    Unit <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. kg, liter, piece"
                    required
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    <FiDollarSign className="me-1" /> Unit Price <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
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
                    Reorder Level
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                  <Form.Text className="text-secondary small">
                    When quantity reaches this level, it will show as low stock
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    Expiry Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    Supplier
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                    className="py-2"
                    style={{ fontSize: '14px' }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium small text-secondary">
                    Notes
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    className="py-2"
                    style={{ resize: 'none', fontSize: '14px' }}
                  />
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
              {editData ? 'Update Item' : 'Create Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Inventory Detail Modal - Mobile Responsive */}
      {selectedItem && (
        <Modal 
          show={showDetail} 
          onHide={() => {
            setShowDetail(false);
            setSelectedItem(null);
          }} 
          centered
          size="lg"
          fullscreen="sm-down"
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: '18px' }}>
              <FiPackage className="me-2" /> Item Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <div className="bg-light rounded-3 p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-secondary">Item Name</small>
                    <div className="fw-bold fs-5">{selectedItem.item_name}</div>
                  </div>
                  {isLowStock(selectedItem) ? (
                    <Badge bg="danger" className="px-3 py-2">⚠️ Low Stock</Badge>
                  ) : (
                    <Badge bg="success" className="px-3 py-2">✅ In Stock</Badge>
                  )}
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Category</small>
                  <div className="fw-medium">
                    <Badge bg="secondary">
                      {getCategoryLabel(selectedItem.category)}
                    </Badge>
                  </div>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Unit</small>
                  <div className="fw-medium">{selectedItem.unit}</div>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Quantity</small>
                  <div className={`fw-bold fs-5 ${isLowStock(selectedItem) ? 'text-danger' : ''}`}>
                    {selectedItem.quantity}
                  </div>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Unit Price</small>
                  <div className="fw-bold fs-5">
                    {formatCurrency(selectedItem.unit_price)} MMK
                  </div>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Reorder Level</small>
                  <div className="fw-bold fs-5">
                    {selectedItem.reorder_level || 'Not set'}
                  </div>
                </div>
              </Col>

              <Col xs={12}>
                <div className="bg-light rounded-3 p-3">
                  <small className="text-secondary">Supplier</small>
                  <div className="fw-medium">{selectedItem.supplier || 'N/A'}</div>
                </div>
              </Col>

              {selectedItem.expiry_date && (
                <Col xs={12} md={6}>
                  <div className="bg-light rounded-3 p-3">
                    <small className="text-secondary">Expiry Date</small>
                    <div className="fw-medium">
                      {new Date(selectedItem.expiry_date).toLocaleDateString()}
                    </div>
                  </div>
                </Col>
              )}

              {selectedItem.notes && (
                <Col xs={12}>
                  <div className="bg-light rounded-3 p-3">
                    <small className="text-secondary">Notes</small>
                    <div className="fw-medium">{selectedItem.notes}</div>
                  </div>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer className="flex-wrap gap-2">
            <Button variant="secondary" onClick={() => {
              setShowDetail(false);
              setSelectedItem(null);
            }}>
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setShowDetail(false);
                handleEditItem(selectedItem);
              }}
            >
              <FiEdit className="me-2" /> Edit Item
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default InventoryPage;