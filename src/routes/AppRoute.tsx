import { AppContext } from "contexts/AppContext";
import { isAuthenticated } from "helpers/authFunctions";
import { useContext } from "react";
import { Redirect, Route, useHistory } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";

const AppRoute: React.FC<any> = (props) => {
  const { refreshContext, lastVisitedPage, setLastVisitedPage } =
    useContext(AppContext);
  const pathname = useHistory().location.pathname;
  const dirName = pathname.split("/")[1];
  if (dirName !== lastVisitedPage) {
    refreshContext();
  }

  setLastVisitedPage(dirName);

  const {
    children,
    component: Component,
    layout: Layout,
    path,
    returnComponent,
    ...rest
  } = props;
  const authenticated = isAuthenticated();
  if (!authenticated && path !== "/login") return <Redirect to="login" />;
  if (returnComponent) return Component;
  return (
    <LastLocationProvider>
      <Route
        {...rest}
        render={(routeProps) => (
          <Layout>
            <Component {...rest} path={path} {...routeProps} />
          </Layout>
        )}
      ></Route>
    </LastLocationProvider>
  );
};

export default AppRoute;
