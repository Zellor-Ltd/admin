import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from 'reducers/settings';

export default configureStore({
  reducer: {
    settings: settingsReducer,
  },
});
