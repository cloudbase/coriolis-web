/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
import styled from 'styled-components'
import { observer } from 'mobx-react'

import { ThemePalette, ThemeProps } from '../../Theme'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
`
const Header = styled.div<any>`
  display: flex;
  flex-shrink: 0;
`
const HeaderItem = styled.div<any>`
  display: flex;
  color: ${props => (props.selected ? ThemePalette.primary : 'inherit')};
  min-width: 96px;
  justify-content: center;
  border-bottom: 1px solid ${props => (props.selected ? ThemePalette.primary : 'transparent')};
  padding: 4px 4px 8px 4px;
  cursor: pointer;
  margin-right: 16px;
  &:hover {
    border-bottom: 1px solid ${props => (props.selected ? ThemePalette.primary : '#e6e7ea')};
  }
  transition: all ${ThemeProps.animations.swift};
`
const Body = styled.div<any>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
`

export type TabItem = {
  label: string,
  value: string,
}

type Props = {
  tabItems: TabItem[],
  selectedTabValue: string,
  children: React.ReactNode,
  onChange: (tabValue: string) => void,
}

@observer
class TabNavigation extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        <Header>
          {this.props.tabItems.map(item => (
            <HeaderItem
              key={item.value}
              selected={item.value === this.props.selectedTabValue}
              onClick={() => { this.props.onChange(item.value) }}
            >
              {item.label}
            </HeaderItem>
          ))}
        </Header>
        <Body>
          {this.props.children}
        </Body>
      </Wrapper>
    )
  }
}

export default TabNavigation
