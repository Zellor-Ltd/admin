import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const getSettings = createAsyncThunk(
  'settings/FetchSettings',
  async () => {
    /* 
    const response: any = await fetchSettings();
    return response.results[0]; */
  }
);

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    settings: {},
  },
  reducers: {},
});

export default settingsSlice.reducer;
