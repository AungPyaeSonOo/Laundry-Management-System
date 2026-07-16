import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { FiPackage, FiPlus, FiTrash2, FiSave, FiX, FiDollarSign } from 'react-icons/fi';
import { orderApi, clothingTypeApi } from '../../api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AddItemsModal = ({ show, onHide, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [clothingTypes, setClothingTypes] = useState([]);
  const [items, setItems] = useState([
    { clothing_type_id: '', quantity: 1, unit_price: 0 }
  ]);

  useEffect(() => {
    if (show) {
      fetchClothingTypes();
      // Reset items when modal opens
      setItems([{ clothing_type_id: '', quantity: 1, unit_price: 0 }]);
    }
  }, [show]);

  const fetchClothingTypes = async () => {
    try {
      const response = await clothingTypeApi.getAll();
      setClothingTypes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clothing types:', error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'clothing_type_id') {
      const selectedType = clothingTypes.find(ct => ct.clothing_type_id === parseInt(value));
      if (selectedType) {
        newItems[index].unit_price = selectedType.default_price;
      }
    }
    
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { clothing_type_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Check if any item is selected
    if (!items.some(item => item.clothing_type_id)) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const data = {
        items: items
          .filter(item => item.clothing_type_id)
          .map(item => ({
            clothing_type_id: parseInt(item.clothing_type_id),
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price)
          })),
        notes: `Items added by ${order?.user?.full_name || 'Admin'}`
      };

      await orderApi.addItems(order.order_id, data);
      toast.success('✅ Items added successfully!');
      onSuccess?.();
      onHide();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FiPackage className="me-2" /> Add Items to Order
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <div className="text-secondary small">
              Order #{order?.order_number} - Customer: {order?.customer?.name}
            </div>
            <Badge bg="info" className="mt-1">Collected - Ready for Items</Badge>
          </div>

          {items.map((item, index) => (
            <Row key={index} className="g-2 mb-2 align-items-end">
              <Col xs={12} sm={5}>
                <Form.Select
                  value={item.clothing_type_id}
                  onChange={(e) => handleItemChange(index, 'clothing_type_id', e.target.value)}
                  className="py-2"
                  required
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
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  required
                  className="py-2"
                />
              </Col>
              <Col xs={5} sm={3}>
                <Form.Control
                  type="number"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  min="0"
                  required
                  className="py-2"
                />
              </Col>
              <Col xs={2} sm={1}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="w-100"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                >
                  <FiTrash2 size={14} />
                </Button>
              </Col>
              {item.clothing_type_id && item.quantity > 0 && (
                <Col xs={12} sm={1}>
                  <Badge bg="info" className="w-100 py-2">
                    {formatPrice(item.quantity * item.unit_price)}
                  </Badge>
                </Col>
              )}
            </Row>
          ))}

          <Button
            variant="outline-primary"
            size="sm"
            onClick={addItem}
            className="mt-2"
          >
            <FiPlus className="me-1" /> Add Item
          </Button>

          <div className="mt-3 p-3 bg-light rounded-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">Total Amount</span>
              <span className="fs-4 fw-bold text-primary">
                {formatPrice(calculateTotal())} MMK
              </span>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Adding...
              </>
            ) : (
              <>
                <FiSave className="me-2" /> Add Items
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddItemsModal;