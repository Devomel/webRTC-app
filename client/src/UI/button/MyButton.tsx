
import React, { ButtonHTMLAttributes } from 'react';

import classes from "./MyButton.module.css";

interface IMyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
}

const MyButton: React.FC<IMyButtonProps> = ({ text, ...props }) => {
  return (

    <button className={classes.myButton} {...props}>{text}</button>
  );
}

export default MyButton;
