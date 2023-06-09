import AppRoute from './AppRoute';
import AuthenticatedLayout from 'layout/AuthenticatedLayout';
import OpenLayout from 'layout/OpenLayout';
import Login from 'pages/login/Login';
import { Redirect, Switch } from 'react-router-dom';
import BrandDashboard from 'pages/dashboard/BrandDashboard';
import PlaylistStudio from 'pages/playlist-studio/PlaylistStudio';
import BrandManagerProducts from 'pages/products/BrandManagerProducts';

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
        path="/brand-products"
        component={BrandManagerProducts}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/brand-dashboard"
        component={BrandDashboard}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/playlist-studio"
        component={PlaylistStudio}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default BrandManagerRoutes;
