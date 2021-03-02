import { BrowserRouter } from "react-router-dom";
import AuthenticatedLayout from "./layout/AuthenticatedLayout";
import Routes from "./Routes";

function App() {
  return (
    <BrowserRouter>
      <AuthenticatedLayout>
        <Routes />
      </AuthenticatedLayout>
    </BrowserRouter>
  );
}

export default App;
