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
import styled from "styled-components";
import { observer } from "mobx-react";

import Button from "@src/components/ui/Button";
import type { Project } from "@src/@types/Project";
import { ThemePalette, ThemeProps } from "@src/components/Theme";

import projectImage from "./images/project.svg";

const Content = styled.div<any>`
  display: flex;
  align-items: center;
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

  &:last-child ${Content} {
    border-bottom: 1px solid ${ThemePalette.grayscale[1]};
  }
`;
const Image = styled.div<any>`
  min-width: 48px;
  height: 48px;
  background: url("${projectImage}") no-repeat center;
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
const Subtitle = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  margin-top: 3px;
`;
const ItemLabel = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
`;
const ItemValue = styled.div<any>`
  color: ${ThemePalette.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const bodyWidth = 620;
const Body = styled.div<any>`
  ${ThemeProps.exactWidth(`${bodyWidth}px`)}
  display: flex;
`;
const Data = styled.div<any>`
  ${props =>
    ThemeProps.exactWidth(
      `${Math.floor(bodyWidth / (100 / props.percentage)) - 68}px`
    )}
  margin: 0 32px;

  &:last-child {
    margin-right: 0;
  }
`;

type Props = {
  item: Project;
  onClick: () => void;
  getMembers: (projectId: string) => number;
  isCurrentProject: (projectId: string) => boolean;
  onSwitchProjectClick: (projectId: string) => void | Promise<void>;
};
@observer
class ProjectListItem extends React.Component<Props> {
  render() {
    const isCurrentProject = this.props.isCurrentProject(this.props.item.id);

    return (
      <Wrapper>
        <Content onClick={this.props.onClick}>
          <Image />
          <Title>
            <TitleLabel>{this.props.item.name}</TitleLabel>
            <Subtitle>{this.props.item.description}</Subtitle>
          </Title>
          <Body>
            <Data percentage={33}>
              <ItemLabel>Members</ItemLabel>
              <ItemValue>{this.props.getMembers(this.props.item.id)}</ItemValue>
            </Data>
            <Data percentage={33}>
              <ItemLabel>Enabled</ItemLabel>
              <ItemValue>{this.props.item.enabled ? "Yes" : "No"}</ItemValue>
            </Data>
            <Data percentage={34}>
              <Button
                width="160px"
                secondary
                hollow
                onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                }}
                onMouseUp={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                }}
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  if (e) e.stopPropagation();
                  this.props.onSwitchProjectClick(this.props.item.id);
                }}
                disabled={isCurrentProject}
              >
                {isCurrentProject ? "Current" : "Switch"}
              </Button>
            </Data>
          </Body>
        </Content>
      </Wrapper>
    );
  }
}

export default ProjectListItem;
