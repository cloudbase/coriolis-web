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
import { Collapse } from "react-collapse";
import styled, { createGlobalStyle, css } from "styled-components";

import { Instance } from "@src/@types/Instance";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Arrow from "@src/components/ui/Arrow";
import CopyButton from "@src/components/ui/CopyButton";
import CopyValue from "@src/components/ui/CopyValue";
import ProgressBar from "@src/components/ui/ProgressBar";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";
import StatusPill from "@src/components/ui/StatusComponents/StatusPill";
import DateUtils from "@src/utils/DateUtils";
import DomUtils from "@src/utils/DomUtils";

import type { ProgressUpdate, Task } from "@src/@types/Task";
const GlobalStyle = createGlobalStyle`
  .ReactCollapse--collapse {
    transition: height 0.4s ease-in-out;
  }
`;
const Wrapper = styled.div<any>`
  cursor: pointer;
  border-bottom: 1px solid white;
  transition: all ${ThemeProps.animations.swift};
  ${props => (props.open ? `background: ${ThemePalette.grayscale[0]};` : "")}
  &:hover {
    background: ${ThemePalette.grayscale[0]};
  }
`;
const ArrowStyled = styled(Arrow)`
  position: absolute;
  left: -24px;
`;
const Header = styled.div<any>`
  display: flex;
  padding: 8px;
  position: relative;
  &:hover ${ArrowStyled} {
    opacity: 1;
  }
`;
const HeaderData = styled.div<any>`
  display: block;
  ${props => (props.capitalize ? "text-transform: capitalize;" : "")}
  width: ${props => props.width};
  color: ${props =>
    props.black ? ThemePalette.black : ThemePalette.grayscale[4]};
  padding-right: 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
`;
const Title = styled.div<any>`
  display: flex;
`;
const TitleText = styled.div<any>`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
const Body = styled.div<any>`
  display: flex;
  flex-direction: column;
  padding: 24px 8px;
`;
const Columns = styled.div<any>`
  display: flex;
`;
const Column = styled.div<any>`
  display: flex;
  flex-direction: column;
`;
const Row = styled.div<any>`
  display: flex;
  margin-bottom: 24px;
`;
const RowData = styled.div<any>`
  ${props =>
    props.width
      ? css`
          min-width: ${props.width};
        `
      : ""}
  ${props =>
    !props.skipPaddingLeft
      ? css`
          &:first-child {
            padding-left: 24px;
            min-width: calc(${props.width} + 21px);
          }
        `
      : ""}
`;
const Label = styled.div<any>`
  text-transform: uppercase;
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  color: ${ThemePalette.grayscale[5]};
  margin-bottom: 4px;
`;
const Value = styled.div<any>`
  ${props =>
    props.width
      ? css`
          width: ${props.width};
        `
      : ""}
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  ${props =>
    props.primary
      ? css`
          color: ${ThemePalette.primary};
        `
      : ""}
  &:hover {
    ${props =>
      props.primaryOnHover
        ? css`
            color: ${ThemePalette.primary};
          `
        : ""}
  }
`;
const DependsOnIds = styled.div<any>`
  display: flex;
  flex-direction: column;
  text-transform: capitalize;
`;
const ExceptionText = styled.div<any>`
  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre-line;
  &:hover > span {
    opacity: 1;
  }
  > span {
    background-position-y: 4px;
    margin-left: 4px;
  }
`;
const ProgressUpdates = styled.div<any>`
  color: ${ThemePalette.black};
`;
const ProgressUpdateDiv = styled.div<any>`
  display: flex;
  color: ${props => (props.secondary ? ThemePalette.grayscale[5] : "inherit")};
`;
const ProgressUpdateDate = styled.div<any>`
  min-width: ${props => props.width || "auto"};
  white-space: pre-line;
  & > span {
    margin-left: 24px;
  }
`;
const ProgressUpdateValue = styled.div<any>`
  width: 100%;
  margin-right: 32px;
  word-break: break-word;
`;

const getName = (taskType?: string) =>
  taskType
    ? taskType
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b(?:os)\b/gi, "OS")
    : "N/A";

type Props = {
  columnWidths: string[];
  item: Task;
  otherItems: Task[];
  open: boolean;
  instancesDetails: Instance[];
  onDependsOnClick: (id: string) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
};
@observer
class TaskItem extends React.Component<Props> {
  getLastMessage() {
    let message;
    const progressUpdates = this.props.item.progress_updates;
    if (progressUpdates.length) {
      message = progressUpdates[progressUpdates.length - 1].message;
    } else {
      message = "-";
    }

    return message;
  }

  getProgressPercentage(
    progressUpdate: ProgressUpdate
  ): { useLabel: boolean; value: number } | null {
    if (progressUpdate.total_steps && progressUpdate.current_step) {
      const currentStep = Math.min(
        progressUpdate.total_steps,
        progressUpdate.current_step
      );
      return {
        value: Math.round((currentStep * 100) / progressUpdate.total_steps),
        useLabel: true,
      };
    }

    const stringPercentage = progressUpdate.message.match(
      /.*progress.*?(100|\d{1,2})%/
    )?.[1];
    if (!stringPercentage) {
      return null;
    }
    return {
      value: Number(stringPercentage),
      useLabel: false,
    };
  }

  handleExceptionTextClick(exceptionText: string) {
    DomUtils.copyTextToClipboard(
      exceptionText,
      "The message has been copied to clipboard",
      "Failed to copy the message to clipboard"
    );
  }

  renderHeader(status: string) {
    const date = this.props.item.updated_at
      ? this.props.item.updated_at
      : this.props.item.created_at;

    const instance = this.props.instancesDetails.find(
      i => i.id === this.props.item.instance
    );
    const instanceName =
      instance?.instance_name || instance?.name || this.props.item.instance;

    // get the last '/' path from instance name
    const instanceLabel =
      instanceName.indexOf("/") > -1
        ? `.../${instanceName.substring(instanceName.lastIndexOf("/") + 1)}`
        : instanceName;

    return (
      <Header>
        <HeaderData capitalize width={this.props.columnWidths[0]} black>
          <Title>
            <StatusIcon status={status} style={{ marginRight: "8px" }} />
            <TitleText>{getName(this.props.item.task_type)}</TitleText>
          </Title>
        </HeaderData>
        <HeaderData title={instanceName} width={this.props.columnWidths[1]}>
          {instanceLabel}
        </HeaderData>
        <HeaderData width={this.props.columnWidths[2]}>
          {this.getLastMessage()}
        </HeaderData>
        <HeaderData width={this.props.columnWidths[3]}>
          {date
            ? DateUtils.getLocalDate(date).toFormat("yyyy-LL-dd HH:mm:ss")
            : "-"}
        </HeaderData>
        <ArrowStyled
          primary
          orientation={this.props.open ? "up" : "down"}
          opacity={this.props.open ? 1 : 0}
          thick
        />
      </Header>
    );
  }

  renderDependsOnValue() {
    const { depends_on: dependsOn } = this.props.item;
    if (!dependsOn || !dependsOn.length || !dependsOn.find(Boolean)) {
      return <Value>N/A</Value>;
    }

    return (
      <DependsOnIds>
        {dependsOn.map(id =>
          id ? (
            <Value
              key={id}
              width="140px"
              primaryOnHover
              textEllipsis
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                this.props.onDependsOnClick(id);
              }}
              onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
              }}
              onMouseUp={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
              }}
            >
              {getName(
                this.props.otherItems.find(item => item.id === id)?.task_type
              )}
            </Value>
          ) : null
        )}
      </DependsOnIds>
    );
  }

  renderProgressUpdates() {
    const naValue = <Value style={{ marginLeft: "24px" }}>N/A</Value>;
    if (!this.props.item.progress_updates.length) {
      return naValue;
    }

    return (
      <ProgressUpdates>
        {this.props.item.progress_updates.map((update, i) => {
          if (!update) {
            return <Value key={i}>N/A</Value>;
          }
          const progressPercentage = this.getProgressPercentage(update);

          return (
            // eslint-disable-next-line react/no-array-index-key
            <ProgressUpdateDiv
              key={i}
              secondary={
                i < this.props.item.progress_updates.length - 1 ||
                this.props.item.status !== "RUNNING"
              }
            >
              <ProgressUpdateDate width={this.props.columnWidths[0]}>
                <span>
                  {DateUtils.getLocalDate(update.created_at).toFormat(
                    "yyyy-LL-dd HH:mm:ss"
                  )}
                </span>
              </ProgressUpdateDate>
              <ProgressUpdateValue>
                {update.message}
                {progressPercentage && (
                  <ProgressBar
                    style={{ margin: "8px 0" }}
                    progress={progressPercentage.value}
                    useLabel={progressPercentage.useLabel}
                  />
                )}
              </ProgressUpdateValue>
            </ProgressUpdateDiv>
          );
        })}
      </ProgressUpdates>
    );
  }

  renderExceptionDetails() {
    const exceptionsText =
      this.props.item.exception_details?.length > 0
        ? this.props.item.exception_details
        : null;

    let valueField;
    if (!exceptionsText) {
      valueField = <Value>N/A</Value>;
    } else {
      valueField = (
        <ExceptionText
          onClick={(e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            this.handleExceptionTextClick(exceptionsText);
          }}
          onMouseDown={(e: { stopPropagation: () => void }) => {
            e.stopPropagation();
          }}
          onMouseUp={(e: { stopPropagation: () => void }) => {
            e.stopPropagation();
          }}
        >
          {exceptionsText}
          <CopyButton />
        </ExceptionText>
      );
    }

    return valueField;
  }

  renderBody(status: string) {
    const { columnWidths } = this.props;
    return (
      <Collapse isOpened={this.props.open}>
        <Body>
          <Columns>
            <Column
              style={{
                minWidth: `calc(${columnWidths[0]} + ${columnWidths[1]} + ${columnWidths[2]} - 16px)`,
                paddingRight: "16px",
              }}
            >
              <Row>
                <RowData width={columnWidths[0]}>
                  <Label>Status</Label>
                  <StatusPill small status={status} />
                </RowData>
                <RowData
                  width={`calc(${columnWidths[1]} + ${columnWidths[2]})`}
                >
                  <Label>ID</Label>
                  <CopyValue value={this.props.item.id} width="auto" />
                </RowData>
              </Row>
              <Row>
                <RowData style={{ width: "calc(100% - 24px)" }}>
                  <Label>Exception Details</Label>
                  {this.renderExceptionDetails()}
                </RowData>
              </Row>
            </Column>
            <Column style={{ minWidth: columnWidths[3] }}>
              <RowData skipPaddingLeft>
                <Label>Depends on</Label>
                {this.renderDependsOnValue()}
              </RowData>
            </Column>
          </Columns>
          <Row style={{ marginBottom: 0 }}>
            <RowData width="100%">
              <Label>Progress Updates</Label>
            </RowData>
          </Row>
          {this.renderProgressUpdates()}
        </Body>
      </Collapse>
    );
  }

  render() {
    const status = this.props.item.progress_updates.some(update =>
      update.message.startsWith("WARNING")
    )
      ? "WARNING"
      : this.props.item.status;
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Wrapper {...this.props}>
        <GlobalStyle />
        {this.renderHeader(status)}
        {this.renderBody(status)}
      </Wrapper>
    );
  }
}

export default TaskItem;
