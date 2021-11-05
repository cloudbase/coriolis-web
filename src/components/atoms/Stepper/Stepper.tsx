import * as React from 'react'
import styled, { css } from 'styled-components'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

import upSvg from './images/up.svg'
import downSvg from './images/down.svg'

const Wrapper = styled.div<any>`
  position: relative;
  ${(props: any) => (props.disabledLoading ? StyleProps.animations.disabledLoading : '')}
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
const borderColor = (
  props: any,
  defaultColor = Palette.grayscale[3],
) => (props.highlight ? Palette.alert : defaultColor)

const Input = styled.input<any>`
  width: ${(props: any) => getInputWidth(props)};
  height: ${(props: any) => props.height || `${StyleProps.inputSizes.regular.height}px`};
  line-height: ${(props: any) => props.lineHeight || 'normal'};
  border-radius: ${StyleProps.borderRadius};
  background-color: #FFF;
  border: ${(props: any) => (props.embedded ? '0' : `1px solid ${borderColor(props)}`)};
  border-top-left-radius: ${(props: any) => (props.embedded ? '0' : StyleProps.borderRadius)};
  border-top-right-radius: ${StyleProps.borderRadius};
  border-bottom-left-radius: ${(props: any) => (props.embedded ? '0' : StyleProps.borderRadius)};
  border-bottom-right-radius: ${StyleProps.borderRadius};
  color: ${Palette.black};
  padding: 0 8px 0 ${(props: any) => (props.embedded ? '0' : '16px')};
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
const StepsButtons = styled.div<any>`
  display: flex;
  flex-direction: column;
  position: absolute;
  right: ${(p: any) => (p.embedded ? '0' : '1px')};
  top: ${(p: any) => (p.embedded ? '0' : '1px')};
`
const StepButton = css`
  background: #F1ECEF;
  display: flex;
  justify-content: center;
  align-items: center;
`
const StepButtonUp = styled.div<any>`
  width: 17px;
  height: 15px;
  border-bottom: 1px solid ${Palette.secondaryLight};
  border-top-right-radius: 4px;
  ${StepButton}
`
const StepButtonDown = styled.div<any>`
  width: 17px;
  height: 14px;
  border-bottom-right-radius: 4px;
  ${StepButton}
`
const StepImage = styled.div<any>`
  width: 8px;
  height: 4px;
  background: url('${(props: any) => (props.up ? upSvg : downSvg)}') center no-repeat;
  transform: scale(1);
  animation: ${StyleProps.animations.swift};
`

type State = {
  inputValue: string | null
}

type Props = {
  _ref?: (ref: HTMLElement) => void,
  disabled?: boolean | null,
  highlight?: boolean,
  large?: boolean,
  onChange?: (value: number | null) => void,
  type?: string,
  value?: number,
  embedded?: boolean,
  height?: string,
  width?: string,
  name?: string,
  minimum?: number | null,
  maximum?: number | null,
  disabledLoading?: boolean | null,
}
const INCREMENT = 1
class Stepper extends React.Component<Props, State> {
  state = {
    inputValue: null,
  }

  commitChange(inputValue: string) {
    const { onChange, minimum, maximum } = this.props
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
    let value = inputValue
    if (value.indexOf('Not S') > -1) {
      value = ''
    }

    this.setState({ inputValue: value })
  }

  handleInputBlur() {
    this.commitChange(this.state.inputValue || '')
    this.setState({ inputValue: null })
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _ref, value, type } = this.props
    let downImageRef: HTMLElement | null | undefined
    let upImageRef: HTMLElement | null | undefined
    const scale = (imageRef: HTMLElement | null | undefined, direction: 'up' | 'down') => {
      const ref = imageRef
      if (!ref) {
        return
      }
      ref.style.transform = `scale(${direction === 'down' ? '0.8' : '1'})`
    }

    return (
      <Wrapper disabledLoading={this.props.disabledLoading}>
        <Input
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...this.props}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { this.handleKeyDown(e) }}
          disabled={this.props.disabled || this.props.disabledLoading}
          type={type || 'text'}
          ref={(ref: HTMLElement) => {
            if (_ref && ref) { _ref(ref) }
          }}
          value={this.state.inputValue !== null ? this.state.inputValue : (value == null ? 'Not Set' : value)}
          onChange={
            (e: { target: { value: string } }) => { this.handleInputChange(e.target.value) }
          }
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
              ref={(ref: HTMLElement | null | undefined) => { upImageRef = ref }}
            />
          </StepButtonUp>
          <StepButtonDown
            onClick={() => { this.decrement() }}
            onMouseDown={() => { scale(downImageRef, 'down') }}
            onMouseUp={() => { scale(downImageRef, 'up') }}
            onMouseLeave={() => { scale(downImageRef, 'up') }}
          >
            <StepImage
              ref={(ref: HTMLElement | null | undefined) => { downImageRef = ref }}
              down
            />
          </StepButtonDown>
        </StepsButtons>
      </Wrapper>
    )
  }
}

export default Stepper
