import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import noteReducer from './slices/noteSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    notes: noteReducer,
  },
});