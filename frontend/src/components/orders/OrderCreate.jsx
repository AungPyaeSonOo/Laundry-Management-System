import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { FiUser, FiPackage, FiDollarSign, FiCalendar, FiSave, FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import { orderApi, customerApi, clothingTypeApi } from '../../api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const OrderCreate = ({ show, onHide, onSuccess, editData }) => {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [clothingTypes, setClothingTypes] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    items: [{ clothing_type_id: '', quantity: 1, unit_price: 0 }],
    pickup_date: '',
    discount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchCustomers('');
    fetchClothingTypes();
    if (editData) {
      const hasItems = editData.items && editData.items.length > 0;
      setShowItems(hasItems);
      setFormData({
        customer_id: editData.customer_id || '',
        customer_name: editData.customer?.name || '',
        items: editData.items?.map(item => ({
          clothing_type_id: item.clothing_type_id || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0
        })) || [{ clothing_type_id: '', quantity: 1, unit_price: 0 }],
        pickup_date: editData.pickup_date || '',
        discount: editData.discount || 0,
        notes: editData.notes || ''
      });
    }
  }, [editData, show]);

  const fetchCustomers = async (search = '') => {
    try {
      const response = await customerApi.getAll({ search, limit: 10 });
      setCustomers(response.data.data.customers || []);
    } catch (error) {
      // Silent fail
    }
  };

  const fetchClothingTypes = async () => {
    try {
      const response = await clothingTypeApi.getAll();
      setClothingTypes(response.data.data || []);
    } catch (error) {
      // Silent fail
    }
  };

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setFormData(prev => ({ ...prev, customer_name: value }));
    setShowCustomerDropdown(true);
    fetchCustomers(value);
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customer.customer_id,
      customer_name: customer.name
    }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Fix: Allow empty string for number inputs
  const handleDiscountChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      discount: val === '' ? '' : parseFloat(val)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    if (field === 'clothing_type_id') {
      const selectedType = clothingTypes.find(ct => ct.clothing_type_id === parseInt(value));
      if (selectedType) {
        newItems[index].unit_price = selectedType.default_price;
      }
    }
    
    newItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  // ✅ Fix: Handle quantity change with empty string
  const handleQuantityChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index].quantity = value === '' ? '' : parseInt(value) || 1;
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  // ✅ Fix: Handle unit price change with empty string
  const handleUnitPriceChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index].unit_price = value === '' ? '' : parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { clothing_type_id: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.unit_price || 0));
    }, 0);
    return subtotal - (formData.discount || 0);
  };

  const totalItems = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        customer_id: formData.customer_id,
        pickup_date: formData.pickup_date || null,
        discount: formData.discount || 0,
        notes: formData.notes || 'Order created'
      };

      if (showItems && formData.items.some(item => item.clothing_type_id)) {
        data.items = formData.items
          .filter(item => item.clothing_type_id)
          .map(item => ({
            clothing_type_id: item.clothing_type_id,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0
          }));
      } else {
        data.items = [];
        data.notes = (data.notes || '') + ' (Items pending)';
      }

      if (isEdit) {
        await orderApi.update(editData.order_id, data);
        toast.success('Order updated successfully!');
      } else {
        await orderApi.create(data);
        toast.success('Order created successfully!');
      }
      
      onSuccess?.();
      onHide();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      backdrop="static"
      keyboard={!loading}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FiPackage className="me-2" />
          {isEdit ? 'Edit Order' : 'New Order'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            {/* Customer Search */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary">
                  <FiUser className="me-1" /> Customer <span className="text-danger">*</span>
                </Form.Label>
                <div className="position-relative">
                  <div className="d-flex align-items-center border rounded-3 px-2" style={{ backgroundColor: '#fff' }}>
                    <FiSearch className="text-secondary me-2" size={18} />
                    <Form.Control
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={formData.customer_name}
                      onChange={handleCustomerSearch}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                      className="border-0 py-2"
                      required
                    />
                  </div>
                  
                  {showCustomerDropdown && customers.length > 0 && (
                    <div 
                      className="position-absolute w-100 mt-1 border rounded-3 shadow-sm"
                      style={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto', 
                        backgroundColor: '#fff',
                        zIndex: 1050
                      }}
                    >
                      {customers.map(customer => (
                        <div
                          key={customer.customer_id}
                          className="px-3 py-2 border-bottom cursor-pointer hover-bg-light"
                          onClick={() => handleCustomerSelect(customer)}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                        >
                          <div className="fw-medium">{customer.name}</div>
                          <small className="text-secondary">{customer.phone}</small>
                          {customer.address && (
                            <div className="text-secondary small">{customer.address}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Form.Text className="text-secondary small">
                  💡 Customer ကိုရှာပြီး ရွေးပါ
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Toggle Items */}
            <Col xs={12}>
              <Form.Check
                type="checkbox"
                label="Add Items Now (Optional - Delivery can add later)"
                checked={showItems}
                onChange={(e) => setShowItems(e.target.checked)}
                className="fw-medium"
              />
              <Form.Text className="text-secondary small">
                💡 မရွေးထားရင် Delivery က Pickup ပြီးမှ Items ထည့်ပေးပါမည်
              </Form.Text>
            </Col>

            {/* Items */}
            {showItems && (
              <Col xs={12}>
                <Form.Label className="fw-medium small text-secondary">
                  <FiPackage className="me-1" /> Items
                </Form.Label>
                {formData.items.map((item, index) => (
                  <Row key={index} className="g-2 mb-2 align-items-end">
                    <Col xs={12} sm={5}>
                      <Form.Select
                        value={item.clothing_type_id}
                        onChange={(e) => handleItemChange(index, 'clothing_type_id', e.target.value)}
                        className="py-2"
                      >
                        <option value="">Select Clothing Type</option>
                        {clothingTypes.map(type => (
                          <option key={type.clothing_type_id} value={type.clothing_type_id}>
                            {type.type_name} - {formatPrice(type.default_price)} MMK
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={5} sm={2}>
                      <Form.Control
                        type="number"
                        placeholder="Qty"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        min="1"
                        className="py-2"
                      />
                    </Col>
                    <Col xs={5} sm={3}>
                      <Form.Control
                        type="number"
                        placeholder="Price"
                        value={item.unit_price === 0 ? '' : item.unit_price}
                        onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                        min="0"
                        className="py-2"
                      />
                    </Col>
                    <Col xs={2} sm={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length <= 1}
                      >
                        <FiTrash2 size={14} />
                      </Button>
                    </Col>
                    {item.clothing_type_id && (item.quantity || 0) > 0 && (
                      <Col xs={12} sm={1}>
                        <Badge bg="info" className="w-100 py-2">
                          {formatPrice((item.quantity || 0) * (item.unit_price || 0))}
                        </Badge>
                      </Col>
                    )}
                  </Row>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addItem}
                  className="mt-1"
                >
                  <FiPlus className="me-1" /> Add Item
                </Button>
              </Col>
            )}

            {/* Summary */}
            {showItems && (
              <Col xs={12}>
                <div className="bg-light rounded-3 p-3">
                  <Row className="align-items-center">
                    <Col xs={6} md={4}>
                      <div className="text-secondary small">Total Items</div>
                      <div className="fw-bold fs-5">{totalItems}</div>
                    </Col>
                    <Col xs={6} md={4}>
                      <Form.Group>
                        <Form.Label className="fw-medium small text-secondary">
                          <FiDollarSign className="me-1" /> Discount
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="discount"
                          value={formData.discount === 0 ? '' : formData.discount}
                          onChange={handleDiscountChange}
                          min="0"
                          className="py-1"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <div className="text-secondary small">Total Amount</div>
                      <div className="fs-4 fw-bold text-primary">
                        {formatPrice(calculateTotal())} MMK
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            )}

            {/* Pickup Date */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary">
                  <FiCalendar className="me-1" /> Pickup Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="pickup_date"
                  value={formData.pickup_date || ''}
                  onChange={handleChange}
                  className="py-2"
                />
                <Form.Text className="text-secondary small">
                  📅 Delivery သွားယူမည့်ရက်
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Notes */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary">Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes..."
                  className="py-2"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FiSave className="me-2" />
                {isEdit ? 'Update Order' : 'Create Order'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default OrderCreate;