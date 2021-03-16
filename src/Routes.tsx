import { Switch, Route } from "react-router-dom";
import VideoFeed from "pages/video-feed/VideoFeed";
import VideoFeedDetail from "pages/video-feed/VideoFeedDetail";
import ProductDetails from "pages/products/ProductsDetails";
import Creators from "pages/creators/Creators";
import CreatorDetail from "pages/creators/CreatorDetail";
import Products from "pages/products/Products";
import TagDetail from "pages/tags/TagDetail";
import Tags from "pages/tags/Tags";

function Routes() {
  return (
    <Switch>
      <Route path="/video-feed/:id" component={VideoFeedDetail} />
      <Route path="/video-feed" component={VideoFeed} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/creators" component={Creators} />
      <Route path="/creator/:id" component={CreatorDetail} />
      <Route path="/products" component={Products} />
      <Route path="/tag/:id" component={TagDetail} />
      <Route path="/tags" component={Tags} />
    </Switch>
  );
}

export default Routes;
