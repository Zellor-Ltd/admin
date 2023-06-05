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
import FeaturedFeeds from 'pages/featured-feeds/FeaturedFeeds';
import DirectLinks from 'pages/direct-links/DirectLinks';
import Rebuilds from 'pages/rebuilds/Rebuilds';
import DevelopmentDetail from 'pages/development/development';
import { __isDev__ } from 'helpers/constants';
import PlayLists from 'pages/play-lists/PlayLists';
import PlayListStudio from 'pages/play-list-studio/PlayListStudio';

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
        path="/variant-groups"
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
        path="/featured-feeds"
        component={FeaturedFeeds}
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
        path="/creators"
        component={Creators}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/trends"
        component={Trends}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/categories"
        component={Categories}
        layout={AuthenticatedLayout}
      />
      <AppRoute path="/tags" component={Tags} layout={AuthenticatedLayout} />
      <AppRoute
        path="/brands"
        component={Brands}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/endpoints/endpoint"
        component={EndpointDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/endpoints"
        component={Endpoints}
        layout={AuthenticatedLayout}
      />
      <AppRoute path="/fans" component={Fans} layout={AuthenticatedLayout} />
      <AppRoute
        path="/guests"
        component={Guests}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/users_brand-managers"
        component={BrandManagers}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/roles/role"
        component={RoleDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute path="/roles" component={Roles} layout={AuthenticatedLayout} />
      <AppRoute
        path="/settings"
        component={Settings}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/rebuilds"
        component={Rebuilds}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/access-control"
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
        path="/creator-list"
        component={CreatorsList}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/direct-links"
        component={DirectLinks}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/promotions"
        component={Promotions}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/dd-templates"
        component={DdTemplates}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/promo-displays"
        component={PromoDisplay}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/home-screen"
        component={HomeScreen}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/interests"
        component={Interests}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/fixed-videos"
        component={FixedVideo}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/fan-groups"
        component={FanGroups}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/wallets"
        component={Wallets}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/master-password"
        component={MasterPassword}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/push-group-tag/step2"
        component={PushGroupTagStep2}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/push-group-tag"
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
      <AppRoute
        path="/play-lists"
        component={PlayLists}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/play-list-studio"
        component={PlayListStudio}
        layout={AuthenticatedLayout}
      />
      {__isDev__ ? (
        <AppRoute
          path="/development"
          component={DevelopmentDetail}
          layout={AuthenticatedLayout}
        />
      ) : null}
    </Switch>
  );
}

export default AdminRoutes;
