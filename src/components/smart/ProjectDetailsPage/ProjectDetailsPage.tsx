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
import { useNavigate, useParams } from "react-router";

import type { User } from "@src/@types/User";
import type { Project, Role } from "@src/@types/Project";
import DetailsTemplate from "@src/components/modules/TemplateModule/DetailsTemplate";
import DetailsPageHeader from "@src/components/modules/DetailsModule/DetailsPageHeader";
import DetailsContentHeader from "@src/components/modules/DetailsModule/DetailsContentHeader";
import ProjectDetailsContent from "@src/components/modules/ProjectModule/ProjectDetailsContent";
import ProjectModal from "@src/components/modules/ProjectModule/ProjectModal";
import ProjectMemberModal from "@src/components/modules/ProjectModule/ProjectMemberModal";
import AlertModal from "@src/components/ui/AlertModal";

import projectStore from "@src/stores/ProjectStore";
import userStore from "@src/stores/UserStore";

import { ThemePalette } from "@src/components/Theme";

import projectImage from "./images/project.svg";

const Wrapper = styled.div<any>``;

type Props = {
  id: string;
  onNavigate: (path: string) => void;
};
type State = {
  showProjectModal: boolean;
  showAddMemberModal: boolean;
  showDeleteProjectAlert: boolean;
  addingMember: boolean;
};
@observer
class ProjectDetailsPage extends React.Component<Props, State> {
  state = {
    showProjectModal: false,
    showAddMemberModal: false,
    showDeleteProjectAlert: false,
    addingMember: false,
  };

  componentDidMount() {
    document.title = "Project Details";

    this.loadData();
  }

  componentWillUnmount() {
    projectStore.clearProjectDetails();
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case "signout":
        userStore.logout();
        break;
      default:
    }
  }

  async handleEnableUser(user: User) {
    const enabled = !user.enabled;

    await userStore.update(user.id, { enabled });
    projectStore.getUsers(this.props.id);
  }

  async handleUserRoleChange(user: User, roleId: string, toggled: boolean) {
    const projectId = this.props.id;
    if (toggled) {
      await projectStore.assignUserRole(projectId, user.id, roleId);
    } else {
      await projectStore.removeUserRole(projectId, user.id, roleId);
    }
    projectStore.getRoleAssignments();
  }

  handleRemoveUser(user: User) {
    const roles = projectStore.roleAssignments
      .filter(a => a.scope.project && a.scope.project.id === this.props.id)
      .filter(a => a.user.id === user.id)
      .map(ra => ra.role.id);
    projectStore.removeUser(this.props.id, user.id, roles);
  }

  handleEditProjectClick() {
    this.setState({ showProjectModal: true });
  }

  handleProjectModalClose() {
    this.setState({ showProjectModal: false });
  }

  async handleProjectUpdateClick(project: Project) {
    await projectStore.update(this.props.id, project);
    this.setState({ showProjectModal: false });
  }

  async handleDeleteConfirmation() {
    this.setState({ showDeleteProjectAlert: false });

    await projectStore.delete(this.props.id);
    if (
      userStore.loggedUser &&
      this.props.id === userStore.loggedUser.project.id &&
      projectStore.projects.length > 0
    ) {
      await userStore.switchProject(projectStore.projects[0].id);
      projectStore.getProjects();
      this.props.onNavigate("/projects");
    } else {
      this.props.onNavigate("/projects");
    }
  }

  async handleAddMemberClick() {
    await userStore.getAllUsers();
    this.setState({ showAddMemberModal: true });
  }

  async handleAddMember(user: User, isNew: boolean, roles: Role[]) {
    const assign = async (userId: string) => {
      await Promise.all(
        roles.map(async r => {
          await userStore.assignUserToProjectWithRole(
            userId,
            this.props.id,
            r.id,
          );
        }),
      );
      this.loadData();
      this.setState({ addingMember: false, showAddMemberModal: false });
    };

    this.setState({ addingMember: true });

    if (!isNew) {
      assign(user.id);
      return;
    }

    const addedUser: User | null = await userStore.add(user);
    if (addedUser) {
      assign(addedUser.id);
    }
  }

  handleDeleteProjectClick() {
    this.setState({ showDeleteProjectAlert: true });
  }

  loadData() {
    const projectId = this.props.id;
    projectStore.getProjects();
    projectStore.getProjectDetails(projectId);
    projectStore.getUsers(projectId, true);
    projectStore.getRoleAssignments();
    projectStore.getRoles();
  }

  render() {
    const dropdownActions = [
      {
        label: "Add Member",
        color: ThemePalette.primary,
        action: () => {
          this.handleAddMemberClick();
        },
      },
      {
        label: "Edit Project",
        action: () => {
          this.handleEditProjectClick();
        },
      },
      {
        label: "Delete Project",
        color: ThemePalette.alert,
        action: () => {
          this.handleDeleteProjectClick();
        },
      },
    ];

    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={
            <DetailsPageHeader
              user={userStore.loggedUser}
              onUserItemClick={item => {
                this.handleUserItemClick(item);
              }}
            />
          }
          contentHeaderComponent={
            <DetailsContentHeader
              itemTitle={projectStore.projectDetails?.name}
              itemType="project"
              backLink="/projects"
              dropdownActions={dropdownActions}
              typeImage={projectImage}
            />
          }
          contentComponent={
            <ProjectDetailsContent
              project={projectStore.projectDetails}
              loading={projectStore.loading}
              users={projectStore.users}
              usersLoading={projectStore.usersLoading}
              roleAssignments={projectStore.roleAssignments}
              roles={projectStore.roles}
              loggedUserId={userStore.loggedUser ? userStore.loggedUser.id : ""}
              onEnableUser={user => {
                this.handleEnableUser(user);
              }}
              onRemoveUser={user => {
                this.handleRemoveUser(user);
              }}
              onAddMemberClick={() => {
                this.handleAddMemberClick();
              }}
              onUserRoleChange={(user, roleId, toggled) => {
                this.handleUserRoleChange(user, roleId, toggled);
              }}
              onDeleteClick={() => this.handleDeleteProjectClick()}
            />
          }
        />
        {this.state.showProjectModal ? (
          <ProjectModal
            loading={projectStore.updating}
            project={projectStore.projectDetails}
            onRequestClose={() => {
              this.handleProjectModalClose();
            }}
            onUpdateClick={project => {
              this.handleProjectUpdateClick(project);
            }}
          />
        ) : null}
        {this.state.showAddMemberModal ? (
          <ProjectMemberModal
            loading={this.state.addingMember}
            roles={projectStore.roles}
            projects={projectStore.projects}
            users={userStore.users.filter(
              u => !projectStore.users.find(pu => pu.id === u.id),
            )}
            onAddClick={(user, isNew, roles) => {
              this.handleAddMember(user, isNew, roles);
            }}
            onRequestClose={() => {
              this.setState({ showAddMemberModal: false });
            }}
          />
        ) : null}
        {this.state.showDeleteProjectAlert &&
        projectStore.projects.length > 1 ? (
          <AlertModal
            isOpen
            title="Delete Project?"
            message="Are you sure you want to delete this project?"
            extraMessage="Deleting a Coriolis Project is permanent!"
            onConfirmation={() => {
              this.handleDeleteConfirmation();
            }}
            onRequestClose={() => {
              this.setState({ showDeleteProjectAlert: false });
            }}
          />
        ) : this.state.showDeleteProjectAlert &&
          projectStore.projects.length === 1 ? (
          <AlertModal
            isOpen
            type="error"
            title="Error deleting project"
            message="The project can't be deleted"
            extraMessage="You can't delete the last project since you'll no longer be able to log in"
            onRequestClose={() => {
              this.setState({ showDeleteProjectAlert: false });
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

function ProjectDetailsPageWithNavigate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return <ProjectDetailsPage onNavigate={navigate} id={id!} />;
}

export default ProjectDetailsPageWithNavigate;
