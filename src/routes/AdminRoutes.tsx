import { Redirect, Switch } from 'react-router-dom';
import Login from 'pages/login/Login';
import Brands from 'pages/clients/Clients';
import Settings from 'pages/settings/Settings';
import AppRoute from './AppRoute';
import AuthenticatedLayout from 'layout/AuthenticatedLayout';
import OpenLayout from 'layout/OpenLayout';
import ForgotPassword from 'pages/login/ForgotPassword';
import SetPWD from 'pages/change-temp-pwd/SetPWD';

function AdminRoutes() {
  return (
    <Switch>
      <AppRoute
        exact
        path="/"
        returnComponent
        component={<Redirect to="/clients" />}
      />
      <AppRoute path="/login" component={Login} layout={OpenLayout} />
      <AppRoute
        path="/forgot-password"
        component={ForgotPassword}
        layout={OpenLayout}
      />
      <AppRoute
        path="/clients"
        component={Brands}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/change-temp-password"
        component={SetPWD}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/app-settings"
        component={Settings}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default AdminRoutes;
