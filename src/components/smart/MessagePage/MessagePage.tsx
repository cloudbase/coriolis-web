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
import styled from 'styled-components'
import EmptyTemplate from '../../modules/TemplateModule/EmptyTemplate/EmptyTemplate'
import { ThemePalette } from '../../Theme'

import StatusImage from '../../ui/StatusComponents/StatusImage/StatusImage'

import fingerprintImage from './images/fingerprint'

const Wrapper = styled.div<any>`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const FingerPrintAnimation = styled.div<any>`
  margin-bottom: 32px;
  --animation-delay: 150ms;

  path {
    animation-name: show;
    animation-duration: calc(18 * var(--animation-delay));
    animation-delay: calc(var(--animation-order) * var(--animation-delay));
    animation-fill-mode: forwards;
    animation-direction: alternate;
    animation-iteration-count: infinite;
  }

  @keyframes show {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`
const Title = styled.div<any>`
  font-size: 21px;
  color: ${ThemePalette.grayscale[4]};
`
const Message = styled.div<any>`
  margin-top: 16px;
  color: ${ThemePalette.grayscale[8]};
`
type Props = {
  title?: string,
  subtitle?: string,
  showAuthAnimation?: boolean,
  showDenied?: boolean,
}
const NotFoundPage = (props: Props) => (
  <EmptyTemplate>
    <Wrapper>
      {props.showAuthAnimation ? (
        <FingerPrintAnimation
          dangerouslySetInnerHTML={{ __html: fingerprintImage }}
        />
      ) : null}
      {props.showDenied ? (
        <StatusImage status="ERROR" style={{ marginBottom: '32px' }} />
      ) : null}
      <Title>{props.title || 'Page Not Found'}</Title>
      <Message>{props.subtitle || 'Sorry, but the page you are trying to view does not exist.'}</Message>
    </Wrapper>
  </EmptyTemplate>
)

export default NotFoundPage
