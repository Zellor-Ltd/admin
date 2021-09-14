import AppRoute from "./AppRoute";
import AuthenticatedLayout from "layout/AuthenticatedLayout";
import OpenLayout from "layout/OpenLayout";
import Login from "pages/login/Login";
import ProductDetails from "pages/products/ProductsDetails";
import StagingList from "pages/products/StagingList";
import { Redirect, Switch } from "react-router-dom";

function BrandManagerRoutes() {
  return (
    <Switch>
      <AppRoute
        exact
        path="/"
        returnComponent
        component={<Redirect to="/staging-list" />}
      />

      <AppRoute path="/login" component={Login} layout={OpenLayout} />
      <AppRoute
        path="/products/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/staging-list/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/staging-list"
        component={StagingList}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default BrandManagerRoutes;
