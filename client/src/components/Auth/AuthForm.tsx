import { FC, useState } from "react"

import { SignIn } from "./SignIn";
import { SignUp } from "./SignUp";

import "./AuthForm.scss"


const AuthForm: FC = () => {

   const [isSignUp, setIsSignUp] = useState(false)

   return (
      <div >
         <div className="authForm">
            <div className="authForm__buttons">
               <button onClick={() => setIsSignUp(false)} >Вхід</button>
               <button onClick={() => setIsSignUp(true)}>Реєстрація</button>
            </div>
            <div>
               {
                  isSignUp ? <SignUp /> : <SignIn />
               }
            </div>

         </div>
      </div>
   )
}
export default AuthForm