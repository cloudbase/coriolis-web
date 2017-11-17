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

import { TextInput } from 'components'

import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  margin-bottom: 16px;
  margin-left: 16px;
`
const FormFieldLabel = styled.div`
  color: white;
  text-transform: uppercase;
  margin-bottom: 6px;
  font-weight: ${StyleProps.fontWeights.medium};
  font-size: 9px;
`
const StyledTextInput = styled(TextInput) `
  width: ${StyleProps.inputSizes.regular.width}px;
`

const LoginFormField = ({ label, ...props }) => {
  return (
    <Wrapper>
      <FormFieldLabel>{label}</FormFieldLabel>
      <StyledTextInput {...props} />
    </Wrapper>
  )
}

LoginFormField.propTypes = {
  label: PropTypes.string,
}

export default LoginFormField
