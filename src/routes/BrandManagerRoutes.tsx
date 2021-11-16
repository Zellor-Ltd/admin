import AppRoute from "./AppRoute";
import AuthenticatedLayout from "layout/AuthenticatedLayout";
import OpenLayout from "layout/OpenLayout";
import Login from "pages/login/Login";
import ProductDetails from "pages/products/ProductsDetails";
import PreviewList from "pages/products/PreviewList";
import { Redirect, Switch } from "react-router-dom";
import Orders from "pages/orders/BrandManager/Orders";
import VideoFeed from "pages/video-feed/BrandManager/VideoFeed";
import VideoFeedDetail from "pages/video-feed/BrandManager/VideoFeedDetail";
import BrandDashboard from "pages/dashboard/BrandDashboard";

function BrandManagerRoutes() {
  return (
    <Switch>
      <AppRoute
        exact
        path="/"
        returnComponent
        component={<Redirect to="/brand-dashboard" />}
      />

      <AppRoute path="/login" component={Login} layout={OpenLayout} />
      <AppRoute
        path="/products/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/preview-list/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/brand-dashboard"
        component={BrandDashboard}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/preview-list"
        component={PreviewList}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/orders"
        component={Orders}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/feed/video-feed"
        component={VideoFeedDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/feed"
        component={VideoFeed}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default BrandManagerRoutes;
