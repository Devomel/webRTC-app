import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { Mutex } from 'async-mutex'

import { IAuthResponse, loggedOut, tokenReceived } from "../store/authSlice";

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'

const mutex = new Mutex()
const baseQuery = fetchBaseQuery({ baseUrl: "http://localhost:5000/api" })
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  //Чекаємо поки м'ютекс стане доступним не блокуючи його
  await mutex.waitForUnlock()
  let result = await baseQuery(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    //Перевіряємо чи м'ютекс заблоковано 
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const refreshToken = await baseQuery("/refresh", api, extraOptions)
        const tokensData = refreshToken.data as IAuthResponse
        if (tokensData) {
          api.dispatch(tokenReceived(tokensData))
          // Повторюємо початковий запит
          result = await baseQuery(args, api, extraOptions)
        } else {
          api.dispatch(loggedOut())
        }
      } finally {
        //Функція release() має бути викликана одноразово коли м'ютекс має бути звільний
        release()
      }
    } else {
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }
  return result
}