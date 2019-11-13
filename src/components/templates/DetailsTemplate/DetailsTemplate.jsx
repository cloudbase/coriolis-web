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
  min-width: 1100px;
  min-height: 0;
`
const PageHeader = styled.div``
const ContentHeader = styled.div``
const Content = styled.div`
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
`
type Props = {
  pageHeaderComponent: React.Node,
  contentHeaderComponent: React.Node,
  contentComponent: React.Node,
  style?: any,
  contentStyle?: any,
}
const DetailsTemplate = (props: Props) => {
  return (
    <Wrapper style={props.style}>
      <PageHeader>{props.pageHeaderComponent}</PageHeader>
      <ContentHeader>{props.contentHeaderComponent}</ContentHeader>
      <Content style={props.contentStyle}>{props.contentComponent}</Content>
    </Wrapper>
  )
}

export default DetailsTemplate
