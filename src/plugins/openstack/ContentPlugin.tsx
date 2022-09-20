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

import * as React from "react";
import styled from "styled-components";

import configLoader from "@src/utils/Config";
import LabelDictionary from "@src/utils/LabelDictionary";

import ToggleButtonBar from "@src/components/ui/ToggleButtonBar";
import type { Field } from "@src/@types/Field";
import { Wrapper, FieldStyled, Row } from "@src/plugins/default/ContentPlugin";

import { Validation, Endpoint } from "@src/@types/Endpoint";
import { ThemePalette, ThemeProps } from "@src/components/Theme";

const ToggleButtonBarStyled = styled(ToggleButtonBar)`
  margin-top: 16px;
`;
const Fields = styled.div<any>`
  margin-top: 32px;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;
const Group = styled.div<any>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;
const GroupName = styled.div<any>`
  display: flex;
  align-items: center;
  margin: 32px 0 24px 0;
`;
const GroupNameText = styled.div<any>`
  margin: 0 32px;
  font-size: 16px;
`;
const GroupNameBar = styled.div<any>`
  flex-grow: 1;
  background: ${ThemePalette.grayscale[3]};
  height: 1px;
`;
const GroupFields = styled.div<any>`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

type Props = {
  connectionInfoSchema: Field[];
  validation: Validation | null;
  invalidFields: string[];
  getFieldValue: (field?: Field | null) => any;
  handleFieldChange: (field: Field | null | undefined, value: any) => void;
  handleFieldsChange: (items: { field: Field; value: any }[]) => void;
  disabled: boolean;
  cancelButtonText: string;
  validating: boolean;
  onRef: (contentPlugin: any) => void;
  onResizeUpdate: (scrollOfset: number) => void;
  scrollableRef: (ref: HTMLElement) => void;
  originalConnectionInfo: Endpoint["connection_info"];
  highlightRequired: () => void;
  handleValidateClick: () => void;
  handleCancelClick: () => void;
};
type State = {
  useAdvancedOptions: boolean;
  showCephOptions: boolean;
};
class ContentPlugin extends React.Component<Props, State> {
  // This is a temporary hack, should be always true for all plugins,
  // but momentaraly causes issues in Azure plugins
  // Fix Azure plugin and remove this line
  static REQUIRES_PARENT_OBJECT_PATH = true;

  state = {
    useAdvancedOptions: false,
    showCephOptions: false,
  };

  previouslySelectedChoices: string[] = [];

  componentDidMount() {
    this.props.onRef(this);
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (prevState.useAdvancedOptions !== this.state.useAdvancedOptions) {
      this.props.onResizeUpdate(0);
    }
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  get useCurrentUser(): boolean {
    return Boolean(
      this.getFieldValue(
        this.props.connectionInfoSchema.find(
          n => n.name === "openstack_use_current_user"
        )
      )
    );
  }

  get hasCephOptionsSet(): boolean {
    const cephOptionsField = this.props.connectionInfoSchema.find(
      n => n.name === "ceph_options"
    );
    if (!cephOptionsField || !cephOptionsField.properties) {
      return false;
    }
    const hasValues = cephOptionsField.properties.filter(f =>
      this.getFieldValue(f)
    );
    return hasValues.length > 0;
  }

  getApiVersion(): number {
    return this.props.getFieldValue(
      this.props.connectionInfoSchema.find(
        n => n.name === "identity_api_version"
      )
    );
  }

  getFieldValue(field?: Field | null) {
    const fieldValue = this.props.getFieldValue(field);
    if (fieldValue) {
      return fieldValue;
    }

    const getInputChoiceValue = (fieldBaseName: string): string => {
      const id = this.props.getFieldValue(
        this.props.connectionInfoSchema.find(
          n => n.name === `${fieldBaseName}_id`
        )
      );
      const previouslySelected = this.previouslySelectedChoices.find(
        f => f === `${fieldBaseName}_id`
      );
      if (id || previouslySelected) {
        if (!previouslySelected)
          this.previouslySelectedChoices.push(`${fieldBaseName}_id`);
        return `${fieldBaseName}_id`;
      }
      return `${fieldBaseName}_name`;
    };
    if (field && field.name === "user_domain") {
      return getInputChoiceValue("user_domain");
    }
    if (field && field.name === "project_domain") {
      return getInputChoiceValue("project_domain");
    }

    return fieldValue;
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  findInvalidFields = () => {
    const inputChoices = ["user_domain", "project_domain"];

    let invalidFields = this.props.connectionInfoSchema
      .filter(field => {
        if (this.isFieldRequired(field)) {
          const value = this.getFieldValue(field);
          return !value || value.length === 0;
        }
        const inputChoice = inputChoices.find(c => c === field.name);
        if (inputChoice && this.getApiVersion() > 2) {
          const selectionValue = this.getFieldValue(
            this.props.connectionInfoSchema.find(f => f.name === inputChoice)
          );
          const itemValue = this.getFieldValue(
            this.props.connectionInfoSchema.find(f => f.name === selectionValue)
          );
          return !itemValue;
        }

        return false;
      })
      .map(f => f.name);

    const cephOptions = this.props.connectionInfoSchema.find(
      f => f.name === "ceph_options"
    );
    const cephOptionsProperties = cephOptions && cephOptions.properties;
    if (
      cephOptionsProperties &&
      (this.state.showCephOptions || this.hasCephOptionsSet)
    ) {
      invalidFields = invalidFields.concat(
        cephOptionsProperties
          .filter(f => f.required && !this.getFieldValue(f))
          .map(f => f.name)
      );
    }
    return invalidFields;
  };

  handleAdvancedOptionsToggle(useAdvancedOptions: boolean) {
    this.setState({ useAdvancedOptions });
  }

  handleShowCepthOptionsChange(value: boolean) {
    const cephOptions = this.props.connectionInfoSchema.find(
      f => f.name === "ceph_options"
    );
    if (!cephOptions || !cephOptions.properties) {
      return;
    }
    const resetFields = cephOptions.properties.map(field => ({
      field,
      value: null,
    }));

    this.props.handleFieldsChange(resetFields);

    this.setState({ showCephOptions: value });
  }

  filterSimpleAdvanced(): Field[] {
    let extraAdvancedFields = [
      "description",
      "glance_api_version",
      "identity_api_version",
      "openstack_use_current_user",
    ];
    if (this.getApiVersion() > 2) {
      extraAdvancedFields = extraAdvancedFields.concat([
        "user_domain",
        "project_domain",
      ]);
    }
    const ignoreFields = [
      "user_domain_id",
      "project_domain_id",
      "user_domain_name",
      "project_domain_name",
    ];
    if (!configLoader.config.showOpenstackCurrentUserSwitch) {
      ignoreFields.push("openstack_use_current_user");
    }

    return this.props.connectionInfoSchema
      .filter(f => !ignoreFields.find(i => i === f.name))
      .filter(field => {
        if (field.name === "ceph_options") {
          return (
            this.state.useAdvancedOptions &&
            (this.state.showCephOptions || this.hasCephOptionsSet)
          );
        }

        if (this.state.useAdvancedOptions) {
          return true;
        }
        return (
          field.required ||
          extraAdvancedFields.find(fieldName => field.name === fieldName)
        );
      });
  }

  isFieldRequired(field: Field) {
    return this.useCurrentUser ? field.name === "name" : field.required;
  }

  renderSimpleAdvancedToggle() {
    return (
      <ToggleButtonBarStyled
        items={[
          { label: "Simple", value: "simple" },
          { label: "Advanced", value: "advanced" },
        ]}
        selectedValue={this.state.useAdvancedOptions ? "advanced" : "simple"}
        onChange={item => {
          this.handleAdvancedOptionsToggle(item.value === "advanced");
        }}
      />
    );
  }

  renderFields() {
    const rows: JSX.Element[] = [];
    const fields = this.filterSimpleAdvanced();
    if (this.state.useAdvancedOptions) {
      const showCepthOptionsField = {
        name: "show_ceph_options",
        label: "Use Ceph for Replication",
        type: "boolean",
        description:
          "If performing Ceph-based Replicas from a source OpenStack, the Ceph configuration file and credentials for a user with read-only access to the Ceph pool used by Cinder backups/snapshots must be provided. Coriolis must be able to connect to the source OpenStack's Ceph RADOS cluster by being able to reach at least one Ceph- monitor host.For the easiest setup possible, simply using the same credentials used by the Cinder service(s) will work.",
      };
      fields.push(showCepthOptionsField);
    }

    const renderField = (field: any) => {
      const disabled =
        this.props.disabled ||
        (this.useCurrentUser &&
          field.name !== "name" &&
          field.name !== "description" &&
          field.name !== "openstack_use_current_user");
      const required =
        this.isFieldRequired(field) ||
        (this.getApiVersion() > 2
          ? field.name === "user_domain" || field.name === "project_domain"
          : false);
      const isPassword =
        Boolean(
          configLoader.config.passwordFields.find(fn => field.name === fn)
        ) || field.name.indexOf("password") > -1;
      const value =
        field.name === "show_ceph_options"
          ? this.state.showCephOptions || this.hasCephOptionsSet
          : this.getFieldValue(field);
      const onChange = (v: boolean) => {
        if (field.name === "show_ceph_options") {
          this.handleShowCepthOptionsChange(v);
        } else {
          this.props.handleFieldChange(field, v);
        }
      };

      return (
        <FieldStyled
          {...field}
          label={field.title || LabelDictionary.get(field.name)}
          required={required}
          password={isPassword}
          width={ThemeProps.inputSizes.large.width}
          disabled={disabled}
          highlight={
            this.props.invalidFields.findIndex(fn => fn === field.name) > -1
          }
          value={value}
          onChange={onChange}
          getFieldValue={fieldName =>
            this.getFieldValue(
              this.props.connectionInfoSchema.find(n => n.name === fieldName)
            )
          }
          onFieldChange={(fieldName, fieldValue) => {
            this.props.handleFieldChange(
              this.props.connectionInfoSchema.find(n => n.name === fieldName),
              fieldValue
            );
          }}
        />
      );
    };

    let lastField: JSX.Element | null = null;
    const nonCephFields = fields.filter(f => f.name !== "ceph_options");
    nonCephFields.forEach((field, i) => {
      const currentField = renderField(field);
      if (i % 2 !== 0) {
        rows.push(
          <Row key={field.name}>
            {lastField}
            {currentField}
          </Row>
        );
      } else if (i === nonCephFields.length - 1) {
        rows.push(<Row key={field.name}>{currentField}</Row>);
      }
      lastField = currentField;
    });

    const cephOptionsRows: JSX.Element[] = [];
    const cephOptionsField = fields.find(f => f.name === "ceph_options");
    let cephOptions = null;
    const properties = cephOptionsField && cephOptionsField.properties;

    if (properties) {
      let i = 0;
      properties.forEach((field, fieldIndex) => {
        if (
          field.name === "ceph_options/ceph_conf_file" ||
          field.name === "ceph_options/ceph_keyring_file"
        ) {
          // eslint-disable-next-line no-param-reassign
          field.useTextArea = true;
        }

        const currentField = renderField(field);

        const pushRow = (field1: React.ReactNode, field2?: React.ReactNode) => {
          cephOptionsRows.push(
            <Row key={field.name}>
              {field1}
              {field2}
            </Row>
          );
        };
        if (field.useTextArea) {
          pushRow(currentField);
          i -= 1;
        } else if (i % 2 !== 0) {
          pushRow(lastField, currentField);
        } else if (fieldIndex === properties.length - 1) {
          pushRow(currentField);
          if (field.useTextArea) {
            i -= 1;
          }
        } else {
          lastField = currentField;
        }
        i += 1;
      });

      cephOptions = (
        <Group>
          <GroupName>
            <GroupNameBar />
            <GroupNameText>Ceph Options</GroupNameText>
            <GroupNameBar />
          </GroupName>
          <GroupFields>{cephOptionsRows}</GroupFields>
        </Group>
      );
    }

    return (
      <Fields
        ref={(ref: HTMLElement) => {
          this.props.scrollableRef(ref);
        }}
      >
        <Group>
          <GroupFields>{rows}</GroupFields>
        </Group>
        {cephOptions}
      </Fields>
    );
  }

  render() {
    return (
      <Wrapper>
        {this.renderSimpleAdvancedToggle()}
        {this.renderFields()}
      </Wrapper>
    );
  }
}

export default ContentPlugin;
