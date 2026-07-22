import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = ({ fullScreen = true, text = 'Loading...' }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3 loading-container">
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
      <div className="loading-text text-secondary">{text}</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light loading-fullscreen">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = ({ fullScreen = true, text = 'Loading...' }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3 loading-container">
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
      <div className="loading-text text-secondary">{text}</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light loading-fullscreen">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;