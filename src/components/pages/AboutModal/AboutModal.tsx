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

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Modal from '../../molecules/Modal/Modal'
import LicenceComponent from '../../organisms/Licence'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import licenceStore from '../../../stores/LicenceStore'
import userStore from '../../../stores/UserStore'

import logoImage from './images/coriolis-logo.svg'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0 32px 0;
  position: relative;
  height: 100%;
  min-height: 0;
`
const Gradient = styled.div<any>`
  position: absolute;
  height: 100%;
  max-height: 230px;
  top: 0;
  width: 100%;
  background: linear-gradient(#A7B0CA, #FFFFFF);
`
const Content = styled.div<any>`
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 0;
`
const AboutContentWrapper = styled.div<any>``
const Logo = styled.div<any>`
  width: 362px;
  ${StyleProps.exactHeight('71px')}
  background: url('${logoImage}') center no-repeat;
`
const Text = styled.div`
  margin: 48px 0 32px 0;
  color: ${Palette.grayscale[5]};
  font-size: 12px;
`
const TextLine = styled.div<any>`
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

type Props = {
  onRequestClose: () => void,
}

type State = {
  licenceAddMode: boolean,
}

@observer
class AboutModal extends React.Component<Props, State> {
  state = {
    licenceAddMode: false,
  }

  UNSAFE_componentWillMount() {
    if (userStore.loggedUser?.isAdmin) {
      licenceStore.loadLicenceInfo({ showLoading: true })
    }
  }

  async handleAddLicence(licence: string) {
    if (!licenceStore.licenceInfo) {
      throw new Error('Licence info not loaded')
    }
    await licenceStore.addLicence(licence, licenceStore.licenceInfo.applianceId)
    licenceStore.loadLicenceInfo()
    this.setState({ licenceAddMode: false })
  }

  render() {
    return (
      <Modal
        title="About"
        isOpen
        onRequestClose={() => { this.props.onRequestClose() }}
      >
        <Wrapper>
          {!this.state.licenceAddMode ? <Gradient /> : null}
          <Content>
            {!this.state.licenceAddMode ? (
              <AboutContentWrapper>
                <Logo />
                <Text>
                  <TextLine>
                    © {new Date().getFullYear()} Cloudbase Solutions. All Rights Reserved.
                  </TextLine>
                </Text>
              </AboutContentWrapper>
            ) : null}
            <LicenceComponent
              licenceInfo={licenceStore.licenceInfo}
              licenceServerStatus={licenceStore.licenceServerStatus}
              licenceError={licenceStore.licenceInfoError}
              loadingLicenceInfo={licenceStore.loadingLicenceInfo}
              onRequestClose={this.props.onRequestClose}
              addMode={this.state.licenceAddMode}
              onAddModeChange={licenceAddMode => { this.setState({ licenceAddMode }) }}
              onAddLicence={licence => { this.handleAddLicence(licence) }}
              addingLicence={licenceStore.addingLicence}
            />
          </Content>
        </Wrapper>
      </Modal>
    )
  }
}

export default AboutModal
