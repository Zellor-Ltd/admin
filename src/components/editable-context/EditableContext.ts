import { createContext } from 'react';
import { FormInstance } from 'antd';

export default createContext<FormInstance<any> | null>(null);
