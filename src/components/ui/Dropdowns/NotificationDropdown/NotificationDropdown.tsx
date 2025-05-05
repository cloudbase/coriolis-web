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
import { Link } from "react-router";
import { observer } from "mobx-react";
import styled, { css } from "styled-components";
import autobind from "autobind-decorator";

import { ThemePalette, ThemeProps } from "@src/components/Theme";
import type { NotificationItemData } from "@src/@types/NotificationItem";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";

import bellImage from "./images/bell";
import loadingImage from "./images/loading";

const Wrapper = styled.div<any>`
  cursor: pointer;
  position: relative;
`;
const Icon = styled.div<any>`
  position: relative;
  transition: all ${ThemeProps.animations.swift};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.9;
  }
`;
const BellIcon = styled.div<any>`
  width: 12px;
  height: 17px;
`;
const bellBadgePostion = css`
  position: absolute;
  top: 6px;
  right: 9px;
`;
const Badge = styled.div<any>`
  ${props => (props.isBellBadge ? bellBadgePostion : "")}
  background: ${ThemePalette.primary};
  border-radius: 50%;
  width: 6px;
  height: 6px;
  text-align: center;
`;
const List = styled.div<any>`
  cursor: pointer;
  background: ${ThemePalette.grayscale[1]};
  border-radius: ${ThemeProps.borderRadius};
  width: 272px;
  position: absolute;
  right: 0;
  top: 45px;
  z-index: 10;
  ${ThemeProps.boxShadow}
`;
const ListItemCss = css`
  display: flex;
  border-bottom: 1px solid ${ThemePalette.grayscale[0]};
  padding: 8px;
  transition: all ${ThemeProps.animations.swift};
  justify-content: space-between;
  text-decoration: none;
  color: inherit;

  &:first-child {
    position: relative;
    border-top-left-radius: ${ThemeProps.borderRadius};
    border-top-right-radius: ${ThemeProps.borderRadius};

    &:after {
      content: " ";
      position: absolute;
      width: 10px;
      height: 10px;
      background: ${ThemePalette.grayscale[1]};
      border: 1px solid ${ThemePalette.grayscale[1]};
      border-color: transparent transparent ${ThemePalette.grayscale[1]}
        ${ThemePalette.grayscale[1]};
      transform: rotate(135deg);
      right: 10px;
      top: -6px;
      transition: all ${ThemeProps.animations.swift};
    }
  }

  &:last-child {
    border-color: transparent;
    border-bottom-left-radius: ${ThemeProps.borderRadius};
    border-bottom-right-radius: ${ThemeProps.borderRadius};
  }
`;
const ListItemNoLink = styled.div<any>`
  ${ListItemCss}

  cursor: default;
`;
const ListItem = styled(Link)`
  ${ListItemCss}

  &:hover {
    background: ${ThemePalette.grayscale[0]};
  }

  &:first-child {
    &:hover:after {
      background: ${ThemePalette.grayscale[0]};
      border-color: transparent transparent ${ThemePalette.grayscale[0]}
        ${ThemePalette.grayscale[0]};
    }
  }
`;
export const InfoColumn = styled.div<any>`
  display: flex;
  flex-direction: column;
`;
export const BadgeColumn = styled.div<any>`
  display: flex;
  align-items: center;
  margin: 0 8px;
`;
export const MainItemInfo = styled.div<any>`
  display: flex;
  align-items: center;
  margin-right: -8px;

  & > div {
    margin-right: 8px;
  }
`;
export const ItemTransferBadge = styled.div<any>`
  background: "white";
  color: #7f8795;
  font-size: 9px;
  ${ThemeProps.exactWidth("13px")}
  ${ThemeProps.exactHeight("10px")}
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  border-radius: 2px;
  border: 1px solid #7f8795;
`;
export const ItemTitle = styled.div<any>`
  ${props =>
    props.nowrap ? "white-space: nowrap;" : "word-break: break-word;"}
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const ItemDescription = styled.div<any>`
  color: ${ThemePalette.grayscale[5]};
  font-size: 10px;
  margin-top: 8px;
`;
const NoItems = styled.div<any>`
  text-align: center;
  width: 100%;
`;
const Loading = styled.div<any>`
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  animation: rotate 3s linear infinite;
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export type Props = {
  white?: boolean;
  items: NotificationItemData[];
  onClose: () => void;
};
type State = {
  showDropdownList: boolean;
};
@observer
class NotificationDropdown extends React.Component<Props, State> {
  state = {
    showDropdownList: false,
  };

  itemMouseDown: boolean | undefined;

  componentDidMount() {
    window.addEventListener("mousedown", this.handlePageClick, false);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.handlePageClick, false);
  }

  handleItemClick() {
    this.setState({ showDropdownList: false });
    this.props.onClose();
  }

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      if (this.state.showDropdownList) {
        this.props.onClose();
      }
      this.setState({ showDropdownList: false });
    }
  }

  handleButtonClick() {
    if (this.state.showDropdownList) {
      this.props.onClose();
    }

    this.setState(prevState => ({
      showDropdownList: !prevState.showDropdownList,
    }));
  }

  renderNoItems() {
    if (
      !this.state.showDropdownList ||
      (this.props.items && this.props.items.length > 0)
    ) {
      return null;
    }

    return (
      <List>
        <ListItemNoLink
          onMouseDown={() => {
            this.itemMouseDown = true;
          }}
          onMouseUp={() => {
            this.itemMouseDown = false;
          }}
        >
          <NoItems>There are no notifications</NoItems>
        </ListItemNoLink>
      </List>
    );
  }

  renderList() {
    if (
      !this.state.showDropdownList ||
      !this.props.items ||
      this.props.items.length === 0
    ) {
      return null;
    }

    const list = (
      <List>
        {this.props.items.map(item => {
          const typeUrl =
            item.type === "deployment" ? "deployments" : "transfers";

          const executionsPath =
            item.status === "RUNNING"
              ? item.type === "transfer"
                ? "/executions"
                : item.type === "deployment"
                  ? "/tasks"
                  : ""
              : "";

          return (
            <ListItem
              key={item.id}
              onMouseDown={() => {
                this.itemMouseDown = true;
              }}
              onMouseUp={() => {
                this.itemMouseDown = false;
              }}
              onClick={() => {
                this.handleItemClick();
              }}
              to={`/${typeUrl}/${item.id}${executionsPath}`}
            >
              <InfoColumn>
                <MainItemInfo>
                  <StatusIcon status={item.status} hollow />
                  <ItemTransferBadge type={item.type}>
                    {item.type === "transfer" ? "TR" : "DE"}
                  </ItemTransferBadge>
                  <ItemTitle>{item.name}</ItemTitle>
                </MainItemInfo>
                <ItemDescription>{item.description}</ItemDescription>
              </InfoColumn>
              {item.unseen ? (
                <BadgeColumn>
                  <Badge />
                </BadgeColumn>
              ) : null}
            </ListItem>
          );
        })}
      </List>
    );

    return list;
  }

  renderBell() {
    const isLoading = Boolean(
      this.props.items.find(i => i.status === "RUNNING"),
    );

    return (
      <Icon
        onMouseDown={() => {
          this.itemMouseDown = true;
        }}
        onMouseUp={() => {
          this.itemMouseDown = false;
        }}
        onClick={() => this.handleButtonClick()}
      >
        <BellIcon
          dangerouslySetInnerHTML={{
            __html: bellImage(
              this.props.white ? "white" : ThemePalette.grayscale[2],
            ),
          }}
        />
        {this.props.items.find(i => i.unseen) ? <Badge isBellBadge /> : null}
        {isLoading ? (
          <Loading
            dangerouslySetInnerHTML={{ __html: loadingImage(this.props.white) }}
          />
        ) : null}
      </Icon>
    );
  }

  render() {
    return (
      <Wrapper>
        {this.renderBell()}
        {this.renderList()}
        {this.renderNoItems()}
      </Wrapper>
    );
  }
}

export default NotificationDropdown;
