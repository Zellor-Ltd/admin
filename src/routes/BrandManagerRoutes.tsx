import AuthRoute from "components/auth-route/AuthRoute";
import AuthenticatedLayout from "layout/AuthenticatedLayout";
import OpenLayout from "layout/OpenLayout";
import Login from "pages/login/Login";
import Products from "pages/products/Products";
import ProductDetails from "pages/products/ProductsDetails";
import { Switch } from "react-router-dom";

function BrandManagerRoutes() {
  return (
    <Switch>
      <AuthRoute
        exact
        path="/"
        component={() => <></>}
        layout={AuthenticatedLayout}
      />
      <AuthRoute path="/login" component={Login} layout={OpenLayout} />
      <AuthRoute
        path="/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/products"
        component={Products}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default BrandManagerRoutes;
