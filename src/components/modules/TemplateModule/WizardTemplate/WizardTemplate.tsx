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

const Wrapper = styled.div<any>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-width: 900px;
`
const PageHeader = styled.div<any>``
const PageContent = styled.div<any>`
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
`

type Props = {
  pageHeaderComponent: React.ReactNode,
  pageContentComponent: React.ReactNode,
}
const WizardTemplate = (props: Props) => (
  <Wrapper>
    <PageHeader>{props.pageHeaderComponent}</PageHeader>
    <PageContent>{props.pageContentComponent}</PageContent>
  </Wrapper>
)

export default WizardTemplate
