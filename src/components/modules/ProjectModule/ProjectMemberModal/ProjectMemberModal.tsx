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
import { observer } from "mobx-react";
import styled from "styled-components";

import type { Field as FieldType } from "@src/@types/Field";
import type { User } from "@src/@types/User";
import type { Project, Role } from "@src/@types/Project";
import Button from "@src/components/ui/Button";
import Modal from "@src/components/ui/Modal";
import FieldInput from "@src/components/ui/FieldInput";
import ToggleButtonBar from "@src/components/ui/ToggleButtonBar";
import AutocompleteDropdown from "@src/components/ui/Dropdowns/AutocompleteDropdown";

import { ThemePalette, ThemeProps } from "@src/components/Theme";
import KeyboardManager from "@src/utils/KeyboardManager";

import userImage from "./images/user.svg";

const Wrapper = styled.div<any>`
  padding: 48px 0 32px 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
const Image = styled.div<any>`
  ${ThemeProps.exactSize("96px")}
  background: url('${userImage}') center no-repeat;
  margin: 0 auto;
`;
const ToggleButtonBarStyled = styled(ToggleButtonBar)`
  margin-top: 48px;
`;
const Form = styled.div<any>`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 32px;
  overflow: auto;
  padding: 0 32px;

  > div {
    margin-top: 16px;
  }
`;
const FieldStyled = styled(FieldInput)`
  ${ThemeProps.exactWidth(`${ThemeProps.inputSizes.large.width}px`)}
`;
const FormField = styled.div<any>``;
const FormLabel = styled.div<any>`
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  color: ${ThemePalette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
`;
const Buttons = styled.div<any>`
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  padding: 0 32px;
`;

type Props = {
  loading: boolean;
  users: User[];
  projects: Project[];
  onRequestClose: () => void;
  onAddClick: (user: User, isNew: boolean, roles: Role[]) => void;
  roles: Role[];
};

type State = {
  isNew: boolean;
  selectedUser?: User | null;
  username: string;
  description: string;
  email: string;
  projectId: string;
  password: string;
  confirmPassword: string;
  enabled: boolean;
  highlightFieldNames: string[];
  selectedRolesExisting: string[];
  selectedRolesNew: string[];
};
@observer
class ProjectMemberModal extends React.Component<Props, State> {
  state: State = {
    isNew: false,
    selectedUser: null,
    username: "",
    description: "",
    email: "",
    projectId: "",
    password: "",
    confirmPassword: "",
    enabled: true,
    highlightFieldNames: [],
    selectedRolesExisting: [],
    selectedRolesNew: [],
  };

  componentDidMount() {
    KeyboardManager.onEnter("projectMemberModal", () => {
      this.handleAddClick();
    });
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown("projectMemberModal");
  }

  handleAddClick() {
    if (this.highlightFields()) {
      return;
    }
    let user: User;
    let roles = [];

    if (this.state.isNew) {
      user = {
        id: "",
        project: { id: "", name: "" },
        project_id: this.state.projectId,
        email: this.state.email,
        name: this.state.username,
        description: this.state.description,
        password: this.state.password,
        enabled: this.state.enabled,
      };
      roles = this.state.selectedRolesNew;
    } else if (this.state.selectedUser) {
      user = this.state.selectedUser;
      roles = this.state.selectedRolesExisting;
    } else {
      return;
    }

    roles = roles.map(
      id =>
        this.props.roles.find(r => r.id === id) || {
          id: "undefined",
          name: "",
        },
    );
    this.props.onAddClick(user, this.state.isNew, roles);
  }

  highlightFields(): boolean {
    const highlightFieldNames = [];
    if (!this.state.isNew) {
      if (!this.state.selectedUser) {
        highlightFieldNames.push("selectedUser");
      }
      if (this.state.selectedRolesExisting.length === 0) {
        highlightFieldNames.push("rolesExisting");
      }
      if (highlightFieldNames.length > 0) {
        this.setState({ highlightFieldNames });
        return true;
      }
      this.setState({ highlightFieldNames: [] });
      return false;
    }

    if (!this.state.username) {
      highlightFieldNames.push("username");
    }
    if (!this.state.password) {
      highlightFieldNames.push("password");
    }
    if (
      this.state.password &&
      this.state.password !== this.state.confirmPassword
    ) {
      highlightFieldNames.push("confirm_password");
    }
    if (this.state.selectedRolesNew.length === 0) {
      highlightFieldNames.push("rolesNew");
    }
    if (highlightFieldNames.length > 0) {
      this.setState({ highlightFieldNames });
      return true;
    }
    this.setState({ highlightFieldNames: [] });
    return false;
  }

  renderToggleButton() {
    const items = [
      {
        value: "existing",
        label: "Existing",
      },
      {
        value: "new",
        label: "New",
      },
    ];
    return (
      <ToggleButtonBarStyled
        items={items}
        selectedValue={this.state.isNew ? "new" : "existing"}
        onChange={item => {
          this.setState({ isNew: item.value === "new" });
        }}
      />
    );
  }

  renderRolesField() {
    const selectedRoles = this.state.isNew
      ? this.state.selectedRolesNew
      : this.state.selectedRolesExisting;
    const setSelectedRoles = (roles: string[]) => {
      if (this.state.isNew) {
        this.setState({ selectedRolesNew: roles });
      } else {
        this.setState({ selectedRolesExisting: roles });
      }
    };
    const highlighFieldName = this.state.isNew ? "rolesNew" : "rolesExisting";

    return (
      <FieldInput
        key="roles"
        name="role(s)"
        label="Role(s)"
        type="array"
        onChange={roleId => {
          if (selectedRoles.find(id => id === roleId)) {
            setSelectedRoles(selectedRoles.filter(r => r !== roleId));
          } else {
            setSelectedRoles([...selectedRoles, roleId]);
          }
        }}
        value={selectedRoles}
        width={ThemeProps.inputSizes.large.width}
        layout="modal"
        disabled={this.props.loading}
        enum={this.props.roles
          .filter(r => r.name !== "key-manager:service-admin")
          .map(r => ({ name: r.name, id: r.id }))}
        required
        highlight={Boolean(
          this.state.highlightFieldNames.find(n => n === highlighFieldName),
        )}
        noSelectionMessage="Choose role(s)"
        noItemsMessage="No available roles"
      />
    );
  }

  renderField(field: FieldType, value: any, onChange: (value: any) => void) {
    return (
      <FieldStyled
        key={field.name}
        name={field.name}
        type={field.type || "string"}
        value={value}
        label={field.label}
        onChange={onChange}
        width={ThemeProps.inputSizes.large.width}
        disabled={this.props.loading}
        enum={field.enum}
        password={
          field.name === "password" || field.name === "confirm_password"
        }
        required={field.required}
        highlight={Boolean(
          this.state.highlightFieldNames.find(n => n === field.name),
        )}
        noSelectionMessage="Choose a project"
        noItemsMessage="No available members"
      />
    );
  }

  renderNewForm() {
    const userProjects = this.props.projects.map(p => ({
      name: p.name,
      id: p.id,
    }));
    const chooseProject: { name: string; id: string | null } = {
      name: "Choose a project",
      id: null,
    };
    const fields = [
      this.renderField(
        { name: "username", label: "Username", required: true },
        this.state.username,
        username => {
          this.setState({ username });
        },
      ),
      this.renderField(
        { name: "description", label: "Description" },
        this.state.description,
        description => {
          this.setState({ description });
        },
      ),
      this.renderField(
        {
          name: "Primary Project",
          label: "Primary Project",
          enum: [chooseProject].concat(userProjects),
        },
        this.state.projectId,
        projectId => {
          this.setState({ projectId });
        },
      ),
      this.renderRolesField(),
      this.renderField(
        { name: "password", label: "Password", required: true },
        this.state.password,
        password => {
          this.setState({ password });
        },
      ),
      this.renderField(
        { name: "confirm_password", label: "Confirm Password", required: true },
        this.state.confirmPassword,
        confirmPassword => {
          this.setState({ confirmPassword });
        },
      ),
      this.renderField(
        { name: "Email", label: "Email" },
        this.state.email,
        email => {
          this.setState({ email });
        },
      ),
      this.renderField(
        { name: "Enabled", label: "Enabled", type: "boolean" },
        this.state.enabled,
        enabled => {
          this.setState({ enabled });
        },
      ),
    ];

    return <Form>{fields}</Form>;
  }

  renderExistingForm() {
    const users = this.props.users.map(u => ({ label: u.name, value: u.id }));

    return (
      <Form style={{ marginBottom: "80px" }}>
        <FormField>
          <FormLabel>Username</FormLabel>
          <AutocompleteDropdown
            items={users}
            disabled={this.props.loading}
            selectedItem={
              this.state.selectedUser ? this.state.selectedUser.id : ""
            }
            highlight={Boolean(
              this.state.highlightFieldNames.find(n => n === "selectedUser"),
            )}
            onChange={item => {
              this.setState({
                selectedUser: this.props.users.find(u => u.id === item.value),
              });
            }}
            required
          />
        </FormField>
        {this.renderRolesField()}
      </Form>
    );
  }

  renderForm() {
    if (this.state.isNew) {
      return this.renderNewForm();
    }
    return this.renderExistingForm();
  }

  render() {
    return (
      <Modal
        isOpen
        title="Add Project Member"
        onRequestClose={this.props.onRequestClose}
      >
        <Wrapper>
          <Image />
          {this.renderToggleButton()}
          {this.renderForm()}
          <Buttons>
            <Button secondary large onClick={this.props.onRequestClose}>
              Cancel
            </Button>
            <Button
              large
              disabled={this.props.loading}
              onClick={() => {
                this.handleAddClick();
              }}
            >
              Add Member
            </Button>
          </Buttons>
        </Wrapper>
      </Modal>
    );
  }
}

export default ProjectMemberModal;
