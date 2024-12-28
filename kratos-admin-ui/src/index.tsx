import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import HeaderComponent from "./components/header/header";
import FooterComponent from "./components/footer/footer";
import "./index.scss";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";
import { MessageBarComponent } from "./components/messages/messagebar";

const IdentitiesSite = React.lazy(() => import("./sites/identities/identies"));
const CreateIdentitySite = React.lazy(
  () => import("./sites/identities/create/create"),
);
const ViewIdentitySite = React.lazy(
  () => import("./sites/identities/view/view"),
);
const EditIdentitySite = React.lazy(
  () => import("./sites/identities/edit/edit"),
);
const OverviewSite = React.lazy(() => import("./sites/overview"));

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <FluentProvider theme={webDarkTheme}>
      <Router>
        <div className="outerDIV">
          <HeaderComponent />
          <div className="contentDIV">
            <MessageBarComponent></MessageBarComponent>
            <Suspense fallback={<div> Loading...</div>}>
              <Routes>
                <Route
                  path="/identities/create"
                  element={<CreateIdentitySite />}
                />
                <Route
                  path="/identities/:id/view"
                  element={<ViewIdentitySite />}
                />
                <Route
                  path="/identities/:id/edit"
                  element={<EditIdentitySite />}
                />
                <Route
                  path="/identities"
                  element={<IdentitiesSite />}
                />
                <Route
                  path="/overview"
                  element={<OverviewSite />}
                />
                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/identities"
                      replace
                    />
                  }
                />
              </Routes>
            </Suspense>
          </div>
          <FooterComponent></FooterComponent>
        </div>
      </Router>
    </FluentProvider>
  </React.StrictMode>,
);
