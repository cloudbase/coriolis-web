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

import { observer } from "mobx-react";
import React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { ThemePalette, ThemeProps } from "@src/components/Theme";
import AlertModal from "@src/components/ui/AlertModal";
import Button from "@src/components/ui/Button";
import CopyMultilineValue from "@src/components/ui/CopyMultilineValue";
import CopyValue from "@src/components/ui/CopyValue";
import DropdownLink from "@src/components/ui/Dropdowns/DropdownLink";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import Table from "@src/components/ui/Table";

import type { Project, RoleAssignment, Role } from "@src/@types/Project";
import type { User } from "@src/@types/User";

const Wrapper = styled.div<any>`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
  margin: 0 auto;
  padding-left: 126px;
`;
const Info = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-top: 32px;
  margin-left: -32px;
`;
const Field = styled.div<any>`
  ${ThemeProps.exactWidth("calc(50% - 32px)")}
  margin-bottom: 32px;
  margin-left: 32px;
`;
const Value = styled.div<any>``;
const Label = styled.div<any>`
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  color: ${ThemePalette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 3px;
`;
const LoadingWrapper = styled.div<any>`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 32px 0 64px 0;
`;
const TableStyled = styled(Table)`
  margin-top: 42px;
  margin-bottom: 32px;
`;
const Buttons = styled.div<any>`
  margin-top: 64px;
  display: flex;
  justify-content: space-between;
`;
const UserColumn = styled.div<any>`
  ${props =>
    props.disabled
      ? css`
          color: ${ThemePalette.grayscale[3]};
        `
      : ""}
`;
const UserName = styled(Link)<any>`
  ${props =>
    props.disabled
      ? css`
          opacity: 0.7;
        `
      : ""}
  color: ${ThemePalette.primary};
  text-decoration: none;
`;
const ButtonsColumn = styled.div<any>`
  display: flex;
  flex-direction: column;
  button {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

type Props = {
  project: Project | null;
  loading: boolean;
  users: User[];
  usersLoading: boolean;
  roleAssignments: RoleAssignment[];
  roles: Role[];
  loggedUserId: string;
  onEnableUser: (user: User) => void;
  onRemoveUser: (user: User) => void;
  onUserRoleChange: (user: User, roleId: string, toggled: boolean) => void;
  onAddMemberClick: () => void;
  onDeleteClick: () => void;
};
type State = {
  showRemoveUserAlert: boolean;
};
@observer
class ProjectDetailsContent extends React.Component<Props, State> {
  state = {
    showRemoveUserAlert: false,
  };

  selectedUser: User | null = null;

  handleRemoveUserAction(user: User) {
    this.selectedUser = user;
    this.setState({ showRemoveUserAlert: true });
  }

  handleUserAction(user: User, item: { label: string; value: string }) {
    switch (item.value) {
      case "enable":
        this.props.onEnableUser(user);
        break;
      case "remove":
        this.handleRemoveUserAction(user);
        break;
      default:
        break;
    }
  }

  handleRemoveUserConfirmation() {
    if (this.selectedUser) {
      this.props.onRemoveUser(this.selectedUser);
    }

    this.setState({ showRemoveUserAlert: false });
  }

  handleCloseRemoveUserConfirmation() {
    this.setState({ showRemoveUserAlert: false });
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage />
      </LoadingWrapper>
    );
  }

  renderButtons() {
    if (this.props.loading) return null;

    return (
      <Buttons>
        <ButtonsColumn>
          <Button onClick={this.props.onAddMemberClick}>Add Member</Button>
        </ButtonsColumn>
        <ButtonsColumn>
          <Button alert hollow onClick={this.props.onDeleteClick}>
            Delete Project
          </Button>
        </ButtonsColumn>
      </Buttons>
    );
  }

  renderInfo() {
    if (this.props.loading || !this.props.project) {
      return null;
    }
    const { project } = this.props;

    return (
      <Info>
        <Field>
          <Label>Name</Label>
          {this.renderValue(project.name)}
        </Field>
        <Field>
          <Label>Description</Label>
          {project.description ? (
            <CopyMultilineValue value={project.description} />
          ) : (
            <Value>-</Value>
          )}
        </Field>
        <Field>
          <Label>ID</Label>
          {this.renderValue(project.id)}
        </Field>
        <Field>
          <Label>Enabled</Label>
          <Value>{project.enabled ? "Yes" : "No"}</Value>
        </Field>
      </Info>
    );
  }

  renderUsers() {
    if (this.props.usersLoading || this.props.loading) {
      return null;
    }
    const rows: React.ReactNode[][] = [];
    const actions = (user: User) => [
      {
        label: `${user.enabled ? "Disable" : "Enable"} User`,
        value: "enable",
      },
      {
        label: "Remove",
        value: "remove",
      },
    ];
    const getUserRoles = (user: RoleAssignment["user"]) => {
      const projectId = this.props.project ? this.props.project.id : "";
      const roles = this.props.roleAssignments
        .filter(a => a.scope.project && a.scope.project.id === projectId)
        .filter(a => a.user.id === user.id)
        .map(a => ({ value: a.role.id, label: a.role.name }));
      return roles;
    };
    const allRoles = this.props.roles
      .filter(r => r.name !== "key-manager:service-admin")
      .map(r => ({ value: r.id, label: r.name }));

    this.props.users.forEach(user => {
      const userActions = actions(user);
      const userRoles = getUserRoles(user);
      const columns = [
        <UserName
          key="username"
          disabled={!user.enabled}
          to={`/users/${user.id}`}
        >
          {user.name}
        </UserName>,
        <DropdownLink
          key="roles"
          width="214px"
          getLabel={() =>
            userRoles.length > 0
              ? userRoles.map(r => r.label).join(", ")
              : "No roles"
          }
          selectedItems={userRoles.map(r => r.value)}
          listWidth="120px"
          multipleSelection
          items={allRoles}
          labelStyle={{ color: ThemePalette.grayscale[4] }}
          disabled={!user.enabled}
          style={{ opacity: user.enabled ? 1 : 0.7 }}
          onChange={item => {
            this.props.onUserRoleChange(
              user,
              item.value,
              !userRoles.find(i => i.value === item.value)
            );
          }}
        />,
        <UserColumn key="enabled" disabled={!user.enabled}>
          {user.enabled ? "Enabled" : "Disabled"}
        </UserColumn>,
        <DropdownLink
          key="actions"
          noCheckmark
          width="82px"
          items={userActions}
          selectedItem=""
          selectItemLabel="Actions"
          listWidth="120px"
          onChange={item => {
            this.handleUserAction(user, item);
          }}
          disabled={user.id === this.props.loggedUserId}
          style={{ opacity: user.id === this.props.loggedUserId ? 0.7 : 1 }}
          itemStyle={item =>
            `color: ${
              item.value === "remove" ? ThemePalette.alert : ThemePalette.black
            };`
          }
        />,
      ];
      rows.push(columns);
    });

    return (
      <TableStyled
        header={["Member", "Roles", "Status", ""]}
        items={rows}
        noItemsLabel="No members available!"
        columnsStyle={[
          css`
            color: ${ThemePalette.black};
          `,
        ]}
      />
    );
  }

  renderValue(value: string) {
    return value !== "-" ? (
      <CopyValue value={value} maxWidth="90%" />
    ) : (
      <Value>{value}</Value>
    );
  }

  render() {
    return (
      <Wrapper>
        {this.renderInfo()}
        {this.props.loading ? this.renderLoading() : null}
        {this.renderUsers()}
        {!this.props.loading && this.props.usersLoading
          ? this.renderLoading()
          : null}
        {this.renderButtons()}
        {this.state.showRemoveUserAlert ? (
          <AlertModal
            isOpen
            title="Remove User?"
            message="Are you sure you want to remove this user from the project?"
            extraMessage=" "
            onConfirmation={() => {
              this.handleRemoveUserConfirmation();
            }}
            onRequestClose={() => {
              this.handleCloseRemoveUserConfirmation();
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

export default ProjectDetailsContent;
