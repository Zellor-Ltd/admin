import { Switch, Redirect } from "react-router-dom";
import Login from "pages/login/Login";
import VideoFeed from "pages/video-feed/VideoFeed";
import VideoFeedDetail from "pages/video-feed/VideoFeedDetail";
import ProductDetails from "pages/products/ProductsDetails";
import Creators from "pages/creators/Creators";
import CreatorDetail from "pages/creators/CreatorDetail";
import Products from "pages/products/Products";
import TagDetail from "pages/tags/TagDetail";
import Tags from "pages/tags/Tags";
import Brands from "pages/brands/Brands";
import BrandDetail from "pages/brands/BrandDetail";
import PromoCodes from "pages/promo-codes/PromoCodes";
import PromoCodesDetail from "pages/promo-codes/PromoCodesDetail";
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
import StagingList from "pages/products/StagingList";
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
        path="/video-feed"
        component={VideoFeedDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/feed"
        component={VideoFeed}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/products"
        component={Products}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/creator"
        component={CreatorDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/creators"
        component={Creators}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/category"
        component={CategoryDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/categories"
        component={Categories}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/tag"
        component={TagDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute path="/tags" component={Tags} layout={AuthenticatedLayout} />
      <AppRoute
        path="/brand"
        component={BrandDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/brands"
        component={Brands}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/promo-code"
        component={PromoCodesDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/promo-codes"
        component={PromoCodes}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/endpoint"
        component={EndpointDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/endpoints"
        component={Endpoints}
        layout={AuthenticatedLayout}
      />
      {/* <AuthRoute
        path="/interface"
        component={InterfaceDetail}
        layout={AuthenticatedLayout}
      /> */}
      {/* <AuthRoute
        path="/interfaces"
        component={Interfaces}
        layout={AuthenticatedLayout}
      /> */}
      <AppRoute
        path="/fan"
        component={FanDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute path="/fans" component={Fans} layout={AuthenticatedLayout} />
      <AppRoute
        path="/brand-managers"
        component={BrandManagers}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/role"
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
        path="/access-control"
        component={AccessControl}
        layout={AuthenticatedLayout}
      />
      {/* <AuthRoute
        path="/preview"
        component={Preview}
        layout={AuthenticatedLayout}
      /> */}
      <AppRoute
        path="/order"
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
        path="/staging-products"
        component={StagingList}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/promotion"
        component={PromotionDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/promotions"
        component={Promotions}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/dd-template"
        component={DdTemplateDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/dd-templates"
        component={DdTemplates}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/promo-display"
        component={PromoDisplayDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/promo-displays"
        component={PromoDisplay}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/interests"
        component={Interests}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/fans-group"
        component={FanGroupDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/fan-groups"
        component={FanGroups}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/wallet"
        component={WalletDetail}
        layout={AuthenticatedLayout}
      />
      <AppRoute
        path="/wallets"
        component={Wallets}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default AdminRoutes;
