/*
Copyright (C) 2017  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { hot } from "react-hot-loader/root";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { observe } from "mobx";

import Fonts from "@src/components/ui/Fonts";
import NotificationsModule from "@src/components/modules/NotificationsModule";
import LoginPage from "@src/components/smart/LoginPage";
import TransfersPage from "@src/components/smart/TransfersPage";
import MessagePage from "@src/components/smart/MessagePage";
import TransferDetailsPage from "@src/components/smart/TransferDetailsPage";
import DeploymentsPage from "@src/components/smart/DeploymentsPage";
import DeploymentDetailsPage from "@src/components/smart/DeploymentDetailsPage";
import MetalHubServersPage from "@src/components/smart/MetalHubServersPage";
import EndpointsPage from "@src/components/smart/EndpointsPage";
import EndpointDetailsPage from "@src/components/smart/EndpointDetailsPage";
import UsersPage from "@src/components/smart/UsersPage";
import UserDetailsPage from "@src/components/smart/UserDetailsPage";
import ProjectsPage from "@src/components/smart/ProjectsPage";
import ProjectDetailsPage from "@src/components/smart/ProjectDetailsPage";
import DashboardPage from "@src/components/smart/DashboardPage";
import LogsPage from "@src/components/smart/LogsPage";
import LogStreamPage from "@src/components/smart/LogStreamPage";
import WizardPage from "@src/components/smart/WizardPage";

import Tooltip from "@src/components/ui/Tooltip";

import MinionPoolsPage from "@src/components/smart/MinionPoolsPage";
import MinionPoolDetailsPage from "@src/components/smart/MinionPoolDetailsPage";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import configLoader from "@src/utils/Config";
import { navigationMenu } from "@src/constants";
import userStore from "@src/stores/UserStore";
import SetupPage from "@src/components/smart/SetupPage";
import MetalHubServerDetailsPage from "@src/components/smart/MetalHubServerDetailsPage";

const GlobalStyle = createGlobalStyle`
 ${Fonts}
  html, body, main {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  body {
    margin: 0;
    color: ${ThemePalette.black};
    font-family: Rubik;
    font-size: 14px;
    font-weight: ${ThemeProps.fontWeights.regular};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const Wrapper = styled.div`
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  > div:first-child {
    height: 100%;
  }
`;

type State = {
  isConfigReady: boolean;
};

class App extends React.Component<Record<string, unknown>, State> {
  state = {
    isConfigReady: false,
  };

  async componentDidMount() {
    observe(userStore, "loggedUser", () => {
      this.setState({});
    });
    await configLoader.load();
    if (configLoader.isFirstLaunch && window.location.pathname !== "/login") {
      if (window.location.pathname !== "/") {
        window.location.href = "/";
        return;
      }
    } else {
      userStore.tokenLogin();
    }
    this.setState({ isConfigReady: true });
  }

  render() {
    if (!this.state.isConfigReady) {
      return null;
    }

    const renderMessagePage = (options: {
      path: string;
      exact?: boolean;
      title: string;
      subtitle: string;
      showAuthAnimation?: boolean;
      showDenied?: boolean;
    }) => (
      <Route
        path={options.path}
        // @ts-ignore
        exact={options.exact}
        render={() => (
          <MessagePage
            title={options.title}
            subtitle={options.subtitle}
            showAuthAnimation={options.showAuthAnimation}
            showDenied={options.showDenied}
          />
        )}
      />
    );

    const renderRoute = (
      path: string,
      component: React.ReactNode,
      exact?: boolean
    ) => {
      if (!userStore.loggedUser) {
        return renderMessagePage({
          path,
          exact,
          title: "Authenticating...",
          subtitle: "Please wait while authenticating user.",
          showAuthAnimation: true,
        });
      }
      // @ts-ignore
      return <Route path={path} component={component} exact={exact} />;
    };

    const renderOptionalRoute = (opts: {
      name: string;
      component: React.ReactNode;
      path?: string;
      exact?: boolean;
    }) => {
      const { name, component, path, exact } = opts;
      if (configLoader.config.disabledPages.find(p => p === name)) {
        return null;
      }
      const actualPath = `${path || `/${name}`}`;
      const requiresAdmin = Boolean(
        navigationMenu.find(n => n.value === name && n.requiresAdmin)
      );
      if (!requiresAdmin) {
        return renderRoute(actualPath, component, exact);
      }
      if (!userStore.loggedUser || userStore.loggedUser.isAdmin == null) {
        return renderMessagePage({
          path: actualPath,
          exact,
          title: "Checking permissions...",
          subtitle: "Please wait while checking user's permissions.",
          showAuthAnimation: true,
        });
      }
      if (userStore.loggedUser?.isAdmin === false) {
        return renderMessagePage({
          path: actualPath,
          exact,
          title: "User doesn't have permissions to view this page",
          subtitle:
            "Please login in with an administrator acount to view this page.",
          showDenied: true,
        });
      }
      if (userStore.loggedUser?.isAdmin) {
        // @ts-ignore
        return <Route path={actualPath} exact={exact} component={component} />;
      }
      return null;
    };

    return (
      <Wrapper>
        <GlobalStyle />
        <Router>
          <Switch>
            {configLoader.isFirstLaunch ? (
              // @ts-ignore
              <Route path="/" component={SetupPage} exact />
            ) : (
              // @ts-ignore
              renderRoute("/", DashboardPage, true)
            )}
            {
              // @ts-ignore
              <Route path="/login" component={LoginPage} />
            }
            {renderRoute("/dashboard", DashboardPage)}
            {renderRoute("/transfers", TransfersPage, true)}
            {renderRoute("/transfers/:id", TransferDetailsPage, true)}
            {renderRoute("/transfers/:id/:page", TransferDetailsPage)}
            {renderRoute("/deployments", DeploymentsPage, true)}
            {renderRoute("/deployments/:id", DeploymentDetailsPage, true)}
            {renderRoute("/deployments/:id/:page", DeploymentDetailsPage)}
            {renderRoute("/endpoints", EndpointsPage, true)}
            {renderRoute("/endpoints/:id", EndpointDetailsPage)}
            {renderRoute("/minion-pools", MinionPoolsPage, true)}
            {renderRoute("/minion-pools/:id", MinionPoolDetailsPage, true)}
            {renderRoute("/minion-pools/:id/:page", MinionPoolDetailsPage)}
            {renderRoute("/bare-metal-servers", MetalHubServersPage, true)}
            {renderRoute("/bare-metal-servers/:id", MetalHubServerDetailsPage)}
            {renderRoute("/wizard/:type", WizardPage)}
            {renderOptionalRoute({
              name: "users",
              component: UsersPage,
              exact: true,
            })}
            {renderOptionalRoute({
              name: "users",
              component: UserDetailsPage,
              path: "/users/:id",
            })}
            {renderOptionalRoute({
              name: "projects",
              component: ProjectsPage,
              exact: true,
            })}
            {renderOptionalRoute({
              name: "projects",
              component: ProjectDetailsPage,
              path: "/projects/:id",
            })}
            {renderOptionalRoute({ name: "logging", component: LogsPage })}
            {renderRoute("/streamlog", LogStreamPage)}
            {
              // @ts-ignore
              <Route component={MessagePage} />
            }
          </Switch>
        </Router>
        <NotificationsModule />
        <Tooltip />
      </Wrapper>
    );
  }
}

export default hot(App);
