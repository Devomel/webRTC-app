import { ChangeEvent, FC, useState } from "react"

import { authService } from "../../services/authService";
import MyButton from "../../UI/button/MyButton";
import MyInput from "../../UI/input/MyInput"



export const SignUp: FC = () => {

   const [userData, setUserData] = useState({
      username: "",
      email: "",
      password: ""
   });

   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setUserData((prev) => ({ ...prev, [name]: value }));
   };

   const [signUp, { isLoading }] = authService.useSignUpMutation();
   const [signOut] = authService.useSignOutMutation();

   const handleRegistration = async () => {
      try {
         await signUp(userData).unwrap();
      } catch (err) {
         console.error("Failed to register:", err);
      }
   };

   const handleLogout = async () => {
      try {
         await signOut('').unwrap();
      } catch (err) {
         console.error("Failed to log out:", err);
      }
   };

   if (isLoading) return <>Loading...</>;

   return (
      <div className="authForm__item">
         <MyInput
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            placeholder="Email"
         />
         <MyInput
            type="password"
            name="password"
            value={userData.password}
            onChange={handleInputChange}
            placeholder="Password"
         />
         <MyInput
            type="text"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            placeholder="Username"
         />
         <MyButton text="Зареєструватись" onClick={handleRegistration} />
         <MyButton text="Вийти" onClick={handleLogout} />
      </div>
   );
}
