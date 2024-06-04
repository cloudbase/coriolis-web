/*
Copyright (C) 2020  Cloudbase Solutions SRL
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
import * as React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import fieldHelper from "@src/@types/Field";
import { DeploymentItem, ReplicaItem, TransferItem } from "@src/@types/MainItem";
import { MinionPool } from "@src/@types/MinionPool";
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import CopyMultilineValue from "@src/components/ui/CopyMultilineValue";
import CopyValue from "@src/components/ui/CopyValue";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";
import { OptionsSchemaPlugin } from "@src/plugins";
import DateUtils from "@src/utils/DateUtils";
import LabelDictionary from "@src/utils/LabelDictionary";

import type { Endpoint } from "@src/@types/Endpoint";
import type { Field as FieldType } from "@src/@types/Field";
const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  padding-bottom: 48px;
`;
const ColumnsLayout = styled.div<any>`
  display: flex;
`;
const Column = styled.div<any>`
  ${props => ThemeProps.exactWidth(props.width)}
`;
const Row = styled.div<any>`
  margin-bottom: 32px;
  &:last-child {
    margin-bottom: 16px;
  }
`;
const Field = styled.div<any>`
  display: flex;
  flex-direction: column;
`;
const Label = styled.div<any>`
  font-size: 10px;
  color: ${ThemePalette.grayscale[3]};
  font-weight: ${ThemeProps.fontWeights.medium};
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;
const StatusIconStub = styled.div<any>`
  ${ThemeProps.exactSize("16px")}
`;
const Value = styled.div<any>`
  display: ${props =>
    props.flex ? "flex" : props.block ? "block" : "inline-table"};
  margin-top: 3px;
  ${props => (props.capitalize ? "text-transform: capitalize;" : "")}
`;
const ValueLink = styled(Link)`
  display: flex;
  margin-top: 3px;
  color: ${ThemePalette.primary};
  text-decoration: none;
  cursor: pointer;
`;
const PropertiesTable = styled.div<any>``;
const PropertyRow = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;
const PropertyText = css``;
const PropertyName = styled.div<any>`
  ${PropertyText}
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
`;
const PropertyValue = styled.div<any>`
  ${PropertyText}
  color: ${ThemePalette.grayscale[4]};
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(50% + 16px);
  margin-right: -16px;
`;

type Props = {
  item?: MinionPool | null;
  replicas: ReplicaItem[];
  deployments: DeploymentItem[];
  schema: FieldType[];
  schemaLoading: boolean;
  endpoints: Endpoint[];
  bottomControls: React.ReactNode;
};
@observer
class MinionPoolMainDetails extends React.Component<Props> {
  getEndpoint(): Endpoint | undefined {
    const endpoint = this.props.endpoints.find(
      e => e.id === this.props.item?.endpoint_id
    );
    return endpoint;
  }

  renderLastExecutionTime() {
    return this.props.item?.updated_at
      ? this.renderValue(
          DateUtils.getLocalDate(this.props.item.updated_at).toFormat(
            "yyyy-LL-dd HH:mm:ss"
          )
        )
      : "-";
  }

  renderValue(value: string, capitalize?: boolean) {
    return <CopyValue value={value} maxWidth="90%" capitalize={capitalize} />;
  }

  renderEndpointLink(): React.ReactNode {
    const endpointIsMissing = (
      <Value flex>
        <StatusIcon style={{ marginRight: "8px" }} status="ERROR" />
        Endpoint is missing
      </Value>
    );

    const endpoint = this.getEndpoint();

    if (endpoint) {
      return (
        <ValueLink to={`/endpoints/${endpoint.id}`}>{endpoint.name}</ValueLink>
      );
    }

    return endpointIsMissing;
  }

  renderPropertiesTable(propertyNames: string[]) {
    const endpoint = this.getEndpoint();

    const getValue = (name: string, value: any) => {
      if (
        value.join &&
        value.length &&
        value[0].destination &&
        value[0].source
      ) {
        return value
          .map(
            (v: { source: any; destination: any }) =>
              `${v.source}=${v.destination}`
          )
          .join(", ");
      }
      const schema = this.props.schema;
      return fieldHelper.getValueAlias({
        name,
        value,
        fields: schema,
        targetProvider: endpoint && endpoint.type,
      });
    };

    let properties: any[] = [];
    const plugin = endpoint && OptionsSchemaPlugin.for(endpoint.type);
    const deploymentImageMapFieldName =
      plugin && plugin.deploymentImageMapFieldName;
    let dictionaryKey = "";
    if (endpoint) {
      dictionaryKey = `${endpoint.type}-minion-pool`;
    }
    const environment = this.props.item?.environment_options;
    propertyNames.forEach(pn => {
      const value = environment ? environment[pn] : "";
      const label = LabelDictionary.get(pn, dictionaryKey);

      if (value && value.join) {
        value.forEach((v: any, i: number) => {
          const useLabel = i === 0 ? label : "";
          properties.push({ label: useLabel, value: v });
        });
      } else if (value && typeof value === "object") {
        properties = properties.concat(
          Object.keys(value).map(p => {
            if (p === "disk_mappings") {
              return null;
            }
            let fieldName = pn;
            if (
              deploymentImageMapFieldName &&
              fieldName === deploymentImageMapFieldName
            ) {
              fieldName = p;
            }
            return {
              label: `${label} - ${LabelDictionary.get(p)}`,
              value: getValue(fieldName, value[p]),
            };
          })
        );
      } else {
        properties.push({ label, value: getValue(pn, value) });
      }
    });

    return (
      <PropertiesTable>
        {properties
          .filter(Boolean)
          .filter(p => p.value != null && p.value !== "")
          .map(prop => (
            <PropertyRow key={prop.label}>
              <PropertyName>{prop.label}</PropertyName>
              <PropertyValue>
                <CopyValue value={prop.value} />
              </PropertyValue>
            </PropertyRow>
          ))}
      </PropertiesTable>
    );
  }

  renderUsage(items: TransferItem[]) {
    return items.map(item => (
      <div key={item.id}>
        <ValueLink to={`/${item.type}s/${item.id}`}>
          {item.instances[0]}
        </ValueLink>
      </div>
    ));
  }

  renderTable() {
    const endpoint = this.getEndpoint();
    const lastUpdated = this.renderLastExecutionTime();

    const getPropertyNames = () => {
      const env = this.props.item?.environment_options;
      return env
        ? Object.keys(env).filter(
            k =>
              k !== "network_map" &&
              (k !== "storage_mappings" ||
                (env[k] != null &&
                  typeof env[k] === "object" &&
                  Object.keys(env[k]).length > 0))
          )
        : [];
    };

    const usage: TransferItem[] = this.props.replicas.concat(
      this.props.deployments as any[]
    );

    return (
      <ColumnsLayout>
        <Column width="42.5%">
          <Row>
            <Field>
              <Label>Endpoint</Label>
              {this.renderEndpointLink()}
            </Field>
          </Row>
          <Row>
            <EndpointLogos endpoint={(endpoint ? endpoint.type : "") as any} />
          </Row>
          <Row>
            <Field>
              <Label>Id</Label>
              {this.renderValue(this.props.item?.id || "-")}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Pool Platform</Label>
              {this.renderValue(this.props.item?.platform || "-", true)}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Pool OS Type</Label>
              {this.renderValue(this.props.item?.os_type || "-", true)}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Created</Label>
              {this.props.item?.created_at ? (
                this.renderValue(
                  DateUtils.getLocalDate(this.props.item.created_at).toFormat(
                    "yyyy-LL-dd HH:mm:ss"
                  )
                )
              ) : (
                <Value>-</Value>
              )}
            </Field>
          </Row>
          {this.props.item?.notes ? (
            <Row>
              <Field>
                <Label>Notes</Label>
                <CopyMultilineValue value={this.props.item.notes} />
              </Field>
            </Row>
          ) : null}
          {lastUpdated ? (
            <Row>
              <Field>
                <Label>Last Updated</Label>
                <Value>{lastUpdated}</Value>
              </Field>
            </Row>
          ) : null}
          <Row>
            <Field>
              <Label>Used in Transfers ({usage.length})</Label>
              {usage.length > 0 ? this.renderUsage(usage) : <Value>-</Value>}
            </Field>
          </Row>
        </Column>
        <Column width="9.5%" />
        <Column width="48%" style={{ flexGrow: 1 }}>
          {getPropertyNames().length > 0 ? (
            <Row>
              <Field>
                <Label>
                  Environment options{" "}
                  {this.props.schemaLoading ? (
                    <StatusIcon
                      status="RUNNING"
                      style={{ marginLeft: "8px" }}
                    />
                  ) : (
                    <StatusIconStub />
                  )}
                </Label>
                <Value block>
                  {this.renderPropertiesTable(getPropertyNames())}
                </Value>
              </Field>
            </Row>
          ) : null}
          <Row>
            <Field>
              <Label>Minimum Minions</Label>
              <Value>{this.props.item?.minimum_minions || "1"}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Maximum Minions</Label>
              <Value>{this.props.item?.maximum_minions || "1"}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Minion Max Idle Time (s)</Label>
              <Value>{this.props.item?.minion_max_idle_time || "-"}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Minion Retention Strategy</Label>
              <Value>
                {this.props.item?.minion_retention_strategy || "delete"}
              </Value>
            </Field>
          </Row>
        </Column>
      </ColumnsLayout>
    );
  }

  renderBottomControls() {
    return this.props.bottomControls;
  }

  render() {
    return (
      <Wrapper>
        {this.renderTable()}
        {this.renderBottomControls()}
      </Wrapper>
    );
  }
}

export default MinionPoolMainDetails;
