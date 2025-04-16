import { FC, ReactNode } from 'react';

import classes from './Container.module.css';

interface IContainerProps {
   children: ReactNode;
}

const Container: FC<IContainerProps> = ({ children }) => {
   return (
      <div className={classes.wrapper}>
         <div className={classes.container}>{children}</div>
      </div>
   )

};

export default Container;
