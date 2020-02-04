/* eslint-disable jsx-a11y/mouse-events-have-key-events */
// @flow

import * as React from 'react'
import styled, { css } from 'styled-components'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

import upSvg from './images/up.svg'
import downSvg from './images/down.svg'

const Wrapper = styled.div`
  position: relative;
  ${props => props.disabledLoading ? StyleProps.animations.disabledLoading : ''}
`
const getInputWidth = (props: any) => {
  if (props.width) {
    return props.width
  }

  if (props.large) {
    return `${StyleProps.inputSizes.large.width}px`
  }

  return `${StyleProps.inputSizes.regular.width}px`
}
const borderColor = (props: any, defaultColor = Palette.grayscale[3]) => props.highlight ? Palette.alert : defaultColor
const Input = styled.input`
  width: ${props => getInputWidth(props)};
  height: ${(props: any) => props.height || `${StyleProps.inputSizes.regular.height}px`};
  line-height: ${(props: any) => props.lineHeight || 'normal'};
  border-radius: ${StyleProps.borderRadius};
  background-color: #FFF;
  border: ${(props: any) => props.embedded ? '0' : `1px solid ${borderColor(props)}`};
  border-top-left-radius: ${(props: any) => props.embedded ? '0' : StyleProps.borderRadius};
  border-top-right-radius: ${StyleProps.borderRadius};
  border-bottom-left-radius: ${(props: any) => props.embedded ? '0' : StyleProps.borderRadius};
  border-bottom-right-radius: ${StyleProps.borderRadius};
  color: ${Palette.black};
  padding: 0 8px 0 ${(props: any) => props.embedded ? '0' : '16px'};
  font-size: inherit;
  transition: all ${StyleProps.animations.swift};
  box-sizing: border-box;
  &:hover {
    border-color: ${(props: any) => borderColor(props, props.disablePrimary ? undefined : Palette.primaryLight)};
  }
  &:focus {
    border-color: ${(props: any) => borderColor(props, props.disablePrimary ? undefined : Palette.primaryLight)};
    outline: none;
  }
  &:disabled {
    color: ${Palette.grayscale[3]};
    border-color: ${Palette.grayscale[0]};
    background-color: ${Palette.grayscale[0]};
  }
  &::placeholder {
    color: ${Palette.grayscale[3]};
  }
`
const StepsButtons = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  right: ${(p: any) => p.embedded ? '0' : '1px'};
  top: ${(p: any) => p.embedded ? '0' : '1px'};
`
const StepButton = css`
  background: #F1ECEF;
  display: flex;
  justify-content: center;
  align-items: center;
`
const StepButtonUp = styled.div`
  width: 17px;
  height: 15px;
  border-bottom: 1px solid ${Palette.secondaryLight};
  border-top-right-radius: 4px;
  ${StepButton}
`
const StepButtonDown = styled.div`
  width: 17px;
  height: 14px;
  border-bottom-right-radius: 4px;
  ${StepButton}
`
const StepImage = styled.div`
  width: 8px;
  height: 4px;
  background: url('${(props: any) => props.up ? upSvg : downSvg}') center no-repeat;
  transform: scale(1);
  animation: ${StyleProps.animations.swift};
`

type State = {
  inputValue: ?string
}

type Props = {
  _ref?: (ref: HTMLElement) => void,
  disabled?: ?boolean,
  highlight?: boolean,
  large?: boolean,
  onChange?: (value: ?number) => void,
  type?: string,
  value?: number,
  embedded?: boolean,
  height?: string,
  width?: string,
  name?: string,
  minimum?: ?number,
  maximum?: ?number,
  disabledLoading?: ?boolean,
}
const INCREMENT = 1
class Stepper extends React.Component<Props, State> {
  state = {
    inputValue: null,
  }

  commitChange(inputValue: string) {
    let { onChange, minimum, maximum } = this.props
    if (!onChange) {
      return
    }
    if (inputValue === '') {
      onChange(null)
    } else {
      let value = Number(inputValue.replace(/\D/g, '')) || 0
      if (minimum != null && value < minimum) {
        value = minimum
      }
      if (maximum != null && value > maximum) {
        value = maximum
      }
      onChange(value)
    }
  }

  handleInputChange(inputValue: string) {
    if (inputValue.indexOf('Not S') > -1) {
      inputValue = ''
    }

    this.setState({ inputValue })
  }

  handleInputBlur() {
    this.commitChange(this.state.inputValue || '')
    this.setState({ inputValue: null })
  }

  handleKeyDown(e: SyntheticKeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
      return
    }
    e.preventDefault()
    if (e.key === 'ArrowUp') {
      this.increment()
    }
    if (e.key === 'ArrowDown') {
      this.decrement()
    }
  }

  increment() {
    this.commitChange(`${(this.props.value || 0) + INCREMENT}`)
  }

  decrement() {
    this.commitChange(`${this.props.value && this.props.value > 0 ? this.props.value - INCREMENT : 0}`)
  }

  render() {
    const { _ref, value, type } = this.props
    let downImageRef: ?HTMLElement
    let upImageRef: ?HTMLElement
    let scale = (imageRef: ?HTMLElement, direction: 'up' | 'down') => {
      if (!imageRef) {
        return
      }
      imageRef.style.transform = `scale(${direction === 'down' ? '0.8' : '1'})`
    }

    return (
      <Wrapper disabledLoading={this.props.disabledLoading}>
        <Input
          {...this.props}
          onKeyDown={e => { this.handleKeyDown(e) }}
          disabled={this.props.disabled || this.props.disabledLoading}
          type={type || 'text'}
          innerRef={ref => {
            if (_ref && ref) { _ref(ref) }
          }}
          value={this.state.inputValue !== null ? this.state.inputValue : (value == null ? 'Not Set' : value)}
          onChange={e => { this.handleInputChange(e.target.value) }}
          onBlur={() => { this.handleInputBlur() }}
        />
        <StepsButtons embedded={this.props.embedded}>
          <StepButtonUp
            onClick={() => { this.increment() }}
            onMouseDown={() => { scale(upImageRef, 'down') }}
            onMouseUp={() => { scale(upImageRef, 'up') }}
            onMouseLeave={() => { scale(upImageRef, 'up') }}
          >
            <StepImage
              up
              innerRef={ref => { upImageRef = ref }}
            />
          </StepButtonUp>
          <StepButtonDown
            onClick={() => { this.decrement() }}
            onMouseDown={() => { scale(downImageRef, 'down') }}
            onMouseUp={() => { scale(downImageRef, 'up') }}
            onMouseLeave={() => { scale(downImageRef, 'up') }}
          >
            <StepImage
              innerRef={ref => { downImageRef = ref }}
              down
            />
          </StepButtonDown>
        </StepsButtons>
      </Wrapper>
    )
  }
}

export default Stepper
