import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';
import { HeaderComponent } from './components/header/header';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { initializeIcons } from '@fluentui/react/lib/Icons';


const IdentitiesSite = React.lazy(() => import('./sites/identities/identies'));
const CreateIdentitySite = React.lazy(() => import("./sites/identities/create/create"));
const ViewIdentitySite = React.lazy(() => import("./sites/identities/view/view"));

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <HeaderComponent />
      <Suspense fallback={< div > Seite wird geladen ...</div>}>
        <Switch>
          <Route path="/identities/create">
            <CreateIdentitySite />
          </Route>
          <Route path="/identities/view/:id">
            <ViewIdentitySite />
          </Route>
          <Route path="/identities">
            <IdentitiesSite />
          </Route>
          <Redirect from='*' to='/identities' />
        </Switch>
      </Suspense>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


// fluent ui
initializeIcons();