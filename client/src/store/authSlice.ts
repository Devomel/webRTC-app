import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { authService } from "../services/authService";


export interface IUser {
   email: string;
   isActivated: boolean;
   id: string,
   role: string,
   username: string
}

export interface IAuthResponse {
   accessToken: string;
   refreshToken: string;
   user: IUser
}
type AuthState = {
   user: IUser | null
   accessToken: string | null
   isAuthenticated: boolean
}
const initialState: AuthState = {
   user: null, accessToken: null, isAuthenticated: false
}

const authSlice = createSlice({
   name: "auth",
   initialState: initialState,
   reducers: {
      tokenReceived(state, action: PayloadAction<IAuthResponse>) {
         state.accessToken = action.payload.accessToken
      },
      loggedOut(state) {
         state.accessToken = null;
         state.isAuthenticated = false;
         state.user = null
      }
   },
   extraReducers: (builder) => {
      builder.addMatcher(
         authService.endpoints.signUp.matchFulfilled,
         (state, action: PayloadAction<IAuthResponse>) => {
            state.user = action.payload.user
            state.isAuthenticated = true;
            state.accessToken = action.payload.accessToken
            localStorage.setItem("username", action.payload.user.username)
         }
      );
      builder.addMatcher(
         authService.endpoints.signIn.matchFulfilled,
         (state, action: PayloadAction<IAuthResponse>) => {
            state.user = action.payload.user
            state.isAuthenticated = true;
            state.accessToken = action.payload.accessToken
            localStorage.setItem("username", action.payload.user.username)
            localStorage.setItem("accessToken", action.payload.accessToken)
         }
      );
      builder.addMatcher(
         authService.endpoints.signOut.matchFulfilled,
         (state) => {
            state.user = null
            state.isAuthenticated = false;
            state.accessToken = null
            localStorage.removeItem("username")
         }
      )
   }
})
export const { tokenReceived, loggedOut } = authSlice.actions
export default authSlice.reducer