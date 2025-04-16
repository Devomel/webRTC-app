import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authService = createApi({
   reducerPath: "authService",
   baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api" }),
   endpoints: (builder) => ({
      signUp: builder.mutation({
         query: (body) => ({
            url: "/registration",
            method: "POST",
            body: body
         })
      }),
      signIn: builder.mutation({
         query: (body) => ({
            url: "/login",
            method: "POST",
            body: body
         })
      }),
      signOut: builder.mutation({
         query: () => ({
            url: "/logout",
            method: "POST",
         })
      }),
      refresh: builder.query({
         query: () => "/refresh"
      }),
   })
})