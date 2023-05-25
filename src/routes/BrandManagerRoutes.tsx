import AppRoute from './AppRoute';
import AuthenticatedLayout from 'layout/AuthenticatedLayout';
import OpenLayout from 'layout/OpenLayout';
import Login from 'pages/login/Login';
import { Redirect, Switch } from 'react-router-dom';
import VideoFeed from 'pages/video-feed/BrandManager/VideoFeed';
import VideoFeedDetail from 'pages/video-feed/BrandManager/VideoFeedDetail';
import BrandDashboard from 'pages/dashboard/BrandDashboard';
import LinkOrganizer from 'pages/link-organizer/LinkOrganizer';
import LiveProducts from 'pages/products/LiveProducts';

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
        path="/products"
        component={LiveProducts}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/brand-dashboard"
        component={BrandDashboard}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/link-organizer"
        component={LinkOrganizer}
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
