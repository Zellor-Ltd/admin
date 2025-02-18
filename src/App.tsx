import { AppProvider } from 'contexts/AppContext';
import { isAuthenticated } from 'helpers/authFunctions';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { getSettings } from 'reducers/settings';
import Routes from './routes/Routes';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated()) dispatch(getSettings());
  }, [dispatch]);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
