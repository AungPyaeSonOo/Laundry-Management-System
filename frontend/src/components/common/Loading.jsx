import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = ({ fullScreen = true }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3">
      <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      <div className="text-secondary">Loading...</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;