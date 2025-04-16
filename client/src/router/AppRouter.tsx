import { FC } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import { privateRoutes, publicRoutes } from './router';

const AppRouter: FC = () => {

   return (
      <>
         <Routes>
            {
               publicRoutes.map(route =>
                  <Route
                     key={route.path}
                     path={route.path}
                     element={<route.component />}
                  />
               )
            }
            {
               privateRoutes.map(route =>
                  <Route
                     key={route.path}
                     path={route.path}
                     element={<PrivateRoute routePage={<route.component />} />}
                  />
               )
            }
            <Route path={"*"} element={<Navigate to="/" />} />
         </Routes >
      </>
   )
}


export default AppRouter;