import { FC, InputHTMLAttributes } from 'react';

import classes from "./MyInput.module.scss"

interface IMyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  labelText?: string
}

const MyInput: FC<IMyInputProps> = ({ labelText, ...inputProps }) => {
  return (

    <>
      {labelText && <label>{labelText ? labelText : ""}</label>}
      <input className={classes.myInput} {...inputProps} />
    </>

  );
}

export default MyInput;
