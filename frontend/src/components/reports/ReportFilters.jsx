import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FiCalendar, FiDownload } from 'react-icons/fi';

const ReportFilters = ({
  reportType,
  setReportType,
  date,
  setDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onGenerate,
  onExport,
  loading
}) => {
  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body>
        <h6 className="fw-bold mb-3">
          <FiCalendar className="me-2" /> Report Filters
        </h6>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Report Type</Form.Label>
              <Form.Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {reportType === 'custom' ? (
            <>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </>
          ) : (
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          )}

          <Col md={3}>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={onGenerate}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </Button>
              <Button
                variant="outline-success"
                onClick={onExport}
                disabled={loading}
              >
                <FiDownload />
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ReportFilters;