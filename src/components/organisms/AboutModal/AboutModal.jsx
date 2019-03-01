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

// @flow

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import apiCaller from '../../../utils/ApiCaller'
import logger from '../../../utils/ApiLogger'

import Button from '../../atoms/Button'
import Modal from '../../molecules/Modal/Modal'

import Palette from '../../styleUtils/Palette'

import logoImage from './images/coriolis-logo.svg'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0 32px 0;
  position: relative;
`
const Gradient = styled.div`
  position: absolute;
  height: 100%;
  max-height: 230px;
  top: 0;
  width: 100%;
  background: linear-gradient(#A7B0CA, #FFFFFF);
`
const Content = styled.div`
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Logo = styled.div`
  width: 362px;
  height: 71px;
  background: url('${logoImage}') center no-repeat;
`
const Text = styled.div`
  margin: 48px 0;
  color: ${Palette.grayscale[5]};
  font-size: 12px;
`
const TextLine = styled.div`
  display: flex;
  justify-content: center;
  margin-left: -6px;
  margin-top: 8px;
  &:first-child {
    margin-top: 0;
  }
  span, a {
    margin-left: 6px;
  }
`
const Link = styled.a`
  color: inherit;
`
const LinkMock = styled.span`
  text-decoration: underline;
  cursor: pointer;
`

type Props = {
  onRequestClose: () => void,
}

type State = {
  version: string,
}

@observer
class AboutModal extends React.Component<Props, State> {
  state = {
    version: '-',
  }

  componentWillMount() {
    apiCaller.get('/version').then(res => {
      this.setState({ version: res.data.version })
    })
  }

  render() {
    return (
      <Modal
        title="About"
        isOpen
        onRequestClose={() => { this.props.onRequestClose() }}
      >
        <Wrapper>
          <Gradient />
          <Content>
            <Logo />
            <Text>
              <TextLine>
                <span>Version {this.state.version}</span>
                <span>|</span>
                <Link href="https://github.com/cloudbase/coriolis/issues" target="_blank">Report an Issue</Link>
                <span>|</span>
                <LinkMock onClick={() => { logger.download() }} >Download Log</LinkMock>
              </TextLine>
              <TextLine>
                © {new Date().getFullYear()} Cloudbase Solutions. All Rights Reserved.
              </TextLine>
            </Text>
            <Button secondary large onClick={() => { this.props.onRequestClose() }}>Close</Button>
          </Content>
        </Wrapper>
      </Modal>
    )
  }
}

export default AboutModal
