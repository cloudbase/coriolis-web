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
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import autobind from 'autobind-decorator'

import DropdownButton from '../../atoms/DropdownButton'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import userStore from '../../../stores/UserStore'

import migrationImage from './images/migration.svg'
import replicaImage from './images/replica.svg'
import endpointImage from './images/endpoint.svg'
import userImage from './images/user.svg'
import projectImage from './images/project.svg'

import { navigationMenu } from '../../../config'

const Wrapper = styled.div`
  position: relative;
`
const List = styled.div`
  cursor: pointer;
  background: ${Palette.grayscale[1]};
  border-radius: ${StyleProps.borderRadius};
  width: 240px;
  position: absolute;
  right: 0;
  top: 45px;
  z-index: 10;
`
const ListItem = styled(Link)`
  display: flex;
  align-items: center;
  border-bottom: 1px solid white;
  transition: all ${StyleProps.animations.swift};
  text-decoration: none;
  color: ${Palette.black};
  &:hover {
    background: ${Palette.grayscale[0]};
  }
  &:last-child {
    border-bottom-left-radius: ${StyleProps.borderRadius};
    border-bottom-right-radius: ${StyleProps.borderRadius};
  }
  &:first-child {
    position: relative;
    border-top-left-radius: ${StyleProps.borderRadius};
    border-top-right-radius: ${StyleProps.borderRadius};
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
    &:hover:after {
      background: ${Palette.grayscale[0]};
      border: 1px solid ${Palette.grayscale[0]};
      border-color: transparent transparent ${Palette.grayscale[0]} ${Palette.grayscale[0]};
    }
  }
`

const getIcon = props => {
  if (props.migration) {
    return migrationImage
  }
  if (props.replica) {
    return replicaImage
  }
  if (props.user) {
    return userImage
  }
  if (props.project) {
    return projectImage
  }
  return endpointImage
}

const Icon = styled.div`
  min-width: 48px;
  height: 48px;
  background: url('${props => getIcon(props)}') no-repeat center;
  margin: 16px;
`
const Content = styled.div`
  padding-right: 16px;
`
const Title = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
`
const Description = styled.div`
  font-size: 12px;
  color: ${Palette.grayscale[4]};
`

export type ItemType = {
  href?: string,
  icon: { migration?: boolean, replica?: boolean, endpoint?: boolean },
  title: string,
  description: string,
  value?: string,
  disabled?: boolean,
  requiresAdmin?: boolean,
}
type Props = {
  onChange: (item: ItemType) => void,
}
type State = {
  showDropdownList: boolean,
}
@observer
class NewItemDropdown extends React.Component<Props, State> {
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

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    this.setState({ showDropdownList: !this.state.showDropdownList })
  }

  handleItemClick(item: ItemType) {
    this.setState({ showDropdownList: false })

    if (this.props.onChange) {
      this.props.onChange(item)
    }
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null
    }

    const isAdmin = userStore.loggedUser ? userStore.loggedUser.isAdmin : false
    let items: ItemType[] = [{
      title: 'Migration',
      href: '/wizard/migration',
      description: 'Migrate VMs between two clouds',
      icon: { migration: true },
    }, {
      title: 'Replica',
      href: '/wizard/replica',
      description: 'Incrementally replicate VMs between two clouds',
      icon: { replica: true },
    }, {
      title: 'Endpoint',
      value: 'endpoint',
      description: 'Add connection information for a cloud',
      icon: { endpoint: true },
    }, {
      title: 'User',
      value: 'user',
      description: 'Create a new Coriolis user',
      icon: { user: true },
      disabled: Boolean(navigationMenu.find(i => i.value === 'users' && (i.disabled || (i.requiresAdmin && !isAdmin)))),
    }, {
      title: 'Project',
      value: 'project',
      description: 'Create a new Coriolis project',
      icon: { project: true },
      disabled: Boolean(navigationMenu.find(i => i.value === 'projects' && (i.disabled || (i.requiresAdmin && !isAdmin)))),
    }]

    let list = (
      <List>
        {
          items.filter(i => i.disabled ? !i.disabled : i.requiresAdmin ? isAdmin : true).map(item => {
            return (
              <ListItem
                data-test-id={`newItemDropdown-listItem-${item.title}`}
                key={item.title}
                onMouseDown={() => { this.itemMouseDown = true }}
                onMouseUp={() => { this.itemMouseDown = false }}
                to={item.href || '#'}
                onClick={() => { this.handleItemClick(item) }}
              >
                <Icon {...item.icon} />
                <Content>
                  <Title>{item.title}</Title>
                  <Description>{item.description}</Description>
                </Content>
              </ListItem>
            )
          })}
      </List>
    )

    return list
  }

  render() {
    return (
      <Wrapper>
        <DropdownButton
          data-test-id="newItemDropdown-button"
          onMouseDown={() => { this.itemMouseDown = true }}
          onMouseUp={() => { this.itemMouseDown = false }}
          onClick={() => this.handleButtonClick()}
          value="New"
          primary
          centered
        />
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default NewItemDropdown
