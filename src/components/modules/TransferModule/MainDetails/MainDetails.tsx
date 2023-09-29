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
import * as React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import fieldHelper from "@src/@types/Field";
import { TransferItem } from "@src/@types/MainItem";
import { MinionPool } from "@src/@types/MinionPool";
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import TransferDetailsTable from "@src/components/modules/TransferModule/TransferDetailsTable";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import CopyValue from "@src/components/ui/CopyValue";
import PasswordValue from "@src/components/ui/PasswordValue";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import DateUtils from "@src/utils/DateUtils";
import LabelDictionary from "@src/utils/LabelDictionary";

import arrowImage from "./images/arrow.svg";

import type { Instance } from "@src/@types/Instance";
import type { Endpoint, StorageBackend } from "@src/@types/Endpoint";
import type { Network } from "@src/@types/Network";
import type { Field as FieldType } from "@src/@types/Field";
const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  padding-bottom: 48px;
`;
const WarningWrapper = styled.div`
  display: flex;
  background: ${ThemePalette.warning}66;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 24px;
  align-items: center;
`;
const WarningText = styled.div`
  margin-left: 8px;
`;
const ColumnsLayout = styled.div<any>`
  display: flex;
`;
const Column = styled.div<any>`
  ${props => ThemeProps.exactWidth(props.width)}
`;
const Arrow = styled.div<any>`
  width: 34px;
  height: 24px;
  background: url("${arrowImage}") center no-repeat;
  margin-top: 84px;
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
const Loading = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
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
  item?: TransferItem | null;
  minionPools: MinionPool[];
  storageBackends: StorageBackend[];
  destinationSchema: FieldType[];
  destinationSchemaLoading: boolean;
  sourceSchema: FieldType[];
  sourceSchemaLoading: boolean;
  instancesDetails: Instance[];
  instancesDetailsLoading: boolean;
  endpoints: Endpoint[];
  networks?: Network[];
  bottomControls: React.ReactNode;
  loading: boolean;
};
type State = {
  showPassword: string[];
};
@observer
class MainDetails extends React.Component<Props, State> {
  state = {
    showPassword: [],
  };

  getSourceEndpoint(): Endpoint | undefined {
    const endpoint = this.props.endpoints.find(
      e => this.props.item && e.id === this.props.item.origin_endpoint_id
    );
    return endpoint;
  }

  getDestinationEndpoint(): Endpoint | undefined {
    const endpoint = this.props.endpoints.find(
      e => this.props.item && e.id === this.props.item.destination_endpoint_id
    );
    return endpoint;
  }

  renderLastExecutionTime() {
    return this.props.item
      ? this.renderValue(
          DateUtils.getLocalDate(this.props.item.updated_at).toFormat(
            "yyyy-LL-dd HH:mm:ss"
          )
        )
      : "-";
  }

  renderValue(value: string) {
    return <CopyValue value={value} maxWidth="90%" />;
  }

  renderEndpointLink(type: string): React.ReactNode {
    const endpointIsMissing = (
      <Value flex>
        <StatusIcon style={{ marginRight: "8px" }} status="ERROR" />
        Endpoint is missing
      </Value>
    );

    const endpoint =
      type === "source"
        ? this.getSourceEndpoint()
        : this.getDestinationEndpoint();

    if (endpoint) {
      return (
        <ValueLink to={`/endpoints/${endpoint.id}`}>{endpoint.name}</ValueLink>
      );
    }

    return endpointIsMissing;
  }

  renderPropertiesTable(
    propertyNames: string[],
    type: "source" | "destination"
  ) {
    const endpoint =
      type === "source"
        ? this.getSourceEndpoint()
        : this.getDestinationEndpoint();

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
      const schema =
        type === "source"
          ? this.props.sourceSchema
          : this.props.destinationSchema;
      return fieldHelper.getValueAlias({
        name,
        value,
        fields: schema,
        targetProvider: endpoint && endpoint.type,
      });
    };

    let properties: any[] = [];
    let dictionaryKey = "";
    if (endpoint) {
      dictionaryKey = `${endpoint.type}-${type}`;
    }
    const environment =
      this.props.item &&
      (type === "source"
        ? this.props.item.source_environment
        : this.props.item.destination_environment);
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
            if (p === "disk_mappings" || p === "backend_mappings") {
              return null;
            }
            return {
              label: `${label} - ${LabelDictionary.get(p)}`,
              value: getValue(p, value[p]),
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
                {prop.label.toLowerCase().indexOf("password") > -1 &&
                !this.state.showPassword.find(
                  f => f === `${prop.label}-${type}`
                ) ? (
                  <PasswordValue
                    value={prop.value}
                    onShow={() =>
                      this.setState(prevState => ({
                        showPassword: [
                          ...prevState.showPassword,
                          `${prop.label}-${type}`,
                        ],
                      }))
                    }
                  />
                ) : (
                  <CopyValue value={prop.value} />
                )}
              </PropertyValue>
            </PropertyRow>
          ))}
      </PropertiesTable>
    );
  }

  renderTable() {
    if (this.props.loading) {
      return null;
    }
    const sourceEndpoint = this.getSourceEndpoint();
    const destinationEndpoint = this.getDestinationEndpoint();
    const lastUpdated = this.renderLastExecutionTime();

    const getPropertyNames = (type: "source" | "destination") => {
      const env =
        this.props.item &&
        (type === "source"
          ? this.props.item.source_environment
          : this.props.item.destination_environment);
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

    const sourceMinionPool = this.props.minionPools.find(
      m => m.id === this.props.item?.origin_minion_pool_id
    );
    const destMinionPool = this.props.minionPools.find(
      m => m.id === this.props.item?.destination_minion_pool_id
    );

    return (
      <ColumnsLayout>
        <Column width="42.5%">
          <Row>
            <Field>
              <Label>Source</Label>
              {this.renderEndpointLink("source")}
            </Field>
          </Row>
          <Row>
            <EndpointLogos
              endpoint={(sourceEndpoint ? sourceEndpoint.type : "") as any}
            />
          </Row>
          {getPropertyNames("source").length > 0 ? (
            <Row>
              <Field>
                <Label>
                  Properties
                  {this.props.sourceSchemaLoading ? (
                    <StatusIcon
                      status="RUNNING"
                      style={{ marginLeft: "8px" }}
                    />
                  ) : (
                    <StatusIconStub />
                  )}
                </Label>
                <Value block>
                  {this.renderPropertiesTable(
                    getPropertyNames("source"),
                    "source"
                  )}
                </Value>
              </Field>
            </Row>
          ) : null}
          <Row>
            <Field>
              <Label>Id</Label>
              {this.renderValue(
                this.props.item ? this.props.item.id || "-" : "-"
              )}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Created</Label>
              {this.props.item && this.props.item.created_at ? (
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
          {lastUpdated ? (
            <Row>
              <Field>
                <Label>Last Updated</Label>
                <Value>{lastUpdated}</Value>
              </Field>
            </Row>
          ) : null}
          {this.props.item?.origin_minion_pool_id ? (
            <Row>
              <Field>
                <Label>Source Minion Pool</Label>
                {sourceMinionPool ? (
                  <ValueLink to={`/minion-pools/${sourceMinionPool.id}`}>
                    {sourceMinionPool.name}
                  </ValueLink>
                ) : (
                  <Value>{this.props.item.origin_minion_pool_id}</Value>
                )}
              </Field>
            </Row>
          ) : null}
          {this.props.item?.type === "migration" &&
          this.props.item.replica_id ? (
            <Row>
              <Field>
                <Label>Created from Replica</Label>
                <ValueLink to={`/replicas/${this.props.item.replica_id}`}>
                  {this.props.item.replica_id}
                </ValueLink>
              </Field>
            </Row>
          ) : null}
        </Column>
        <Column width="9.5%">
          <Arrow />
        </Column>
        <Column width="48%" style={{ flexGrow: 1 }}>
          <Row>
            <Field>
              <Label>Target</Label>
              {this.renderEndpointLink("target")}
            </Field>
          </Row>
          <Row>
            <EndpointLogos
              endpoint={
                (destinationEndpoint ? destinationEndpoint.type : "") as any
              }
            />
          </Row>
          {getPropertyNames("destination").length > 0 ? (
            <Row>
              <Field>
                <Label>
                  Properties
                  {this.props.destinationSchemaLoading ? (
                    <StatusIcon
                      status="RUNNING"
                      style={{ marginLeft: "8px" }}
                    />
                  ) : (
                    <StatusIconStub />
                  )}
                </Label>
                <Value block>
                  {this.renderPropertiesTable(
                    getPropertyNames("destination"),
                    "destination"
                  )}
                </Value>
              </Field>
            </Row>
          ) : null}
          {this.props.item?.destination_minion_pool_id ? (
            <Row>
              <Field>
                <Label>Target Minion Pool</Label>
                {destMinionPool ? (
                  <ValueLink to={`/minion-pools/${destMinionPool.id}`}>
                    {destMinionPool.name}
                  </ValueLink>
                ) : (
                  <Value>{this.props.item.destination_minion_pool_id}</Value>
                )}
              </Field>
            </Row>
          ) : null}
        </Column>
      </ColumnsLayout>
    );
  }

  renderBottomControls() {
    if (this.props.loading) {
      return null;
    }

    return this.props.bottomControls;
  }

  renderLoading() {
    if (!this.props.loading && !this.props.instancesDetailsLoading) {
      return null;
    }

    return (
      <Loading>
        <StatusImage loading />
      </Loading>
    );
  }

  renderSpecialError() {
    if (this.props.item?.last_execution_status !== "ERROR_ALLOCATING_MINIONS") {
      return null;
    }

    return (
      <WarningWrapper>
        <StatusIcon status="ERROR" />
        <WarningText>
          There was an error allocating minion machines for this{" "}
          {this.props.item.type}. Please review the log events for the selected
          minion pool(s) and the logs of the Coriolis Minion Manager component
          for full details.
        </WarningText>
      </WarningWrapper>
    );
  }

  render() {
    return (
      <Wrapper>
        {this.renderSpecialError()}
        {this.renderTable()}
        {this.props.instancesDetailsLoading || this.props.loading ? null : (
          <TransferDetailsTable
            item={this.props.item}
            minionPools={this.props.minionPools}
            instancesDetails={this.props.instancesDetails}
            networks={this.props.networks}
            storageBackends={this.props.storageBackends}
          />
        )}
        {this.renderLoading()}
        {this.renderBottomControls()}
      </Wrapper>
    );
  }
}

export default MainDetails;
