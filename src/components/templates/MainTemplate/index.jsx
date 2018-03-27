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

import * as React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
`
const Navigation = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
`
const Content = styled.div`
  padding: 0 64px 0 64px;
  position: absolute;
  left: 320px;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: auto;
`
const List = styled.div`
  padding-bottom: 32px;
  margin-left: ${props => props.noMargin ? 0 : '-32px'};
`
const Header = styled.div``

type Props = {
  navigationComponent: React.Node,
  headerComponent: React.Node,
  listComponent: React.Node,
  listNoMargin?: boolean,
}
const MainTemplate = (props: Props) => {
  return (
    <Wrapper>
      <Navigation>{props.navigationComponent}</Navigation>
      <Content>
        <Header>{props.headerComponent}</Header>
        <List noMargin={props.listNoMargin}>{props.listComponent}</List>
      </Content>
    </Wrapper>
  )
}

export default MainTemplate
