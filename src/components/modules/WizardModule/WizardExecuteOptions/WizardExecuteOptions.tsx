/*
Copyright (C) 2025  Cloudbase Solutions SRL
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
import { toJS } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";
import FieldInput from "@src/components/ui/FieldInput";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import { deploymentFields } from "@src/constants";
import LabelDictionary from "@src/utils/LabelDictionary";
import type { Field } from "@src/@types/Field";

const Wrapper = styled.div<any>`
  display: flex;
  min-height: 0;
  flex-direction: column;
  width: 100%;
`;

const Fields = styled.div<any>`
  ${props => (props.layout === "page" ? "" : "padding: 32px;")}
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding-right: ${props => (props.layout === "page" ? 4 : 24)}px;
  flex-grow: 1;
`;
const Group = styled.div<any>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &.field-group-transition-appear {
    opacity: 0.01;
  }
  &.field-group-transition-appear-active {
    opacity: 1;
    transition: opacity 250ms ease-out;
  }
`;
const GroupName = styled.div<any>`
  display: flex;
  align-items: center;
  margin: 48px 0 24px 0;
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
  margin-top: ${props =>
    props.name === "Deployment options" ? "32px" : "16px"};
`;
const Column = styled.div<any>`
  margin-top: -16px;
`;
const FieldInputStyled = styled(FieldInput)`
  width: ${props => props.width || ThemeProps.inputSizes.wizard.width}px;
  justify-content: space-between;
  margin-top: 16px;
`;

export const shouldRenderField = (field: Field) =>
  (field.type !== "array" ||
    (field.enum && field.enum.length && field.enum.length > 0)) &&
  (field.type !== "object" || field.properties);

type FieldRender = {
  field: Field;
  component: React.ReactNode;
  column: number;
};

type Props = {
  options: Field[];
  wizardType: string;
  layout?: "page" | "modal";
  data?: { [prop: string]: any } | null;
  fieldWidth?: number;
  getFieldValue?: (
    fieldName: string,
    defaultValue: any,
    parentFieldName: string | undefined,
  ) => any;
  onChange: (field: Field, value: any, parentFieldName?: string) => void;
  onScrollableRef?: (ref: HTMLElement) => void;
};
type State = {
  executionOptions: { [prop: string]: any } | null;
};

@observer
class WizardExecuteOptions extends React.Component<Props, State> {
  state: State = {
    executionOptions: null,
  };

  getDefaultSimpleFieldsSchema() {
    const fieldsSchema: Field[] = [];
    if (
      this.props.wizardType === "replica-execute" ||
      this.props.wizardType === "migration-execute"
    ) {
      fieldsSchema.push({
        name: "execute_now",
        type: "boolean",
        default: true,
        nullableBoolean: false,
        description:
          "When enabled, the transfer will be executed immediately after the options are configured.",
      });
      fieldsSchema.push({
        name: "auto_deploy",
        type: "boolean",
        default: false,
        nullableBoolean: false,
        description:
          "When enabled, the transfer will automatically deploy the instances on the destination cloud after the transfer is complete.",
      });

      fieldsSchema.push({
        name: "shutdown_instances",
        type: "boolean",
        default: false,
        nullableBoolean: false,
        description:
          "When enabled, the instances will be shut down before the transfer is executed.",
      });
    } else if (this.props.wizardType === "edit-deploy") {
      fieldsSchema.push({
        name: "clone_disks",
        type: "boolean",
        label: "Clone Disks",
        nullableBoolean: false,
        default: true,
        description:
          "When enabled, the disks will be cloned during the deployment.",
      });

      fieldsSchema.push({
        name: "skip_os_morphing",
        type: "boolean",
        label: "Skip OS Morphing",
        nullableBoolean: false,
        default: false,
        description:
          "When enabled, OS Morphing will be skipped during the deployment.",
      });
    }

    return fieldsSchema;
  }

  generateGroups(fields: FieldRender[]) {
    const groups: Array<{ fields: FieldRender[]; name?: string }> = [
      { fields },
    ];

    if (
      this.props.wizardType === "replica-execute" ||
      this.props.wizardType === "migration-execute"
    ) {
      const deploymentFieldNames = deploymentFields.map(f => f.name);
      const deploymentFieldsInUse = fields.filter(f =>
        deploymentFieldNames.includes(f.field.name),
      );
      const additionalDeploymentFields = deploymentFields
        .filter(f => !fields.some(field => field.field.name === f.name))
        .map(field => ({
          column: fields.length % 2,
          component: this.renderOptionsField({
            ...field,
            default: field.defaultValue,
          }),
          field: {
            ...field,
            default: field.defaultValue,
          },
        }));
      if (
        deploymentFieldsInUse.length > 0 ||
        additionalDeploymentFields.length > 0
      ) {
        groups.push({
          name: "Deployment options",
          fields: [
            ...deploymentFieldsInUse.map((f, i) => ({ ...f, column: i % 2 })),
            ...additionalDeploymentFields,
          ],
        });
      }
    }

    fields.forEach(f => {
      if (f.field.groupName) {
        groups[0].fields = groups[0].fields
          ? groups[0].fields.filter(gf => gf.field.name !== f.field.name)
          : [];

        const group = groups.find(g => g.name && g.name === f.field.groupName);
        if (!group) {
          groups.push({
            name: f.field.groupName,
            fields: [f],
          });
        } else {
          group.fields.push(f);
        }
      }
    });

    return groups;
  }

  getFieldValue(
    fieldName: string,
    defaultValue: any,
    parentFieldName?: string,
  ) {
    if (this.props.getFieldValue) {
      return this.props.getFieldValue(fieldName, defaultValue, parentFieldName);
    }

    if (!this.props.data) {
      return defaultValue;
    }

    if (parentFieldName) {
      if (
        this.props.data[parentFieldName] &&
        this.props.data[parentFieldName][fieldName] !== undefined
      ) {
        return this.props.data[parentFieldName][fieldName];
      }
      return defaultValue;
    }

    if (!this.props.data || this.props.data[fieldName] === undefined) {
      return defaultValue;
    }

    return this.props.data[fieldName];
  }

  renderOptionsField(field: Field) {
    let additionalProps;
    if (field.type === "object" && field.properties) {
      additionalProps = {
        valueCallback: (f: any) =>
          this.getFieldValue(f.name, f.default, field.name),
        onChange: (value: any, f: any) => {
          this.props.onChange(f, value, field.name);
        },
        properties: field.properties,
      };
    } else {
      additionalProps = {
        value: this.getFieldValue(field.name, field.default, field.groupName),
        onChange: (value: any) => {
          this.props.onChange(field, value);
        },
      };
    }
    return (
      <FieldInputStyled
        layout={this.props.layout || "page"}
        key={field.name}
        name={field.name}
        type={field.type}
        minimum={field.minimum}
        maximum={field.maximum}
        label={field.label || LabelDictionary.get(field.name)}
        description={
          field.description || LabelDictionary.getDescription(field.name)
        }
        password={field.name.toLowerCase().includes("password")}
        enum={field.enum}
        addNullValue
        required={field.required}
        width={this.props.fieldWidth || ThemeProps.inputSizes.wizard.width}
        nullableBoolean={field.nullableBoolean}
        disabled={field.disabled}
        {...additionalProps}
      />
    );
  }

  renderOptionsFields() {
    let fieldsSchema: Field[] = this.getDefaultSimpleFieldsSchema();

    const isRequired = (f: Field) =>
      f.required || f.properties?.some(p => p.required);

    const defaultFieldNames = fieldsSchema.map(f => f.name);
    const filteredOptions = this.props.options.filter(
      f => !defaultFieldNames.includes(f.name) && isRequired(f),
    );

    fieldsSchema = fieldsSchema.concat(filteredOptions);

    const nonNullableBooleans: string[] = fieldsSchema
      .filter(f => f.type === "boolean" && f.nullableBoolean === false)
      .map(f => f.name);

    const fields: FieldRender[] = fieldsSchema
      .filter(f => shouldRenderField(f))
      .map((field, i) => {
        const column: number = i % 2;
        const usableField = toJS(field);
        if (
          field.type === "boolean" &&
          !nonNullableBooleans.find(name => name === field.name)
        ) {
          usableField.nullableBoolean = true;
        }

        return {
          column,
          component: this.renderOptionsField(usableField),
          field: usableField,
        };
      });

    const groups = this.generateGroups(fields);
    return (
      <Fields ref={this.props.onScrollableRef} layout={this.props.layout}>
        {groups.map(g => {
          const getColumnInGroup = (field: any, fieldIndex: number) =>
            g.name ? fieldIndex % 2 : field.column;
          return (
            <Group key={g.name || 0}>
              {g.name ? (
                <GroupName>
                  <GroupNameBar />
                  <GroupNameText>{LabelDictionary.get(g.name)}</GroupNameText>
                  <GroupNameBar />
                </GroupName>
              ) : null}
              <GroupFields>
                <Column left>
                  {g.fields.map(
                    (f, j) => getColumnInGroup(f, j) === 0 && f.component,
                  )}
                </Column>
                <Column right>
                  {g.fields.map(
                    (f, j) => getColumnInGroup(f, j) === 1 && f.component,
                  )}
                </Column>
              </GroupFields>
            </Group>
          );
        })}
      </Fields>
    );
  }

  render() {
    return <Wrapper>{this.renderOptionsFields()}</Wrapper>;
  }
}

export default WizardExecuteOptions;
