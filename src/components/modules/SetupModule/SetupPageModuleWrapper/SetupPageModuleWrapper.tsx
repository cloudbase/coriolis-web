/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { ThemeProps } from '@src/components/Theme'

const Wrapper = styled.div`
  background: rgba(221, 224, 229, 0.5);
  padding: 16px 32px 32px 32px;
  border-radius: 8px;
  color: white;
  margin-top: 32px;
  ${ThemeProps.exactWidth('450px')}
`
const Content = styled.div``
const Actions = styled.div`
  margin-top: 24px;
  display: flex;
`

type Props = {
  children: React.ReactNode
  actions: React.ReactNode
  actionsWrapperStyle?: React.CSSProperties
}

@observer
class SetupPageModuleWrapper extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        <Content>{this.props.children}</Content>
        <Actions>
          {this.props.actions}
        </Actions>
      </Wrapper>
    )
  }
}

export default SetupPageModuleWrapper
