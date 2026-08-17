import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';

export const rootReducer = combineReducers({
    auth: authReducer,
});
