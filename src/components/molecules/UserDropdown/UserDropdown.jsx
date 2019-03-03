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
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import autobind from 'autobind-decorator'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import { navigationMenu } from '../../../config'
import type { User } from '../../../types/User'
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
  padding-top: 8px;
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
const Username = styled.a`
  font-size: 16px;
  color: ${Palette.black};
  text-decoration: none;
  &:hover {
    color: ${props => props.href ? Palette.primary : 'inherit'};
  }
`
const Email = styled.div`
  font-size: 10px;
  color: ${Palette.grayscale[4]};
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${Palette.grayscale[3]};
`


type DictItem = { label: string, value: string }
type Props = {
  onItemClick: (item: DictItem) => void,
  user: ?User,
  white?: boolean,
}
type State = {
  showDropdownList: boolean,
}
@observer
class UserDropdown extends React.Component<Props, State> {
  state = {
    showDropdownList: false,
  }

  itemMouseDown: boolean

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

  @autobind
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

    let href: ?string
    let isAdmin = this.props.user.isAdmin
    if (isAdmin && navigationMenu.find(m => m.value === 'users' && !m.disabled && (!m.requiresAdmin || isAdmin))) {
      href = `#/user/${this.props.user.id}`
    }

    return (
      <ListHeader
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
      >
        <Username
          data-test-id="userDropdown-username"
          href={href}
        >{this.props.user.name}</Username>
        <Email>{this.props.user.email}</Email>
      </ListHeader>
    )
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null
    }

    let items = [{
      label: 'About Coriolis',
      value: 'about',
    }, {
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
              <Label selectable onClick={() => { this.handleItemClick(item) }} data-test-id={`userDropdown-label-${item.value}`}>{item.label}</Label>
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
          data-test-id="userDropdown-button"
        />
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default UserDropdown
