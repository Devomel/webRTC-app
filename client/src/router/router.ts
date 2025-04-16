import { FC } from "react";

import Auth from "../components/Auth/AuthForm";
import Main from "../pages/Main";


interface Route {
   path: string;
   component: FC;
}

export const publicRoutes: Route[] = [
   { path: "/auth", component: Auth },
   { path: "/", component: Main },
]

export const privateRoutes: Route[] = [
]