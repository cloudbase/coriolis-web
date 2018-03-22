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
import styled from 'styled-components'

import aws32Image from './images/aws-32.svg'
import azure32Image from './images/azure-32.svg'
import opc32Image from './images/opc-32.svg'
import openstack32Image from './images/openstack-32.svg'
import oraclevm32Image from './images/oraclevm-32.svg'
import vmware32Image from './images/vmware-32.svg'

import aws42Image from './images/aws-42.svg'
import azure42Image from './images/azure-42.svg'
import opc42Image from './images/opc-42.svg'
import openstack42Image from './images/openstack-42.svg'
import oraclevm42Image from './images/oraclevm-42.svg'
import vmware42Image from './images/vmware-42.svg'

import aws64Image from './images/aws-64.svg'
import azure64Image from './images/azure-64.svg'
import opc64Image from './images/opc-64.svg'
import openstack64Image from './images/openstack-64.svg'
import oraclevm64Image from './images/oraclevm-64.svg'
import vmware64Image from './images/vmware-64.svg'

import aws128Image from './images/aws-128.svg'
import azure128Image from './images/azure-128.svg'
import opc128Image from './images/opc-128.svg'
import openstack128Image from './images/openstack-128.svg'
import oraclevm128Image from './images/oraclevm-128.svg'
import vmware128Image from './images/vmware-128.svg'

import aws128DisabledImage from './images/aws-128-disabled.svg'
import azure128DisabledImage from './images/azure-128-disabled.svg'
import opc128DisabledImage from './images/opc-128-disabled.svg'
import openstack128DisabledImage from './images/openstack-128-disabled.svg'
import oraclevm128DisabledImage from './images/oraclevm-128-disabled.svg'
import vmware128DisabledImage from './images/vmware-128-disabled.svg'

const endpointImages = {
  azure: [
    { h: 32, image: azure32Image },
    { h: 42, image: azure42Image },
    { h: 64, image: azure64Image },
    { h: 128, image: azure128Image },
    { h: 128, image: azure128DisabledImage, disabled: true },
  ],
  openstack: [
    { h: 32, image: openstack32Image },
    { h: 42, image: openstack42Image },
    { h: 64, image: openstack64Image },
    { h: 128, image: openstack128Image },
    { h: 128, image: openstack128DisabledImage, disabled: true },
  ],
  opc: [
    { h: 32, image: opc32Image },
    { h: 42, image: opc42Image },
    { h: 64, image: opc64Image },
    { h: 128, image: opc128Image },
    { h: 128, image: opc128DisabledImage, disabled: true },
  ],
  oracle_vm: [
    { h: 32, image: oraclevm32Image },
    { h: 42, image: oraclevm42Image },
    { h: 64, image: oraclevm64Image },
    { h: 128, image: oraclevm128Image },
    { h: 128, image: oraclevm128DisabledImage, disabled: true },
  ],
  vmware_vsphere: [
    { h: 32, image: vmware32Image },
    { h: 42, image: vmware42Image },
    { h: 64, image: vmware64Image },
    { h: 128, image: vmware128Image },
    { h: 128, image: vmware128DisabledImage, disabled: true },
  ],
  aws: [
    { h: 32, image: aws32Image },
    { h: 42, image: aws42Image },
    { h: 64, image: aws64Image },
    { h: 128, image: aws128Image },
    { h: 128, image: aws128DisabledImage, disabled: true },
  ],
}
const Wrapper = styled.div``
const Logo = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  ${props => props.imageInfo ? `background: url('${props.imageInfo.image}') no-repeat center;` : ''}
`
const Text = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  font-size: 32px;
  text-align: center;
`
const widthHeights = [
  { w: 80, h: 32 },
  { w: 105, h: 42 },
  { w: 192, h: 128 },
  { w: 192, h: 64 },
]

type Props = {
  endpoint?: string,
  height: number,
  disabled?: boolean,
}
class EndpointLogos extends React.Component<Props> {
  static defaultProps: Props = {
    height: 64,
  }

  renderLogo(size: {w: number, h: number}) {
    let imageInfo = null

    if (this.props.endpoint && endpointImages[this.props.endpoint]) {
      imageInfo = endpointImages[this.props.endpoint].find(i => i.h === size.h && (!this.props.disabled || i.disabled === true))
    } else {
      return null
    }

    if (!imageInfo) {
      return null
    }

    return (
      <Logo
        width={size.w}
        height={size.h}
        imageInfo={imageInfo}
      />
    )
  }

  renderText(size: {w: number, h: number}) {
    if (this.props.endpoint && endpointImages[this.props.endpoint]) {
      return null
    }

    return (
      <Text width={size.w} height={size.h}>{this.props.endpoint}</Text>
    )
  }

  render() {
    let size = widthHeights.find(wh => wh.h === this.props.height)

    if (!size) {
      return null
    }
    return (
      <Wrapper {...this.props}>
        {this.renderLogo(size)}
        {this.renderText(size)}
      </Wrapper>
    )
  }
}

export default EndpointLogos
