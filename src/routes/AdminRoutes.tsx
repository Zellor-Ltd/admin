import { Switch, Redirect } from "react-router-dom";
import Login from "pages/login/Login";
import VideoFeed from "pages/video-feed/VideoFeed";
// import VideoFeedDetail from "pages/video-feed/VideoFeedDetail";
import VideoFeedDetail from "pages/video-feed/VideoFeedDetailV2";
import ProductDetails from "pages/products/ProductsDetails";
import Creators from "pages/creators/Creators";
import CreatorDetail from "pages/creators/CreatorDetail";
import Products from "pages/products/Products";
import TagDetail from "pages/tags/TagDetail";
import Tags from "pages/tags/Tags";
import Brands from "pages/brands/Brands";
import BrandDetail from "pages/brands/BrandDetail";
import EndpointDetail from "pages/endpoints/EndpointDetail";
import Endpoints from "pages/endpoints/Endpoints";
import FanDetail from "pages/fans/FanDetail";
import Fans from "pages/fans/Fans";
import BrandManagers from "pages/brand-managers/BrandManagers";
import Settings from "pages/settings/Settings";
import Roles from "pages/roles/Roles";
import RoleDetail from "pages/roles/RoleDetail";
import AppRoute from "./AppRoute";
import AuthenticatedLayout from "layout/AuthenticatedLayout";
import OpenLayout from "layout/OpenLayout";
// import Interfaces from "pages/interfaces/Interfaces";
// import InterfaceDetail from "pages/interfaces/InterfaceDetail";
import AccessControl from "pages/access-control/AccessControl";
// import Preview from "pages/preview/Preview";
import Categories from "pages/categories/Categories";
import CategoryDetail from "pages/categories/CategoryDetail";
import Orders from "pages/orders/Orders";
import OrderDetail from "pages/orders/OrderDetail";
import Transactions from "pages/transactions/Transactions";
import FeedMixer from "pages/feed-mixer/FeedMixer";
import PreviewList from "pages/products/PreviewList";
import Promotions from "pages/promotions/Promotions";
import PromotionDetail from "pages/promotions/PromotionDetail";
import DdTemplates from "pages/dd-templates/DdTemplates";
import DdTemplateDetail from "pages/dd-templates/DdTemplateDetail";
import PromoDisplay from "pages/promo-display/PromoDisplay";
import PromoDisplayDetail from "pages/promo-display/PromoDisplayDetail";
import Dashboard from "pages/dashboard/Dashboard";
import Interests from "pages/interests/Interests";
import FanGroups from "pages/fan-groups/FanGroups";
import FanGroupDetail from "pages/fan-groups/FanGroupDetail";
import Wallets from "pages/wallets/Wallets";
import WalletDetail from "pages/wallets/WalletDetail";
import MasterPassword from "pages/master-password/MasterPassword";
import PushGroupTag from "pages/push-group-tag/PushGroupTag";
import PushGroupTagStep2 from "pages/push-group-tag/Step2";
import ProductBrands from "pages/product-brands/ProductBrands";
import ProductBrandDetail from "pages/product-brands/ProductBrandDetail";

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
        path="/feed/video-feed"
        component={VideoFeedDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/feed"
        component={VideoFeed}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/product-brands/product-brand"
        component={ProductBrandDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/product-brands"
        component={ProductBrands}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/preview-products/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/products/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/products"
        component={Products}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/users_creators/creator"
        component={CreatorDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/users_creators"
        component={Creators}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_categories/category"
        component={CategoryDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_categories"
        component={Categories}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_tags/tag"
        component={TagDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_tags"
        component={Tags}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/brands/brand"
        component={BrandDetail}
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
        path="/users_fans/fan"
        component={FanDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/users_fans"
        component={Fans}
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
        path="/orders/order"
        component={OrderDetail}
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
        path="/feed-mixer"
        component={FeedMixer}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/preview-products"
        component={PreviewList}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/marketing_promotions/promotion"
        component={PromotionDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/marketing_promotions"
        component={Promotions}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_dd-templates/dd-template"
        component={DdTemplateDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_dd-templates"
        component={DdTemplates}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/marketing_promo-displays/promo-display"
        component={PromoDisplayDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/marketing_promo-displays"
        component={PromoDisplay}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_interests"
        component={Interests}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_fan-groups/fan-group"
        component={FanGroupDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/settings_fan-groups"
        component={FanGroups}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/wallets/wallet"
        component={WalletDetail}
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
    </Switch>
  );
}

export default AdminRoutes;
