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

import { Instance } from "@src/@types/Instance";
import TaskItem from "@src/components/modules/TransferModule/TaskItem";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";

import type { Task } from "@src/@types/Task";
const COLUMN_WIDTHS = ["26%", "18%", "36%", "20%"];

const Wrapper = styled.div<any>``;
const ContentWrapper = styled.div`
  background: ${ThemePalette.grayscale[1]};
`;
const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px;
`;
const Header = styled.div<any>`
  display: flex;
  border-bottom: 1px solid ${ThemePalette.grayscale[5]};
  padding: 4px 8px;
`;
const HeaderData = styled.div<any>`
  width: ${props => props.width};
  font-size: 10px;
  color: ${ThemePalette.grayscale[5]};
  font-weight: ${ThemeProps.fontWeights.medium};
  text-transform: uppercase;
`;
const Body = styled.div<any>``;

type Props = {
  items: Task[];
  instancesDetails: Instance[];
  loading?: boolean;
};
type State = {
  openedItems: Task[];
};
@observer
class Tasks extends React.Component<Props, State> {
  state: State = {
    openedItems: [],
  };

  dragStartPosition: { x: number; y: number } | null = null;

  UNSAFE_componentWillMount() {
    this.UNSAFE_componentWillReceiveProps(this.props);
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    this.setState(prevState => {
      let openedItems = prevState.openedItems;

      props.items.forEach(item => {
        if (item.status === "RUNNING") {
          openedItems.push(item);
          return;
        }

        // Close items that were previously in RUNNING state, but they no longer are
        const oldItem = this.props.items.find(i => i.id === item.id);
        if (oldItem && oldItem.status === "RUNNING") {
          openedItems = openedItems.filter(i => i.id !== oldItem.id);
        }
      });

      return { openedItems };
    });
  }

  get isLoading() {
    return this.props.loading || this.props.items.length === 0;
  }

  handleItemMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    this.dragStartPosition = { x: e.screenX, y: e.screenY };
  }

  handleItemMouseUp(e: React.MouseEvent<HTMLDivElement>, item: Task) {
    this.dragStartPosition = this.dragStartPosition || {
      x: e.screenX,
      y: e.screenY,
    };

    if (
      this.dragStartPosition &&
      Math.abs(this.dragStartPosition.x - e.screenX) < 3 &&
      Math.abs(this.dragStartPosition.y - e.screenY) < 3
    ) {
      this.toggleItem(item);
    }

    this.dragStartPosition = null;
  }

  handleDependsOnClick(id: string) {
    const item = this.props.items.find(i => i.id === id);
    if (item) this.toggleItem(item);
  }

  toggleItem(item: Task) {
    this.setState(prevState => {
      let openedItems = prevState.openedItems;
      if (openedItems.find(i => i.id === item.id)) {
        openedItems = openedItems.filter(i => i.id !== item.id);
      } else {
        openedItems = openedItems.filter(i => i.status === "RUNNING");
        openedItems.push(item);
      }

      return { openedItems };
    });
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage loading />
      </LoadingWrapper>
    );
  }

  renderHeader() {
    return (
      <Header>
        <HeaderData width={COLUMN_WIDTHS[0]}>Task</HeaderData>
        <HeaderData width={COLUMN_WIDTHS[1]}>Instance</HeaderData>
        <HeaderData width={COLUMN_WIDTHS[2]}>Latest Message</HeaderData>
        <HeaderData width={COLUMN_WIDTHS[3]}>Timestamp</HeaderData>
      </Header>
    );
  }

  renderBody() {
    return (
      <Body>
        {this.props.items.map(item => (
          <TaskItem
            onMouseDown={e => this.handleItemMouseDown(e)}
            onMouseUp={e => this.handleItemMouseUp(e, item)}
            key={item.id}
            item={item}
            otherItems={this.props.items.filter(i => i.id !== item.id)}
            instancesDetails={this.props.instancesDetails}
            columnWidths={COLUMN_WIDTHS}
            open={Boolean(this.state.openedItems.find(i => i.id === item.id))}
            onDependsOnClick={id => {
              this.handleDependsOnClick(id);
            }}
          />
        ))}
      </Body>
    );
  }

  renderContent() {
    return (
      <ContentWrapper>
        {this.renderHeader()}
        {this.renderBody()}
      </ContentWrapper>
    );
  }

  render() {
    return (
      <Wrapper>
        {!this.isLoading ? this.renderContent() : null}
        {this.isLoading ? this.renderLoading() : null}
      </Wrapper>
    );
  }
}

export default Tasks;
