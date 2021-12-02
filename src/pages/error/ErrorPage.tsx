import { Button } from 'antd';
import React from 'react';

const ErrorPage = () => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <h1>Sorry... there was an error.</h1>
      <Button type="primary" onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  );
};

export default ErrorPage;
