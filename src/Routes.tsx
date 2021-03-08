import { Switch, Route } from "react-router-dom";
import VideoFeed from "pages/video-feed/VideoFeed";
import VideoFeedDetail from "pages/video-feed/VideoFeedDetail";

function Routes() {
  return (
    <Switch>
      <Route path="/video-feed/:id" component={VideoFeedDetail} />
      <Route path="/video-feed" component={VideoFeed} />
    </Switch>
  );
}

export default Routes;
