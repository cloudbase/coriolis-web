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
import styled from 'styled-components'
import { ThemeProps } from '../../../Theme'

const Wrapper = styled.div<any>`
  display: flex;
  height: 100%;
`
const Navigation = styled.div<any>`
  display: flex;
`
const Content = styled.div<any>`
  padding: 0 64px 0 64px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: auto;

  @media (max-width: ${ThemeProps.mobileMaxWidth}px) {
    padding: 0 32px 0 48px;
  }
`
const List = styled.div<any>`
  padding-bottom: 0;
  margin-left: ${props => (props.noMargin ? 0 : '-32px')};
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`
const Header = styled.div<any>``
const Footer = styled.div<any>`
  flex-shrink: 0;
`

type Props = {
  navigationComponent: React.ReactNode,
  headerComponent: React.ReactNode,
  listComponent: React.ReactNode,
  listNoMargin?: boolean,
}
const MainTemplate = (props: Props) => (
  <Wrapper>
    <Navigation>{props.navigationComponent}</Navigation>
    <Content>
      <Header>{props.headerComponent}</Header>
      <List noMargin={props.listNoMargin}>{props.listComponent}</List>
      <Footer />
    </Content>
  </Wrapper>
)

export default MainTemplate
