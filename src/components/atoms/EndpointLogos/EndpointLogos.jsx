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
import PropTypes from 'prop-types'
import styled from 'styled-components'

import aws32Image from './images/aws-32.svg'
import azure32Image from './images/azure-32.svg'
import opc32Image from './images/opc-32.svg'
import openstack32Image from './images/openstack-32.svg'
import oraclevm32Image from './images/oraclevm-32.svg'
import vmware32Image from './images/vmware-32.svg'

import aws45Image from './images/aws-45.svg'
import azure45Image from './images/azure-45.svg'
import opc45Image from './images/opc-45.svg'
import openstack45Image from './images/openstack-45.svg'
import oraclevm45Image from './images/oraclevm-45.svg'
import vmware45Image from './images/vmware-45.svg'

import aws128Image from './images/aws-128.svg'
import azure128Image from './images/azure-128.svg'
import opc128Image from './images/opc-128.svg'
import openstack128Image from './images/openstack-128.svg'
import oraclevm128Image from './images/oraclevm-128.svg'
import vmware128Image from './images/vmware-128.svg'

import aws64Image from './images/aws-64.svg'
import azure64Image from './images/azure-64.svg'
import opc64Image from './images/opc-64.svg'
import openstack64Image from './images/openstack-64.svg'
import oraclevm64Image from './images/oraclevm-64.svg'
import vmware64Image from './images/vmware-64.svg'

const endpointImages = {
  azure: {
    h32: azure32Image,
    h45: azure45Image,
    h128: azure128Image,
    h64: azure64Image,
  },
  openstack: {
    h32: openstack32Image,
    h45: openstack45Image,
    h128: openstack128Image,
    h64: openstack64Image,
  },
  opc: {
    h32: opc32Image,
    h45: opc45Image,
    h128: opc128Image,
    h64: opc64Image,
  },
  oracle_vm: {
    h32: oraclevm32Image,
    h45: oraclevm45Image,
    h128: oraclevm128Image,
    h64: oraclevm64Image,
  },
  vmware_vsphere: {
    h32: vmware32Image,
    h45: vmware45Image,
    h128: vmware128Image,
    h64: vmware64Image,
  },
  aws: {
    h32: aws32Image,
    h45: aws45Image,
    h128: aws128Image,
    h64: aws64Image,
  },
}
const Wrapper = styled.div``
const Logo32 = styled.div`
  width: 80px;
  height: 32px;
  background: url('${props => props.endpoint ? endpointImages[props.endpoint].h32 : ''}') no-repeat center;
`
const Logo45 = styled.div`
  width: 112px;
  height: 45px;
  background: url('${props => props.endpoint ? endpointImages[props.endpoint].h45 : ''}') no-repeat center;
`
const Logo128 = styled.div`
  width: 192px;
  height: 128px;
  background: url('${props => props.endpoint ? endpointImages[props.endpoint].h128 : ''}') no-repeat center;
`
const Logo64 = styled.div`
  width: 192px;
  height: 64px;
  background: url('${props => props.endpoint ? endpointImages[props.endpoint].h64 : ''}') no-repeat center;
`

class EndpointLogos extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string,
    height: PropTypes.number,
  }

  static defaultProps = {
    height: 64,
  }

  render() {
    let logo
    switch (this.props.height) {
      case 32:
        logo = <Logo32 endpoint={this.props.endpoint} />
        break
      case 45:
        logo = <Logo45 endpoint={this.props.endpoint} />
        break
      case 128:
        logo = <Logo128 endpoint={this.props.endpoint} />
        break
      default:
        logo = <Logo64 endpoint={this.props.endpoint} />
    }

    return (
      <Wrapper {...this.props}>
        {logo}
      </Wrapper>
    )
  }
}

export default EndpointLogos
