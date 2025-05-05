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
import React from "react";
import styled from "styled-components";

import { MinionPool } from "@src/@types/MinionPool";
import { ProviderTypes } from "@src/@types/Providers";
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Checkbox from "@src/components/ui/Checkbox";
import StatusPill from "@src/components/ui/StatusComponents/StatusPill";
import DateUtils from "@src/utils/DateUtils";

import itemImage from "./images/minion-pool-list-item.svg";

const CheckboxStyled = styled(Checkbox)`
  opacity: ${props => (props.checked ? 1 : 0)};
  transition: all ${ThemeProps.animations.swift};
`;
const Content = styled.div<any>`
  display: flex;
  align-items: center;
  margin-left: 16px;
  border-top: 1px solid ${ThemePalette.grayscale[1]};
  padding: 8px 16px;
  cursor: pointer;
  flex-grow: 1;
  transition: all ${ThemeProps.animations.swift};
  min-width: 785px;

  &:hover {
    background: ${ThemePalette.grayscale[1]};
  }
`;
const Wrapper = styled.div<any>`
  display: flex;
  align-items: center;

  &:hover ${CheckboxStyled} {
    opacity: 1;
  }

  &:last-child ${Content} {
    border-bottom: 1px solid ${ThemePalette.grayscale[1]};
  }
`;

const Image = styled.div`
  min-width: 48px;
  height: 48px;
  background: url("${itemImage}") no-repeat center;
  margin-right: 16px;
`;
const Title = styled.div<any>`
  flex-grow: 1;
  overflow: hidden;
  margin-right: 48px;
  min-width: 100px;
`;
const TitleLabel = styled.div<any>`
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
const StatusWrapper = styled.div<any>`
  display: flex;
  margin-top: 8px;
`;
const EndpointImage = styled.div<any>`
  display: flex;
  align-items: center;
  margin-right: 48px;
`;
const ItemLabel = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
`;
const ItemValue = styled.div<any>`
  color: ${ThemePalette.primary};
`;
const Column = styled.div`
  align-self: start;
`;

type Props = {
  item: MinionPool;
  onClick: () => void;
  selected: boolean;
  endpointType: (endpointId: string) => ProviderTypes | string;
  onSelectedChange: (value: boolean) => void;
};
@observer
class MinionPoolListItem extends React.Component<Props> {
  getStatus() {
    return this.props.item.status;
  }

  renderCreationDate() {
    return (
      <Column
        style={{ minWidth: "170px", maxWidth: "170px", marginRight: "25px" }}
      >
        <ItemLabel>Created</ItemLabel>
        <ItemValue>
          {DateUtils.getLocalDate(this.props.item.created_at).toFormat(
            "dd LLLL yyyy, HH:mm",
          )}
        </ItemValue>
      </Column>
    );
  }

  renderUpdateDate() {
    return (
      <Column
        style={{ minWidth: "170px", maxWidth: "170px", marginRight: "25px" }}
      >
        <ItemLabel>Updated</ItemLabel>
        <ItemValue>
          {this.props.item.updated_at
            ? DateUtils.getLocalDate(this.props.item.updated_at).toFormat(
                "dd LLLL yyyy, HH:mm",
              )
            : "-"}
        </ItemValue>
      </Column>
    );
  }

  renderCreatedCount() {
    const createdCount = this.props.item.minion_machines.filter(
      m =>
        m.allocation_status === "IN_USE" || m.allocation_status === "AVAILABLE",
    ).length;
    const totalCount = this.props.item.minion_machines.length;

    return (
      <Column style={{ minWidth: "150px", maxWidth: "150px" }}>
        <ItemLabel>Allocated</ItemLabel>
        <ItemValue
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {createdCount} of {totalCount} machines
          <br />({this.props.item.maximum_minions} maximum)
        </ItemValue>
      </Column>
    );
  }

  render() {
    const endpointType = this.props.endpointType(this.props.item.endpoint_id);
    const endpointImage = (
      <EndpointImage>
        <EndpointLogos height={42} endpoint={endpointType} />
      </EndpointImage>
    );
    const status = this.getStatus();

    return (
      <Wrapper>
        <CheckboxStyled
          checked={this.props.selected}
          onChange={this.props.onSelectedChange}
        />
        <Content onClick={this.props.onClick}>
          <Image />
          <Title>
            <TitleLabel>{this.props.item.name}</TitleLabel>
            <StatusWrapper>
              {status ? (
                <StatusPill status={status} style={{ marginRight: "8px" }} />
              ) : null}
            </StatusWrapper>
          </Title>
          {endpointImage}
          {this.renderCreationDate()}
          {this.renderUpdateDate()}
          {this.renderCreatedCount()}
        </Content>
      </Wrapper>
    );
  }
}

export default MinionPoolListItem;
