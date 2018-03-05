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
import styled, { css } from 'styled-components'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import userImage from './images/user.svg'
import userWhiteImage from './images/user-white.svg'

const Wrapper = styled.div`
  position: relative;
`
const Icon = styled.div`
  position: relative;
  cursor: pointer;
  width: 32px;
  height: 32px;
  transition: all ${StyleProps.animations.swift};
  background: url('${props => props.white ? userWhiteImage : userImage}') no-repeat center;

  &:hover {
    opacity: 0.8;
  }
`
const List = styled.div`
  background: ${Palette.grayscale[1]};
  border-radius: ${StyleProps.borderRadius};
  position: absolute;
  right: 0;
  top: 45px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  z-index: 10;
`
const ListItem = styled.div`
  padding: 8px 0;

  &:last-child {
    padding-bottom: 0;
  }
`

const Label = styled.div`
  display: inline-block;
  white-space: nowrap;
  ${props => props.selectable ? css`
    cursor: pointer;
    &:hover {
      color: ${Palette.primary};
    }
  ` : ''}
`

const ListHeader = styled.div`
  position: relative;

  &:after {
    content: ' ';
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${Palette.grayscale[1]};
    border: 1px solid ${Palette.grayscale[1]};
    border-color: transparent transparent ${Palette.grayscale[1]} ${Palette.grayscale[1]};
    transform: rotate(135deg);
    right: -6px;
    top: -22px;
    transition: all ${StyleProps.animations.swift};
  }
`
const Username = styled.div`
  font-size: 16px;
`
const Email = styled.div`
  font-size: 10px;
  color: ${Palette.grayscale[4]};
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${Palette.grayscale[3]};
`

type User = { name: string, email: string }
type DictItem = { label: string, value: string }
type Props = {
  onItemClick: (item: DictItem) => void,
  user: User,
  white?: boolean,
}
type State = {
  showDropdownList: boolean,
}
class UserDropdown extends React.Component<Props, State> {
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

  handleItemClick(item: DictItem) {
    if (this.props.onItemClick) {
      this.props.onItemClick(item)
    }

    this.setState({ showDropdownList: false })
  }

  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    this.setState({ showDropdownList: !this.state.showDropdownList })
  }

  renderNoUser() {
    if (this.props.user) {
      return null
    }

    return <Label>No signed in user</Label>
  }

  renderListHeader() {
    if (!this.props.user) {
      return null
    }
    return (
      <ListHeader>
        <Username>{this.props.user.name}</Username>
        <Email>{this.props.user.email}</Email>
      </ListHeader>
    )
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null
    }

    let items = [{
      label: 'Sign Out',
      value: 'signout',
    }]
    let list = (
      <List>
        <ListHeader>
          {this.renderListHeader()}
          {this.renderNoUser()}
        </ListHeader>
        {this.props.user ? items.map(item => {
          return (
            <ListItem
              key={item.value}
              onMouseDown={() => { this.itemMouseDown = true }}
              onMouseUp={() => { this.itemMouseDown = false }}
            >
              <Label selectable onClick={() => { this.handleItemClick(item) }}>{item.label}</Label>
            </ListItem>
          )
        }) : null}
      </List>
    )

    return list
  }
  render() {
    return (
      <Wrapper {...this.props}>
        <Icon
          onMouseDown={() => { this.itemMouseDown = true }}
          onMouseUp={() => { this.itemMouseDown = false }}
          onClick={() => this.handleButtonClick()}
          white={this.props.white}
        />
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default UserDropdown
