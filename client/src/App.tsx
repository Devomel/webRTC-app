import { BrowserRouter } from "react-router-dom"
import AppRouter from "./router/AppRouter"
import "./styles/reset.css"

function App() {
   return (
      <>
         <BrowserRouter>
            <AppRouter />
         </BrowserRouter>
      </>
   )
}

export default App
