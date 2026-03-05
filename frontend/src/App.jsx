import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";



const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
