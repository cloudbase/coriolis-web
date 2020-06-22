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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import StatusIcon from '../../../../atoms/StatusIcon'
import StatusImage from '../../../../atoms/StatusImage'
import Button from '../../../../atoms/Button'
import {
  InfoColumn, MainItemInfo, ItemReplicaBadge, ItemTitle, ItemDescription,
} from '../../../../molecules/NotificationDropdown'

import Palette from '../../../../styleUtils/Palette'
import StyleProps from '../../../../styleUtils/StyleProps'

import type { NotificationItemData } from '../../../../../@types/NotificationItem'

import replicaImage from './images/replica.svg'

const Wrapper = styled.div<any>`
  flex-grow: 1;
`
const Title = styled.div<any>`
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
  margin-bottom: 12px;
`
const Module = styled.div<any>`
  background: ${Palette.grayscale[0]};
  display: flex;
  overflow: hidden;
  border-radius: ${StyleProps.borderRadius};
  height: 273px;
`
const LoadingWrapper = styled.div<any>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`
const List = styled.div<any>`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`
const ListItem = styled(Link)`
  padding: 8px 16px 8px 16px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: all ${StyleProps.animations.swift};

  &:hover {
    background: ${Palette.grayscale[1]};
  }
`
const NoItems = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const ReplicaImage = styled.div<any>`
  ${StyleProps.exactSize('148px')}
  background: url('${replicaImage}') center no-repeat;
`
const Message = styled.div<any>`
  text-align: center;
  margin-bottom: 32px;
`

type Props = {
  notificationItems: NotificationItemData[],
  style: any,
  loading: boolean,
  large: boolean,
  onNewClick: () => void,
}
@observer
class ActivityModule extends React.Component<Props> {
  renderList() {
    return (
      <List>
        {this.props.notificationItems
          .filter((_, i) => i < (this.props.large ? 10 : 5)).map((item, i) => {
            const executionsHref = item.status === 'RUNNING' ? item.type === 'replica' ? '/executions' : item.type === 'migration' ? '/tasks' : '' : ''

            return (
              <ListItem
                key={item.id}
                to={`/${item.type}${executionsHref}/${item.id}`}
                style={{
                  width: `calc(${this.props.large ? 50 : 100}% - 32px)`,
                  paddingTop: (i === 0 || i === 5) ? '16px' : '8px',
                }}
              >
                <InfoColumn>
                  <MainItemInfo>
                    <StatusIcon status={item.status} hollow />
                    <ItemReplicaBadge
                      type={item.type}
                    >{item.type === 'replica' ? 'RE' : 'MI'}
                    </ItemReplicaBadge>
                    <ItemTitle nowrap>{item.name}</ItemTitle>
                  </MainItemInfo>
                  <ItemDescription>{item.description}</ItemDescription>
                </InfoColumn>
              </ListItem>
            )
          })}
      </List>
    )
  }

  renderNoItems() {
    return (
      <NoItems>
        <ReplicaImage />
        <Message>There is no recent activity<br />in this project.</Message>
        <Button
          hollow
          primary
          transparent
          onClick={this.props.onNewClick}
        >New Replica / Migration
        </Button>
      </NoItems>
    )
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage status="RUNNING" />
      </LoadingWrapper>
    )
  }

  render() {
    return (
      <Wrapper style={this.props.style}>
        <Title>Recent Activity</Title>
        <Module>
          {this.props.notificationItems.length === 0 && this.props.loading
            ? this.renderLoading() : this.props.notificationItems.length
              ? this.renderList() : this.renderNoItems()}
        </Module>
      </Wrapper>
    )
  }
}

export default ActivityModule
