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
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import autobind from 'autobind-decorator'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import { navigationMenu } from '../../../constants'
import type { User } from '../../../@types/User'

import userImage from './images/user.svg'
import userWhiteImage from './images/user-white.svg'
import openInNewImage from './images/openInNewImage'
import configLoader from '../../../utils/Config'

const Wrapper = styled.div<any>`
  position: relative;
`
const Icon = styled.div<any>`
  position: relative;
  cursor: pointer;
  width: 32px;
  height: 32px;
  transition: all ${StyleProps.animations.swift};
  background: url('${props => (props.white ? userWhiteImage : userImage)}') no-repeat center;

  &:hover {
    opacity: 0.8;
  }
`
const Help = styled.div`
  display: flex;
  align-items: center;
`
const OpenInNewIcon = styled.div`
  ${StyleProps.exactSize('16px')}
  position: relative;
  top: -2px;
  transform: scale(0.6);
`
const List = styled.div<any>`
  background: ${Palette.grayscale[1]};
  border-radius: ${StyleProps.borderRadius};
  position: absolute;
  right: 0;
  top: 45px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  z-index: 10;
  ${StyleProps.boxShadow}
`
const ListItem = styled.div<any>`
  padding-top: 8px;
`

const Label = styled.div<{selectable?: boolean, hoverColor?: string}>`
  display: inline-block;
  white-space: nowrap;
  ${props => (props.selectable ? css`
    cursor: pointer;
    &:hover {
      color: ${props.hoverColor};
      svg {
        fill: ${props.hoverColor};
      }
    }
  ` : '')}
`

const ListHeader = styled.div<any>`
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
const Username = styled(Link)`
  font-size: 16px;
  color: ${Palette.black};
  text-decoration: none;
  ${props => (props.to === '' ? 'pointer-events: none;' : '')}
  &:hover {color: ${Palette.primary};}
`
const Email = styled.div<any>`
  font-size: 10px;
  color: ${Palette.grayscale[4]};
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${Palette.grayscale[3]};
`

type DictItem = { label: React.ReactNode, value: string }
type Props = {
  onItemClick: (item: DictItem) => void,
  user: User | null | undefined,
  white?: boolean,
  className?: string
}
type State = {
  showDropdownList: boolean,
}
@observer
class UserDropdown extends React.Component<Props, State> {
  state = {
    showDropdownList: false,
  }

  itemMouseDown: boolean | undefined

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

    if (item.value === 'help') {
      window.open('https://cloudbase.it/coriolis-overview/', '_blank')
    }
  }

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    this.setState(prevState => ({ showDropdownList: !prevState.showDropdownList }))
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

    let href: string | undefined
    const isAdmin = this.props.user.isAdmin
    if (isAdmin && navigationMenu.find(m => m.value === 'users'
      && !configLoader.config.disabledPages.find(p => p === 'users') && (!m.requiresAdmin || isAdmin))) {
      href = `/users/${this.props.user.id}`
    }

    return (
      <ListHeader
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
      >
        <Username
          data-test-id="userDropdown-username"
          to={href || ''}
        >{this.props.user.name}
        </Username>
        <Email>{this.props.user.email}</Email>
      </ListHeader>
    )
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null
    }

    const items: DictItem[] = [
      {
        label: 'About Coriolis',
        value: 'about',
      },
      {
        label: (
          <Help>
            Help
            <OpenInNewIcon dangerouslySetInnerHTML={{ __html: openInNewImage() }} />
          </Help>
        ),
        value: 'help',
      },
      {
        label: 'Sign Out',
        value: 'signout',
      },
    ]
    const list = (
      <List>
        <ListHeader>
          {this.renderListHeader()}
          {this.renderNoUser()}
        </ListHeader>
        {this.props.user ? items.map(item => (
          <ListItem
            key={item.value}
            onMouseDown={() => { this.itemMouseDown = true }}
            onMouseUp={() => { this.itemMouseDown = false }}
          >
            <Label
              selectable
              onClick={() => { this.handleItemClick(item) }}
              hoverColor={item.value !== 'signout' ? Palette.primary : Palette.alert}
            >{item.label}
            </Label>
          </ListItem>
        )) : null}
      </List>
    )

    return list
  }

  render() {
    return (
      <Wrapper className={this.props.className}>
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
