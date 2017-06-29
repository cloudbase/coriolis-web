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


import React from 'react';
import Router from 'react-routing/src/Router';
import fetch from './core/fetch';
import App from './components/App';
import MigrationWizard from './components/MigrationWizard';
import WithSidebar from './components/WithSidebar';
import MigrationList from './components/MigrationList';
import MigrationView from './components/MigrationView';
import MigrationDetail from './components/MigrationDetail';
import MigrationTasks from './components/MigrationTasks';
import MigrationSchedule from './components/MigrationSchedule';
import CloudConnection from './components/CloudConnection';
import CloudConnectionsView from './components/CloudConnectionsView';
import CloudConnectionDetail from './components/CloudConnectionDetail';
import CloudConnectionAuth from './components/CloudConnectionAuth';
import ConnectionsList from './components/ConnectionsList';
import Project from './components/Project';
import ProjectDetail from './components/ProjectDetail';
import ProjectList from './components/ProjectList';
import ReplicaExecutions from './components/ReplicaExecutions';
import UserView from './components/UserView';
import UserOverview from './components/UserOverview';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import NotFoundPage from './components/NotFoundPage';
import ErrorPage from './components/ErrorPage';

const router = new Router(on => {
  on('*', async (state, next) => {
    const component = await next();
    return component && <App context={state.context}>{component}</App>;
  });

  on('/', async () => <LoginPage />)

  on('/login', async () => <LoginPage />)

  on('/migrations', async () => <WithSidebar route="/migrations"><MigrationList type="migrations"/></WithSidebar>)

  on('/migrations/new', async () => <MigrationWizard />)

  on('/migration/:migrationId/', async (params) =>
    <MigrationView migrationId={params.params.migrationId} type="detail"><MigrationDetail /></MigrationView>
  )

  on('/migration/tasks/:migrationId/', async (params) =>
    <MigrationView migrationId={params.params.migrationId} type="tasks"><MigrationTasks /></MigrationView>
  )

  on('/migration/schedule/:migrationId/', async (params) =>
    <MigrationView migrationId={params.params.migrationId} type="schedule"><MigrationSchedule /></MigrationView>
  )
  // TODO: IMPORTANT Separate views migration/replica
  on('/replicas', async () => <WithSidebar route="/replicas"><MigrationList type="replicas"/></WithSidebar>)

  on('/replicas/new', async () => <MigrationWizard />)

  on('/replica/:migrationId/', async (params) =>
    <MigrationView migrationId={params.params.migrationId} type="detail"><MigrationDetail /></MigrationView>
  )

  on('/replica/executions/:migrationId/', async (params) =>
    <MigrationView migrationId={params.params.migrationId} type="tasks"><ReplicaExecutions /></MigrationView>
  )

  on('/replica/schedule/:migrationId/', async (params) =>
    <MigrationView migrationId={params.params.migrationId} type="schedule"><MigrationSchedule /></MigrationView>
  )

  on('/cloud-endpoints', async () =>
    <WithSidebar route="/cloud-endpoints"><ConnectionsList /></WithSidebar>
  )

  on('/cloud-endpoints/:connectionId/', async (params) =>
    <CloudConnection connectionId={params.params.connectionId}>
      <CloudConnectionsView type="detail">
        <CloudConnectionDetail />
      </CloudConnectionsView>
    </CloudConnection>
  )

  on('/cloud-endpoints/auth/:connectionId/', async (params) =>
    <CloudConnection connectionId={params.params.connectionId}>
      <CloudConnectionsView type="auth">
        <CloudConnectionAuth />
      </CloudConnectionsView>
    </CloudConnection>
  )

  on('/projects', async () =>
    <WithSidebar route="/projects"><ProjectList /></WithSidebar>
  )

  on('/project/details/:projectId/', async (params) =>
    <Project projectId={params.params.projectId}>
      <ProjectDetail />
    </Project>
  )

  on('/user/profile/', async () => <UserView type="profile"><UserOverview /></UserView>)

  on('/user/billing/', async () =>
    <UserView type="billing"><div className="no-result">Nothing here yet</div></UserView>
  )

  on('/contact', async () => <ContactPage />);

  on('/login', async () => <LoginPage />);

  on('/register', async () => <RegisterPage />);

  on('error', (state, error) => state.statusCode === 404 ?
    <App context={state.context} error={error}><NotFoundPage /></App> :
    <App context={state.context} error={error}><ErrorPage /></App>
  );
});

export default router;
