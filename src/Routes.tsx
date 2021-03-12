import { Switch, Route } from "react-router-dom";
import VideoFeed from "pages/video-feed/VideoFeed";
import VideoFeedDetail from "pages/video-feed/VideoFeedDetail";
import ProductDetails from "pages/products/ProductsDetails";
import ProductsList from "pages/products/ProductsList";
import Creators from "pages/creators/Creators";
import CreatorDetail from "pages/creators/CreatorDetail";

function Routes() {
  return (
    <Switch>
      <Route path="/video-feed/:id" component={VideoFeedDetail} />
      <Route path="/video-feed" component={VideoFeed} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/products" component={ProductsList} />
      <Route path="/creators" component={Creators} />
      <Route path="/creator/:id" component={CreatorDetail} />
    </Switch>
  );
}

export default Routes;
