import { isAuthenticated } from "helpers/authFunctions";
import { Redirect, Route } from "react-router";

const AuthRoute: React.FC<any> = (props) => {
  const {
    children,
    component: Component,
    layout: Layout,
    path,
    ...rest
  } = props;
  const authenticated = isAuthenticated();
  if (!authenticated && path !== "/login") return <Redirect to="login" />;
  return (
    <Route
      {...rest}
      render={(routeProps) => (
        <Layout>
          <Component {...rest} path={path} {...routeProps} />
        </Layout>
      )}></Route>
  );
};

export default AuthRoute;
