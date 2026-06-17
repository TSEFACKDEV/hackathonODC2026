import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import signalReducer from "./slices/signalSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    signals: signalReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;