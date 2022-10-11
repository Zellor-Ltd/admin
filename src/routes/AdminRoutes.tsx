import { Redirect, Switch } from 'react-router-dom';
import Login from 'pages/login/Login';
import VideoFeed from 'pages/video-feed/VideoFeed';
import Creators from 'pages/creators/Creators';
import LiveProducts from 'pages/products/LiveProducts';
import Tags from 'pages/tags/Tags';
import Brands from 'pages/brands/Brands';
import EndpointDetail from 'pages/endpoints/EndpointDetail';
import Endpoints from 'pages/endpoints/Endpoints';
import Fans from 'pages/fans/Fans';
import Guests from 'pages/guests/Guests';
import BrandManagers from 'pages/brand-managers/BrandManagers';
import Settings from 'pages/settings/Settings';
import Roles from 'pages/roles/Roles';
import RoleDetail from 'pages/roles/RoleDetail';
import AppRoute from './AppRoute';
import AuthenticatedLayout from 'layout/AuthenticatedLayout';
import OpenLayout from 'layout/OpenLayout';
import AccessControl from 'pages/access-control/AccessControl';
import Categories from 'pages/categories/Categories';
import Orders from 'pages/orders/Orders';
import Transactions from 'pages/transactions/Transactions';
import PreviewProducts from 'pages/products/PreviewProducts';
import Promotions from 'pages/promotions/Promotions';
import DdTemplates from 'pages/dd-templates/DdTemplates';
import PromoDisplay from 'pages/promo-display/PromoDisplay';
import Dashboard from 'pages/dashboard/Dashboard';
import Interests from 'pages/interests/Interests';
import FanGroups from 'pages/fan-groups/FanGroups';
import Wallets from 'pages/wallets/Wallets';
import MasterPassword from 'pages/master-password/MasterPassword';
import PushGroupTag from 'pages/push-group-tag/PushGroupTag';
import PushGroupTagStep2 from 'pages/push-group-tag/Step2';
import ProductBrands from 'pages/product-brands/ProductBrands';
import HomeScreen from 'pages/home-screen/HomeScreen';
import RegsPerDay from 'pages/reports/RegsPerDay';
import PreRegisteredUsers from 'pages/reports/PreRegisteredUsers';
import ProductsPerDay from 'pages/reports/ProductsPerDay';
import FanActivities from 'pages/reports/FanActivities';
import CreatorsList from 'pages/creators-list-page/CreatorsList';
import Trends from 'pages/trends/Trends';
import FeedTemplates from 'pages/video-feed/FeedTemplates';
import FanVideos from 'pages/fan-videos/FanVideos';
import Payments from 'pages/payments/Payments';
import PaymentHistory from 'pages/payments/PaymentHistory';
import VariantGroups from 'pages/variants/VariantGroups';
import ProductTemplates from 'pages/product-templates/ProductTemplates';
import FixedVideo from 'pages/fixed-videos/FixedVideo';

function AdminRoutes() {
  return (
    <Switch>
      <AppRoute
        exact
        path="/"
        returnComponent
        component={<Redirect to="/dashboard" />}
      />
      <AppRoute
        path="/dashboard"
        component={Dashboard}
        layout={AuthenticatedLayout}
      />
      <AppRoute path="/login" component={Login} layout={OpenLayout} />
      <AppRoute
        path="/variant_groups"
        component={VariantGroups}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/payments"
        component={Payments}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/payment-history"
        component={PaymentHistory}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/feed-templates"
        component={FeedTemplates}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/fan-videos"
        component={FanVideos}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/feed"
        component={VideoFeed}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/product-brands"
        component={ProductBrands}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/products"
        component={LiveProducts}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/product-templates"
        component={ProductTemplates}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/users_creators"
        component={Creators}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_trends"
        component={Trends}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_categories"
        component={Categories}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_tags"
        component={Tags}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/brands"
        component={Brands}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_endpoints/endpoint"
        component={EndpointDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_endpoints"
        component={Endpoints}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/users_fans"
        component={Fans}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/users_guests"
        component={Guests}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/users_brand-managers"
        component={BrandManagers}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_roles/role"
        component={RoleDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_roles"
        component={Roles}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_settings"
        component={Settings}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_access-control"
        component={AccessControl}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/orders"
        component={Orders}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/transactions"
        component={Transactions}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/preview-products"
        component={PreviewProducts}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/marketing_creators-list"
        component={CreatorsList}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/marketing_promotions"
        component={Promotions}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/dd-templates"
        component={DdTemplates}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/marketing_promo-displays"
        component={PromoDisplay}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/marketing_home-screen"
        component={HomeScreen}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_interests"
        component={Interests}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_fixed-videos"
        component={FixedVideo}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_fan-groups"
        component={FanGroups}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/wallets"
        component={Wallets}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_master-password"
        component={MasterPassword}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_push-group-tag/step2"
        component={PushGroupTagStep2}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_push-group-tag"
        component={PushGroupTag}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/fan-activities"
        component={FanActivities}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/pre-registered"
        component={PreRegisteredUsers}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/products-per-day"
        component={ProductsPerDay}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/regs-per-day"
        component={RegsPerDay}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default AdminRoutes;
