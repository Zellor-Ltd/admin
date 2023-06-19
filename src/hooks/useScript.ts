import { useEffect } from 'react';

const useScript = ({ onLoad }: { onLoad: any }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'remote/path/to/test.js';
    script.onload = onLoad;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [onLoad]);
};

export default useScript;
