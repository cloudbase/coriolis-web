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

import { css } from 'styled-components'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import arrowImage from './images/arrow.svg'

const style = css`
  .rdtPicker {
    width: 240px;
    border: 1px solid ${Palette.grayscale[2]};
    border-radius: ${StyleProps.borderRadius};
    background: white;
    position: relative;

    &:after {
      content: ' ';
      position: absolute;
      top: -9px;
      right: 16px;
      width: 16px;
      height: 16px;
      border-top: 1px solid ${Palette.grayscale[2]};
      border-left: 1px solid ${Palette.grayscale[2]};
      transform: rotate(45deg);
      background: white;
    }

    table {
      display: flex;
      flex-direction: column;

      thead {
        display: flex;
        flex-direction: column;

        tr {
          display: flex;
          align-items: center;

          &:first-child {
            border-bottom: 1px solid ${Palette.grayscale[2]};
          }

          &:nth-child(2) {
            padding: 16px 12px;
          }

          th {
            display: flex;
            padding: 0;
          }
        }
      }

      tbody {
        display: flex;
        flex-direction: column;
        padding: 8px;

        tr {
          display: flex;
          justify-content: space-between;

          td {
            display: flex;
            padding: 0;
            justify-content: center;
            align-items: center;
            ${StyleProps.exactWidth('24px')}
            height: 24px;
            border: 1px solid transparent;
            border-radius: 50%;
            cursor: pointer;
          }
        }
      }

      tfoot {
        border-top: 1px solid ${Palette.grayscale[2]};
        display: flex;

        tr {
          display: flex;
          justify-content: center;
          flex-grow: 1;

          td {
            display: flex;
            padding: 16px;
            cursor: pointer;
          }
        }
      }
    }

    .rdtSwitch {
      flex-grow: 1;
      font-weight: ${StyleProps.fontWeights.regular};
      justify-content: center;
      cursor: pointer;
      color: ${Palette.grayscale[4]};
    }

    .rdtPrev, .rdtNext {
      width: 16px;
      height: 16px;
      padding: 16px;
      background: url('${arrowImage}') center no-repeat;
      cursor: pointer;

      span {
        display: none;
      }
    }

    .rdtNext {
      transform: rotate(180deg);
    }

    .dow {
      font-size: 10px;
      font-weight: ${StyleProps.fontWeights.medium};
      color: ${Palette.grayscale[3]};
      ${StyleProps.exactWidth('25px')};
      margin-right: 7px;
      display: flex;
      justify-content: center;
      align-items: center;

      &:last-child {
        margin-right: 0px;
      }
    }

    .rdtDay.rdtOld, .rdtDay.rdtDisabled, .rdtDay.rdtNew {
      color: ${Palette.grayscale[3]};
    }

    .rdtDay.rdtActive {
      background: ${Palette.primary};
      color: white;
    }

    .rdtCounters {
      display: flex;
      align-items: center;

      > div {
        margin-right: 0px;

        &:last-child {
          margin-right: 0;
          margin-left: 6px;
        }
      }
    }

    .rdtCounterSeparator {
      width: 6px;
    }

    .rtdCounter {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .rdtTime {
      tbody {
        tr {
          justify-content: center;
        }
      }

      td {
        min-width: auto;
        max-width: none;
        height: auto;
      }

      .rdtSwitch {
        padding: 16px;
      }

      .rdtBtn {
        display: flex;
        color: transparent;
        width: 25px;
        height: 16px;
        background: url('${arrowImage}') center no-repeat;
        margin: auto;
        user-select: none;

        &:first-child {
          transform: rotate(90deg);
        }

        &:last-child {
          transform: rotate(-90deg);
        }
      }

      .rdtCount {
        width: 25px;
        height: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
`

export default style
