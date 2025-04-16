import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";

interface PrivateRouteProps {
   routePage: ReactNode
}

const PrivateRoute = ({ routePage }: PrivateRouteProps) => {
   const { isAuthenticated } = useAppSelector(state => state.auth)
   const token = localStorage.getItem("accessToken")
   const location = useLocation()
   return (
      <>
         {(isAuthenticated || token) ? routePage : <Navigate to={"/auth"} state={{ from: location }} />}
      </>
   )
}

export default PrivateRoute;