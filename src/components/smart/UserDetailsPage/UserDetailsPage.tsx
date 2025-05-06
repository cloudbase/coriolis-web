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
import DetailsTemplate from "@src/components/modules/TemplateModule/DetailsTemplate";
import DetailsPageHeader from "@src/components/modules/DetailsModule/DetailsPageHeader";
import DetailsContentHeader from "@src/components/modules/DetailsModule/DetailsContentHeader";
import UserDetailsContent from "@src/components/modules/UserModule/UserDetailsContent";
import UserModal from "@src/components/modules/UserModule/UserModal";
import AlertModal from "@src/components/ui/AlertModal";

import userStore from "@src/stores/UserStore";
import projectStore from "@src/stores/ProjectStore";

import { ThemePalette } from "@src/components/Theme";

import userImage from "./images/user.svg";

const Wrapper = styled.div<any>``;

type Props = {
  id: string;
  onNavigate: (path: string) => void;
};
type State = {
  showUserModal: boolean;
  editPassword: boolean;
  showDeleteAlert: boolean;
};
@observer
class UserDetailsPage extends React.Component<Props, State> {
  state = {
    showUserModal: false,
    editPassword: false,
    showDeleteAlert: false,
  };

  componentDidMount() {
    document.title = "User Details";

    this.loadData();
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (newProps.id !== this.props.id) {
      this.loadData(newProps.id);
    }
  }

  componentWillUnmount() {
    userStore.clearUserDetails();
    userStore.clearProjects();
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case "signout":
        userStore.logout();
        break;
      default:
    }
  }

  handleEditClick() {
    this.setState({ showUserModal: true });
  }

  async handleDeleteConfirmation() {
    await userStore.delete(this.props.id);
    this.props.onNavigate("/users");
  }

  handleUserEditModalClose() {
    this.setState({ showUserModal: false, editPassword: false });
  }

  async handleUserUpdateClick(user: User) {
    await userStore.update(this.props.id, user);
    userStore.getProjects(this.props.id);
    this.setState({ showUserModal: false, editPassword: false });
  }

  handleUpdatePasswordClick() {
    this.setState({ showUserModal: true, editPassword: true });
  }

  handleDeleteClick() {
    this.setState({ showDeleteAlert: true });
  }

  loadData(id?: string) {
    projectStore.getProjects();
    userStore.getProjects(id || this.props.id);
    userStore.getUserInfo(id || this.props.id);
  }

  render() {
    const dropdownActions = [
      {
        label: "Change password",
        color: ThemePalette.primary,
        action: () => {
          this.handleUpdatePasswordClick();
        },
      },
      {
        label: "Edit user",
        action: () => {
          this.handleEditClick();
        },
      },
      {
        label: "Delete user",
        color: ThemePalette.alert,
        action: () => {
          this.handleDeleteClick();
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
              itemTitle={userStore.userDetails?.name}
              itemType="user"
              backLink="/users"
              typeImage={userImage}
              dropdownActions={dropdownActions}
            />
          }
          contentComponent={
            <UserDetailsContent
              onDeleteClick={() => {
                this.handleDeleteClick();
              }}
              user={userStore.userDetails}
              isLoggedUser={
                userStore.loggedUser && userStore.userDetails
                  ? userStore.loggedUser.id === userStore.userDetails.id
                  : false
              }
              loading={userStore.userDetailsLoading}
              userProjects={userStore.projects}
              projects={projectStore.projects}
              onUpdatePasswordClick={() => {
                this.handleUpdatePasswordClick();
              }}
            />
          }
        />
        {this.state.showUserModal && userStore.userDetails ? (
          <UserModal
            user={userStore.userDetails}
            isLoggedUser={
              userStore.loggedUser && userStore.userDetails
                ? userStore.loggedUser.id === userStore.userDetails.id
                : false
            }
            loading={userStore.updating}
            projects={projectStore.projects}
            editPassword={this.state.editPassword}
            onRequestClose={() => {
              this.handleUserEditModalClose();
            }}
            onUpdateClick={user => {
              this.handleUserUpdateClick(user);
            }}
          />
        ) : null}
        {this.state.showDeleteAlert ? (
          <AlertModal
            isOpen
            title="Delete User?"
            message="Are you sure you want to delete this user?"
            extraMessage="Deleting a Coriolis User is permanent!"
            onConfirmation={() => {
              this.handleDeleteConfirmation();
            }}
            onRequestClose={() => {
              this.setState({ showDeleteAlert: false });
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

function UserDetailsPageWithNavigate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return <UserDetailsPage onNavigate={navigate} id={id!} />;
}

export default UserDetailsPageWithNavigate;
