import { Switch } from "react-router-dom";
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
import Settings from "pages/settings/Settings";
import Roles from "pages/roles/Roles";
import RoleDetail from "pages/roles/RoleDetail";
import AuthRoute from "components/auth-route/AuthRoute";
import AuthenticatedLayout from "layout/AuthenticatedLayout";
import OpenLayout from "layout/OpenLayout";
// import Interfaces from "pages/interfaces/Interfaces";
// import InterfaceDetail from "pages/interfaces/InterfaceDetail";
import AccessControl from "pages/access-control/AccessControl";
import Preview from "pages/preview/Preview";
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
import Dashboard from "pages/dashboard/Dashboard";
import { Redirect } from "react-router";

function AdminRoutes() {
  return (
    <Switch>
      <AuthRoute
        exact
        path="/"
        returnComponent
        component={<Redirect to="/dashboard" />}
      />
      <AuthRoute
        path="/dashboard"
        component={Dashboard}
        layout={AuthenticatedLayout}
      />
      <AuthRoute path="/login" component={Login} layout={OpenLayout} />
      <AuthRoute
        path="/video-feed"
        component={VideoFeedDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/feed"
        component={VideoFeed}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/product/:productMode"
        component={ProductDetails}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/products"
        component={Products}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/creator"
        component={CreatorDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/creators"
        component={Creators}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/category"
        component={CategoryDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/categories"
        component={Categories}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/tag"
        component={TagDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute path="/tags" component={Tags} layout={AuthenticatedLayout} />
      <AuthRoute
        path="/brand"
        component={BrandDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/brands"
        component={Brands}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/promo-code"
        component={PromoCodesDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/promo-codes"
        component={PromoCodes}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/endpoint"
        component={EndpointDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
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
      <AuthRoute
        path="/fan"
        component={FanDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute path="/fans" component={Fans} layout={AuthenticatedLayout} />
      <AuthRoute
        path="/role"
        component={RoleDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute path="/roles" component={Roles} layout={AuthenticatedLayout} />
      <AuthRoute
        path="/settings"
        component={Settings}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/access-control"
        component={AccessControl}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/preview"
        component={Preview}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/order"
        component={OrderDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/orders"
        component={Orders}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/transactions"
        component={Transactions}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/feed-mixer"
        component={FeedMixer}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/staging-products"
        component={StagingList}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/promotion"
        component={PromotionDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/promotions"
        component={Promotions}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/dd-template"
        component={DdTemplateDetail}
        layout={AuthenticatedLayout}
      />
      <AuthRoute
        path="/dd-templates"
        component={DdTemplates}
        layout={AuthenticatedLayout}
      />
    </Switch>
  );
}

export default AdminRoutes;