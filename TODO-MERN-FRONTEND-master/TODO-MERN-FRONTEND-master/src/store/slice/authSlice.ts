import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  loading: false,
  error: null,
};

// Async actions for login, register, logout, and profile update
export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/login`,
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data?.message || axiosError.message || 'Login failed'
      );
    }
  }
);

export const register = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>(
  'auth/register',
  async ({ name, email, password }, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/register`,
        { name, email, password },
        { withCredentials: true }
      );

      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data?.message || axiosError.message || 'Registration failed'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await axios.post(`${API_BASE_URL}/api/users/logout`, {}, { withCredentials: true });
  
  // Remove user data from localStorage on logout
  localStorage.removeItem('user');
  
  return null;
});

export const updateProfile = createAsyncThunk<
  User,
  { name: string; currentPassword?: string; newPassword?: string },
  { rejectValue: string }
>(
  'auth/updateProfile',
  async ({ name, currentPassword, newPassword }, thunkAPI) => {
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        { name, currentPassword, newPassword },
        { withCredentials: true }
      );

      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        axiosError.response?.data?.message || axiosError.message || 'Profile update failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Registration failed';
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Logout failed';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Profile update failed';
      });
  },
});

export default authSlice.reducer;
