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

import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { useNavigate } from "react-router";

import MainTemplate from "@src/components/modules/TemplateModule/MainTemplate";
import Navigation from "@src/components/modules/NavigationModule/Navigation";
import FilterList from "@src/components/ui/Lists/FilterList";
import PageHeader from "@src/components/smart/PageHeader";
import ProjectListItem from "@src/components/modules/ProjectModule/ProjectListItem";

import type { Project, RoleAssignment } from "@src/@types/Project";

import projectStore from "@src/stores/ProjectStore";
import userStore from "@src/stores/UserStore";
import configLoader from "@src/utils/Config";

const Wrapper = styled.div<any>``;

type State = {
  modalIsOpen: boolean;
};

type Props = {
  onNavigate: (path: string) => void;
};

@observer
class ProjectsPage extends React.Component<Props, State> {
  state = {
    modalIsOpen: false,
  };

  pollTimeout = 0;

  stopPolling = false;

  componentDidMount() {
    document.title = "Projects";

    this.stopPolling = false;
    this.pollData(true);
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout);
    this.stopPolling = true;
  }

  getMembers(projectId: string): number {
    return projectStore.roleAssignments
      .filter(a => a.scope.project?.id === projectId)
      .reduce((uniqueRoles, role) => {
        if (!uniqueRoles.find(p => p.user.id === role.user.id)) {
          uniqueRoles.push(role);
        }
        return uniqueRoles;
      }, [] as RoleAssignment[]).length;
  }

  isCurrentProject(projectId: string): boolean {
    const project =
      userStore.loggedUser && userStore.loggedUser.project
        ? userStore.loggedUser.project
        : null;
    return project ? project.id === projectId : false;
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true });
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData();
    });
  }

  handleReloadButtonClick() {
    projectStore.getProjects({ showLoading: true });
    projectStore.getRoleAssignments();
  }

  async handleSwitchProjectClick(projectId: string) {
    await userStore.switchProject(projectId);
    projectStore.getProjects();
  }

  async pollData(showLoading?: boolean) {
    if (this.state.modalIsOpen || this.stopPolling) {
      return;
    }

    await Promise.all([
      projectStore.getProjects({ showLoading, skipLog: true }),
      projectStore.getRoleAssignments({ skipLog: true }),
    ]);
    this.pollTimeout = window.setTimeout(() => {
      this.pollData();
    }, configLoader.config.requestPollTimeout);
  }

  itemFilterFunction(
    item: Project,
    _?: string | null,
    filterText?: string,
  ): boolean {
    const usabledFilterText = (filterText && filterText.toLowerCase()) || "";
    return (
      item.name.toLowerCase().indexOf(usabledFilterText) > -1 ||
      (item.description
        ? item.description.toLowerCase().indexOf(usabledFilterText) > -1
        : false)
    );
  }

  render() {
    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="projects" />}
          listNoMargin
          listComponent={
            <FilterList
              filterItems={[{ label: "All", value: "all" }]}
              selectionLabel="user"
              loading={projectStore.loading}
              items={projectStore.projects}
              onItemClick={(user: Project) => {
                this.props.onNavigate(`/projects/${user.id}`);
              }}
              onReloadButtonClick={() => {
                this.handleReloadButtonClick();
              }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={component => (
                <ProjectListItem
                  {...component}
                  getMembers={projectId => this.getMembers(projectId)}
                  isCurrentProject={projectId =>
                    this.isCurrentProject(projectId)
                  }
                  onSwitchProjectClick={projectId =>
                    this.handleSwitchProjectClick(projectId)
                  }
                />
              )}
            />
          }
          headerComponent={
            <PageHeader
              title="Projects"
              onModalOpen={() => {
                this.handleModalOpen();
              }}
              onModalClose={() => {
                this.handleModalClose();
              }}
            />
          }
        />
      </Wrapper>
    );
  }
}

function ProjectsPageWithNavigate() {
  const navigate = useNavigate();

  return <ProjectsPage onNavigate={navigate} />;
}

export default ProjectsPageWithNavigate;
