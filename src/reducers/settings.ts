import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchSettings } from "services/DiscoClubService";

export const getSettings = createAsyncThunk(
  "settings/FetchSettings",
  async () => {
    const response: any = await fetchSettings();
    return response.results[0];
  }
);

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: {},
  },
  reducers: {},
  extraReducers: {
    [getSettings.fulfilled.type]: (state, action) => {
      state.settings = action.payload;
    },
  },
});

export default settingsSlice.reducer;
