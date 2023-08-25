import AppRoute from './AppRoute';
import AuthenticatedLayout from 'layout/AuthenticatedLayout';
import OpenLayout from 'layout/OpenLayout';
import Login from 'pages/login/Login';
import { Redirect, Switch } from 'react-router-dom';
import BrandDashboard from 'pages/dashboard/BrandDashboard';
import Widgets from 'pages/widgets/Widgets';

function BrandManagerRoutes() {
  return (
    <Switch>
      <AppRoute
        exact
        path="/"
        returnComponent
        component={<Redirect to="/client-dashboard" />}
      />
      <AppRoute path="/login" component={Login} layout={OpenLayout} />
      <AppRoute
        path="/client-dashboard"
        component={BrandDashboard}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/widgets"
        component={Widgets}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default BrandManagerRoutes;
