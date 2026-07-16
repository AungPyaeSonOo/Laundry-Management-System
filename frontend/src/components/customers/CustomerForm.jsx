import React, { useState, useEffect } from 'react';  // ✅ useEffect ကိုထည့်ပါ
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { FiUser, FiPhone, FiMapPin, FiFileText, FiX, FiSave } from 'react-icons/fi';
import { customerApi } from '../../api';
import toast from 'react-hot-toast';

const CustomerForm = ({ show, onHide, onSuccess, editData }) => {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  });

  // ✅ editData ပြောင်းတိုင်း formData ကို update လုပ်ပါ
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        phone: editData.phone || '',
        address: editData.address || '',
        note: editData.note || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        note: '',
      });
    }
  }, [editData, show]); // ✅ show ပြောင်းတိုင်းလည်း update လုပ်ပါ

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await customerApi.update(editData.customer_id, formData);
        toast.success('Customer updated successfully!');
      } else {
        await customerApi.create(formData);
        toast.success('Customer created successfully!');
      }
      
      onSuccess?.();
      onHide();
      setFormData({
        name: '',
        phone: '',
        address: '',
        note: '',
      });
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(error.response?.data?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onHide();
      setFormData({
        name: '',
        phone: '',
        address: '',
        note: '',
      });
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg"
      backdrop="static"
      keyboard={!loading}
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <div>
          <h5 className="fw-bold mb-1">
            {isEdit ? '✏️ Edit Customer' : '👤 Add New Customer'}
          </h5>
          <p className="text-secondary small mb-0">
            {isEdit ? 'Update customer information' : 'Fill in the details to add a new customer'}
          </p>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3">
          <Row className="g-3">
            {/* Customer Name */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary">
                  <FiUser className="me-1" /> Customer Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                  className="py-2 rounded-3"
                />
              </Form.Group>
            </Col>

            {/* Phone Number */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary">
                  <FiPhone className="me-1" /> Phone Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="09-XXX-XXX-XXX"
                  required
                  className="py-2 rounded-3"
                />
              </Form.Group>
            </Col>

            {/* Address */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary">
                  <FiMapPin className="me-1" /> Address
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address (မြန်မာလို ရေးနိုင်ပါသည်)"
                  className="py-2 rounded-3"
                  style={{ 
                    fontFamily: '"Pyidaungsu", "Myanmar Text", sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    resize: 'none'
                  }}
                />
                <Form.Text className="text-secondary small">
                  💡 You can type in Myanmar (Unicode)
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Note */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-medium small text-secondary">
                  <FiFileText className="me-1" /> Note
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Any special notes about this customer..."
                  className="py-2 rounded-3"
                  style={{ resize: 'none' }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="light" 
            onClick={handleClose}
            disabled={loading}
            className="px-4 rounded-3"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
            className="px-4 rounded-3 d-flex align-items-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FiSave /> {isEdit ? 'Update Customer' : 'Create Customer'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CustomerForm;