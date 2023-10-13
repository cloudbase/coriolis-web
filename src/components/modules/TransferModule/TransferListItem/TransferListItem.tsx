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
import styled from "styled-components";

import { getTransferItemTitle, TransferItem } from "@src/@types/MainItem";
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Checkbox from "@src/components/ui/Checkbox";
import StatusPill from "@src/components/ui/StatusComponents/StatusPill";
import DateUtils from "@src/utils/DateUtils";

import arrowImage from "./images/arrow.svg";
import scheduleImage from "./images/schedule.svg";

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

const Image = styled.div<any>`
  min-width: 48px;
  height: 48px;
  background: url("${props => props.image}") no-repeat center;
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
const ScheduleImage = styled.div<any>`
  ${ThemeProps.exactSize("16px")}
  background: url('${scheduleImage}') center no-repeat;
`;
const EndpointsImages = styled.div<any>`
  display: flex;
  align-items: center;
  margin-right: 48px;
`;
const EndpointImageArrow = styled.div<any>`
  width: 16px;
  height: 16px;
  margin: 0 16px;
  background: url("${arrowImage}") center no-repeat;
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
  item: TransferItem;
  onClick: () => void;
  selected: boolean;
  image: string;
  showScheduleIcon?: boolean;
  endpointType: (endpointId: string) => string;
  getUserName: (userId: string) => string | undefined;
  userNameLoading: boolean;
  onSelectedChange: (value: boolean) => void;
};
@observer
class TransferListItem extends React.Component<Props> {
  getStatus() {
    return this.props.item.last_execution_status;
  }

  renderCreationDate() {
    return (
      <Column
        style={{ minWidth: "170px", maxWidth: "170px", marginRight: "25px" }}
      >
        <ItemLabel>Created</ItemLabel>
        <ItemValue>
          {DateUtils.getLocalDate(this.props.item.created_at).toFormat(
            "dd LLLL yyyy, HH:mm"
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
                "dd LLLL yyyy, HH:mm"
              )
            : "-"}
        </ItemValue>
      </Column>
    );
  }

  renderUser() {
    return (
      <Column style={{ minWidth: "115px", maxWidth: "115px" }}>
        <ItemLabel>User</ItemLabel>
        <ItemValue
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {this.props.userNameLoading
            ? "Loading..."
            : this.props.getUserName(this.props.item.user_id) ||
              this.props.item.user_id}
        </ItemValue>
      </Column>
    );
  }

  render() {
    const sourceType = this.props.endpointType(
      this.props.item.origin_endpoint_id
    );
    const destinationType = this.props.endpointType(
      this.props.item.destination_endpoint_id
    );
    const endpointImages = (
      <EndpointsImages>
        <EndpointLogos height={32} endpoint={sourceType as any} />
        <EndpointImageArrow />
        <EndpointLogos height={32} endpoint={destinationType as any} />
      </EndpointsImages>
    );
    const status = this.getStatus();

    return (
      <Wrapper>
        <CheckboxStyled
          checked={this.props.selected}
          onChange={this.props.onSelectedChange}
        />
        <Content onClick={this.props.onClick}>
          <Image image={this.props.image} />
          <Title>
            <TitleLabel>{getTransferItemTitle(this.props.item)}</TitleLabel>
            <StatusWrapper>
              {status ? (
                <StatusPill status={status} style={{ marginRight: "8px" }} />
              ) : null}
              {this.props.showScheduleIcon ? (
                <ScheduleImage data-tip="The Replica has scheduling enabled and will execute automatically" />
              ) : null}
            </StatusWrapper>
          </Title>
          {endpointImages}
          {this.renderCreationDate()}
          {this.renderUpdateDate()}
          {this.renderUser()}
        </Content>
      </Wrapper>
    );
  }
}

export default TransferListItem;
