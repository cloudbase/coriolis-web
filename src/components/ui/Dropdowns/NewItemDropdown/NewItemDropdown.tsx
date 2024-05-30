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
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import styled from "styled-components";
import autobind from "autobind-decorator";

import DropdownButton from "@src/components/ui/Dropdowns/DropdownButton";

import { ThemePalette, ThemeProps } from "@src/components/Theme";
import userStore from "@src/stores/UserStore";
import configLoader from "@src/utils/Config";

import { navigationMenu } from "@src/constants";
import migrationImage from "./images/migration.svg";
import replicaImage from "./images/replica.svg";
import endpointImage from "./images/endpoint.svg";
import userImage from "./images/user.svg";
import projectImage from "./images/project.svg";
import minionPoolImage from "./images/minion-pool.svg";

const ICON_MAP = {
  migration: migrationImage,
  replica: replicaImage,
  endpoint: endpointImage,
  minionPool: minionPoolImage,
  user: userImage,
  project: projectImage,
};

const Wrapper = styled.div<any>`
  position: relative;
`;
const List = styled.div<any>`
  cursor: pointer;
  background: ${ThemePalette.grayscale[1]};
  border-radius: ${ThemeProps.borderRadius};
  width: 240px;
  position: absolute;
  right: 0;
  top: 45px;
  z-index: 10;
  ${ThemeProps.boxShadow}
`;
const ListItem = styled(Link)`
  display: flex;
  align-items: center;
  border-bottom: 1px solid white;
  transition: all ${ThemeProps.animations.swift};
  text-decoration: none;
  color: ${ThemePalette.black};
  &:hover {
    background: ${ThemePalette.grayscale[0]};
  }
  &:last-child {
    border-bottom-left-radius: ${ThemeProps.borderRadius};
    border-bottom-right-radius: ${ThemeProps.borderRadius};
  }
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
    &:hover:after {
      background: ${ThemePalette.grayscale[0]};
      border: 1px solid ${ThemePalette.grayscale[0]};
      border-color: transparent transparent ${ThemePalette.grayscale[0]}
        ${ThemePalette.grayscale[0]};
    }
  }
`;

const Icon = styled.div<{ iconName: keyof typeof ICON_MAP }>`
  min-width: 48px;
  height: 48px;
  background: url("${props => ICON_MAP[props.iconName]}") no-repeat center;
  margin: 16px;
`;
const Content = styled.div<any>`
  padding-right: 16px;
`;
const Title = styled.div<any>`
  font-size: 16px;
  margin-bottom: 8px;
`;
const Description = styled.div<any>`
  font-size: 12px;
  color: ${ThemePalette.grayscale[4]};
`;

export type ItemType = {
  href?: string;
  iconName: keyof typeof ICON_MAP;
  title: string;
  description: string;
  value?: string;
  disabled?: boolean;
  requiresAdmin?: boolean;
};
type Props = {
  onChange: (item: ItemType) => void;
};
type State = {
  showDropdownList: boolean;
};
@observer
class NewItemDropdown extends React.Component<Props, State> {
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

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false });
    }
  }

  handleButtonClick() {
    this.setState(prev => ({ showDropdownList: !prev.showDropdownList }));
  }

  handleItemClick(item: ItemType) {
    this.setState({ showDropdownList: false });

    if (this.props.onChange) {
      this.props.onChange(item);
    }
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null;
    }

    const isAdmin = userStore.loggedUser ? userStore.loggedUser.isAdmin : false;
    const disabledPages = configLoader.config
      ? configLoader.config.disabledPages
      : [];
    const items: ItemType[] = [
      // {
      //   title: "Migration",
      //   href: "/wizard/migration",
      //   description: "Migrate VMs between two clouds",
      //   iconName: "migration",
      // },
      // {
      //   title: "Deployment",
      //   href: "/wizard/deployment",
      //   description: "Deploy an already synced Replica or Live Migration",
      //   iconName: "replica",
      // },
      {
        title: "Transfer",
        href: "/wizard/replica",
        description: "Incrementally transfer VMs between two clouds",
        iconName: "replica",
      },
      {
        title: "Endpoint",
        value: "endpoint",
        description: "Add connection information for a cloud",
        iconName: "endpoint",
      },
      {
        title: "Minion Pool",
        value: "minionPool",
        description: "Create a new Coriolis Minion Pool",
        iconName: "minionPool",
      },
      {
        title: "User",
        value: "user",
        description: "Create a new Coriolis user",
        iconName: "user",
        disabled: Boolean(
          navigationMenu.find(
            i =>
              i.value === "users" &&
              (disabledPages.find(p => p === "users") ||
                (i.requiresAdmin && !isAdmin))
          )
        ),
      },
      {
        title: "Project",
        value: "project",
        description: "Create a new Coriolis project",
        iconName: "project",
        disabled: Boolean(
          navigationMenu.find(
            i =>
              i.value === "projects" &&
              (disabledPages.find(p => p === "users") ||
                (i.requiresAdmin && !isAdmin))
          )
        ),
      },
    ];

    const list = (
      <List>
        {items
          .filter(i =>
            i.disabled ? !i.disabled : i.requiresAdmin ? isAdmin : true
          )
          .map(item => (
            <ListItem
              key={item.title}
              onMouseDown={() => {
                this.itemMouseDown = true;
              }}
              onMouseUp={() => {
                this.itemMouseDown = false;
              }}
              to={item.href || "#"}
              onClick={() => {
                this.handleItemClick(item);
              }}
            >
              <Icon iconName={item.iconName} />
              <Content>
                <Title>{item.title}</Title>
                <Description>{item.description}</Description>
              </Content>
            </ListItem>
          ))}
      </List>
    );

    return list;
  }

  render() {
    return (
      <Wrapper>
        <DropdownButton
          onMouseDown={() => {
            this.itemMouseDown = true;
          }}
          onMouseUp={() => {
            this.itemMouseDown = false;
          }}
          onClick={() => this.handleButtonClick()}
          value="New"
          primary
          centered
        />
        {this.renderList()}
      </Wrapper>
    );
  }
}

export default NewItemDropdown;
