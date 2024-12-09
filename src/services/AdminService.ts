import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import { Client } from 'interfaces/Client';
import { Login } from 'interfaces/Login';

const MAX_STACKED_ERRORS = 1;
const ERROR_MESSAGE_DURATION = 3000;
let errorCounter = 0;
let loggingOut = false;

export const instance = axios.create({
  baseURL: process.env.REACT_APP_HOST_ENDPOINT,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.response.use(
  response => {
    const { error, message, success, results } = response?.data;
    if (!loggingOut) {
      if (error && error.response?.data !== 'Invalid Token') {
        errorHandler(error, message || error, response.data);
      } else if (success === false && !(results && !results.length)) {
        errorHandler(new Error('Request failed'), 'Request failed.');
      }
    }
    return response.data;
  },
  error => {
    if (!loggingOut) {
      if (error.response?.data === 'Invalid Token') {
        loggingOut = true;
        message.error('Your session has expired, please login');
        localStorage.clear();
        window.location.replace('/login');
      } else {
        errorHandler(error);
      }
    }
  }
);

const errorHandler = (
  error: any,
  errorMsg = 'Something went wrong.',
  responseData?: any
) => {
  if (errorCounter < MAX_STACKED_ERRORS) {
    message.error('Error: ' + errorMsg);
    errorCounter++;
    setTimeout(() => {
      errorCounter--;
    }, ERROR_MESSAGE_DURATION);
  }
  if (responseData) {
    // eslint-disable-next-line no-throw-literal
    throw { error, ...responseData };
  } else {
    throw error;
  }
};

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  const data = JSON.parse(JSON.stringify(config.data || {}));
  config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  config.data = data;
  return config;
});

export const signIn = (params: Login) =>
  instance.post('v1/auth/admin/signin', params);

export const getClients = () => instance.get('v1/client');

export const updateClient = (params: Client) =>
  instance.patch(`v1/client/${params.id}`, params);