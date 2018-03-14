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

// @flow

import React from 'react'
import styled from 'styled-components'
import moment from 'moment'

import type { NotificationItem } from '../../../types/NotificationItem'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import bellImage from './images/bell.js'
import errorImage from './images/error.svg'
import infoImage from './images/info.svg'
import successImage from './images/success.svg'

const Wrapper = styled.div`
  cursor: pointer;
  position: relative;
`
const Icon = styled.div`
  position: relative;
  transition: all ${StyleProps.animations.swift};

  &:hover {
    opacity: 0.9;
  }
`
const BellIcon = styled.div``
const Badge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: ${Palette.primary};
  border-radius: 50%;
  width: 14px;
  height: 14px;
  text-align: center;
`
const BadgeLabel = styled.div`
  margin-top: 2px;
  font-size: 10px;
  color: white;
  font-weight: ${StyleProps.fontWeights.medium};
`
const List = styled.div`
  cursor: pointer;
  background: ${Palette.grayscale[1]};
  border-radius: ${StyleProps.borderRadius};
  width: 224px;
  position: absolute;
  right: 0;
  top: 45px;
  z-index: 10;
`
const ListItem = styled.div`
  display: flex;
  border-bottom: 1px solid ${Palette.grayscale[0]};
  flex-direction: column;
  padding: 8px;
  transition: all ${StyleProps.animations.swift};

  &:hover {
    background: ${Palette.grayscale[0]};
  }

  &:first-child {
    position: relative;
    border-top-left-radius: ${StyleProps.borderRadius};
    border-top-right-radius: ${StyleProps.borderRadius};

    &:hover:after {
      background: ${Palette.grayscale[0]};
      border-color: transparent transparent ${Palette.grayscale[0]} ${Palette.grayscale[0]};
    }

    &:after {
      content: ' ';
      position: absolute;
      width: 10px;
      height: 10px;
      background: ${Palette.grayscale[1]};
      border: 1px solid ${Palette.grayscale[1]};
      border-color: transparent transparent ${Palette.grayscale[1]} ${Palette.grayscale[1]};
      transform: rotate(135deg);
      right: 10px;
      top: -6px;
      transition: all ${StyleProps.animations.swift};
    }
  }

  &:last-child {
    border-color: transparent;
    border-bottom-left-radius: ${StyleProps.borderRadius};
    border-bottom-right-radius: ${StyleProps.borderRadius};
  }
`
const Title = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;
`

const getTypeIcon = level => {
  if (level === 'success') {
    return successImage
  }
  if (level === 'error') {
    return errorImage
  }
  return infoImage
}
const TypeIcon = styled.div`
  width: 16px;
  height: 16px;
  background: url('${props => getTypeIcon(props.level)}') no-repeat center;
  margin-right: 8px;
`
const TitleLabel = styled.div`flex-grow: 1;`
const Time = styled.div`color: ${Palette.grayscale[4]};`
const Description = styled.div``
const NoItems = styled.div`
  text-align: center;
`

type Props = {
  white?: boolean,
  items: NotificationItem[],
  onClose: () => void,
}
type State = {
  showDropdownList: boolean,
}
class NotificationDropdown extends React.Component<Props, State> {
  itemMouseDown: boolean

  constructor() {
    super()

    this.state = {
      showDropdownList: false,
    }

    // $FlowIssue
    this.handlePageClick = this.handlePageClick.bind(this)
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
  }

  handleItemClick() {
    this.setState({ showDropdownList: false })
    this.props.onClose()
  }

  handlePageClick() {
    if (!this.itemMouseDown) {
      if (this.state.showDropdownList) {
        this.props.onClose()
      }
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    if (this.state.showDropdownList) {
      this.props.onClose()
    }

    this.setState({ showDropdownList: !this.state.showDropdownList })
  }

  renderNoItems() {
    if (!this.state.showDropdownList || (this.props.items && this.props.items.length > 0)) {
      return null
    }

    return (
      <List>
        <ListItem
          onMouseDown={() => { this.itemMouseDown = true }}
          onMouseUp={() => { this.itemMouseDown = false }}
        >
          <NoItems>There are no notifications</NoItems>
        </ListItem>
      </List>
    )
  }

  renderList() {
    if (!this.state.showDropdownList || !this.props.items || this.props.items.length === 0) {
      return null
    }

    let list = (
      <List>
        {this.props.items.map(item => {
          let title = (item.options && item.options.persistInfo && item.options.persistInfo.title) || item.message
          let message = title === item.message ? '' : item.message

          return (
            <ListItem
              key={item.id}
              onMouseDown={() => { this.itemMouseDown = true }}
              onMouseUp={() => { this.itemMouseDown = false }}
              onClick={() => { this.handleItemClick() }}
            >
              <Title>
                <TypeIcon level={item.level} />
                <TitleLabel>{title}</TitleLabel>
                <Time>{moment(Number(item.id)).format('HH:mm')}</Time>
              </Title>
              <Description>{message}</Description>
            </ListItem>
          )
        })}
      </List>
    )

    return list
  }
  renderBell() {
    let badge = this.props.items && this.props.items.length >= 1 ? (
      <Badge>
        <BadgeLabel>{this.props.items.length}</BadgeLabel>
      </Badge>
    ) : null

    return (
      <Icon
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
        onClick={() => this.handleButtonClick()}
      >
        <BellIcon
          dangerouslySetInnerHTML={{ __html: bellImage(this.props.white ? 'white' : Palette.grayscale[2]) }}
        />
        {badge}
      </Icon>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderBell()}
        {this.renderList()}
        {this.renderNoItems()}
      </Wrapper>
    )
  }
}

export default NotificationDropdown
