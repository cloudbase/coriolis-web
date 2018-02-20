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

import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { TaskItem } from 'components'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const ColumnWidths = ['26%', '18%', '36%', '20%']

const Wrapper = styled.div`
  background: ${Palette.grayscale[1]};
`
const Header = styled.div`
  display: flex;
  border-bottom: 1px solid ${Palette.grayscale[5]};
  padding: 4px 8px;
`
const HeaderData = styled.div`
  width: ${props => props.width};
  font-size: 10px;
  color: ${Palette.grayscale[5]};
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
`
const Body = styled.div``

class Tasks extends React.Component {
  static propTypes = {
    items: PropTypes.array,
  }

  constructor() {
    super()

    this.state = {
      openedItems: [],
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(props) {
    let openedItems = this.state.openedItems

    props.items.forEach(item => {
      if (item.status === 'RUNNING') {
        openedItems.push(item)
        return
      }

      // Close items that were previously in RUNNING state, but they no longer are
      let oldItem = this.props.items.find(i => i.id === item.id)
      if (oldItem && oldItem.status === 'RUNNING') {
        openedItems = openedItems.filter(i => i.id !== oldItem.id)
      }
    })

    this.setState({ openedItems })
  }

  handleItemMouseDown(e) {
    this.dragStartPosition = { x: e.screenX, y: e.screenY }
  }

  handleItemMouseUp(e, item) {
    this.dragStartPosition = this.dragStartPosition || { x: e.screenX, y: e.screenY }

    if (Math.abs(this.dragStartPosition.x - e.screenX) < 3 && Math.abs(this.dragStartPosition.y - e.screenY) < 3) {
      this.toggleItem(item)
    }

    this.dragStartPosition = null
  }

  handleDependsOnClick(id) {
    let item = this.props.items.find(i => i.id === id)
    this.toggleItem(item)
  }

  toggleItem(item) {
    let openedItems = this.state.openedItems
    if (openedItems.find(i => i.id === item.id)) {
      openedItems = openedItems.filter(i => i.id !== item.id)
    } else {
      openedItems = openedItems.filter(item => item.status === 'RUNNING')
      openedItems.push(item)
    }

    this.setState({ openedItems })
  }

  renderHeader() {
    return (
      <Header>
        <HeaderData width={ColumnWidths[0]}>Task</HeaderData>
        <HeaderData width={ColumnWidths[1]}>Instance</HeaderData>
        <HeaderData width={ColumnWidths[2]}>Latest Message</HeaderData>
        <HeaderData width={ColumnWidths[3]}>Timestamp</HeaderData>
      </Header>
    )
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
            columnWidths={ColumnWidths}
            open={Boolean(this.state.openedItems.find(i => i.id === item.id))}
            onDependsOnClick={id => { this.handleDependsOnClick(id) }}
          />
        ))}
      </Body>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderHeader()}
        {this.renderBody()}
      </Wrapper>
    )
  }
}

export default Tasks
