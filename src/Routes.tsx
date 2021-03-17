import { Switch, Route } from "react-router-dom";
import VideoFeed from "pages/video-feed/VideoFeed";
import VideoFeedDetail from "pages/video-feed/VideoFeedDetail";
import ProductDetails from "pages/products/ProductsDetails";
import Creators from "pages/creators/Creators";
import CreatorDetail from "pages/creators/CreatorDetail";
import Products from "pages/products/Products";
import TagDetail from "pages/tags/TagDetail";
import Tags from "pages/tags/Tags";
import BrandDetail from "pages/brands/BrandDetail";
import Brands from "pages/brands/Brands";

function Routes() {
  return (
    <Switch>
      <Route path="/video-feed" component={VideoFeedDetail} />
      <Route path="/feed" component={VideoFeed} />
      <Route path="/product" component={ProductDetails} />
      <Route path="/products" component={Products} />
      <Route path="/creator" component={CreatorDetail} />
      <Route path="/creators" component={Creators} />
      <Route path="/tag" component={TagDetail} />
      <Route path="/tags" component={Tags} />
      <Route path="/brand" component={BrandDetail} />
      <Route path="/brands" component={Brands} />
    </Switch>
  );
}

export default Routes;
