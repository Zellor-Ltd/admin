import AuthRoute from "components/auth-route/AuthRoute";
import AuthenticatedLayout from "layout/AuthenticatedLayout";
import OpenLayout from "layout/OpenLayout";
import Login from "pages/login/Login";
import ProductDetails from "pages/products/ProductsDetails";
import StagingList from "pages/products/StagingList";
import { Redirect, Switch } from "react-router-dom";

function BrandManagerRoutes() {
  return (
    <Switch>
      <AuthRoute
        exact
        path="/"
        returnComponent
        component={<Redirect to="/staging-list" />}
      />

      <AuthRoute path="/login" component={Login} layout={OpenLayout} />
      <AuthRoute
        path="/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/staging-list"
        component={StagingList}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default BrandManagerRoutes;
