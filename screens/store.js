import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../screens/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess', 'auth/logoutSuccess'],
        ignoredPaths: ['auth.userData.someNonSerializableValue'],
      },
    }),
});

export default store;
