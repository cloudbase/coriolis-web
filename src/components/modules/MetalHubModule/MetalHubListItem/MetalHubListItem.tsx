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

import { MetalHubServer } from "@src/@types/MetalHub";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Checkbox from "@src/components/ui/Checkbox";
import StatusPill from "@src/components/ui/StatusComponents/StatusPill";
import DateUtils from "@src/utils/DateUtils";

import serverImage from "./images/server.svg";

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
  background: url("${serverImage}") no-repeat center;
  margin-right: 16px;
`;
const Title = styled.div`
  flex-grow: 1;
  overflow: hidden;
  margin-right: 48px;
  min-width: 100px;
`;
const TitleLabel = styled.div`
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
const ItemLabel = styled.div`
  color: ${ThemePalette.grayscale[4]};
`;
const ItemValue = styled.div`
  color: ${ThemePalette.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Body = styled.div`
  ${ThemeProps.exactWidth("642px")}
  display: flex;
`;
const Data = styled.div<{ width: number }>`
  min-width: ${props => props.width}px;
  margin: 0 32px;

  &:last-child {
    margin-right: 0;
  }
`;

type Props = {
  item: MetalHubServer;
  selected: boolean;
  onSelectedChange: (value: boolean) => void;
  onClick: () => void;
};
@observer
class MetalHubServerListItem extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        <CheckboxStyled
          checked={this.props.selected}
          onChange={this.props.onSelectedChange}
        />
        <Content onClick={this.props.onClick}>
          <Image />
          <Title>
            <TitleLabel>{this.props.item.hostname || "No Hostname"}</TitleLabel>
            {this.props.item.active ? (
              <StatusPill
                style={{ marginTop: "4px" }}
                status="COMPLETED"
                label="Active"
              />
            ) : (
              <StatusPill
                style={{ marginTop: "4px" }}
                status="ERROR"
                label="Inactive"
              />
            )}
          </Title>
          <Body>
            <Data width={210}>
              <ItemLabel>API Endpoint</ItemLabel>
              <ItemValue>{this.props.item.api_endpoint}</ItemValue>
            </Data>
            <Data width={145}>
              <ItemLabel>Created At</ItemLabel>
              <ItemValue>
                {DateUtils.getLocalDate(this.props.item.created_at).toFormat(
                  "yyyy-LL-dd HH:mm:ss"
                )}
              </ItemValue>
            </Data>
            <Data width={145}>
              <ItemLabel>Updated At</ItemLabel>
              <ItemValue>
                {DateUtils.getLocalDate(this.props.item.updated_at).toFormat(
                  "yyyy-LL-dd HH:mm:ss"
                )}
              </ItemValue>
            </Data>
          </Body>
        </Content>
      </Wrapper>
    );
  }
}

export default MetalHubServerListItem;
