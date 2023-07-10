import { AppContext } from 'contexts/AppContext';
import { isAuthenticated } from 'helpers/authFunctions';
import { useContext, useEffect } from 'react';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { LastLocationProvider } from 'react-router-last-location';

const AppRoute: React.FC<any> = props => {
  const { refreshContext, lastVisitedPage, setLastVisitedPage } =
    useContext(AppContext);
  const pathname = useHistory().location.pathname;
  const dirName = pathname.split('/')[1];

  useEffect(() => {
    if (dirName !== lastVisitedPage) {
      setLastVisitedPage(dirName);
      refreshContext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirName]);

  const {
    children,
    component: Component,
    layout: Layout,
    path,
    returnComponent,
    ...rest
  } = props;
  const authenticated = isAuthenticated();
  if (!authenticated && path !== '/login' && path !== '/sign-up')
    return <Redirect to="login" />;
  if (returnComponent) return Component;
  return (
    <LastLocationProvider>
      <Route
        {...rest}
        render={routeProps => (
          <Layout>
            <Component {...rest} path={path} {...routeProps} />
          </Layout>
        )}
      ></Route>
    </LastLocationProvider>
  );
};

export default AppRoute;
