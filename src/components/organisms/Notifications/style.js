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

import { css } from 'styled-components'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import closeImage from './images/close.svg'

const NotificationsStyle = css`
  .notifications-br {
    width: 244px !important;
  }
  .notification-action-button {
    background: ${Palette.primary} !important;
    font-weight: 400 !important;
    border-radius: 4px !important;
    margin-top: 8px !important;
    padding: 4px 16px !important;
    line-height: 1 !important;
    height: 26px;
    font-size: 12px;
    cursor: pointer;
    margin-left: 25px !important;
  }
  .notification-error .notification-action-button {
    background: ${Palette.secondaryLight} !important;
  }
  .notification {
    border-radius: ${StyleProps.borderRadius} !important;
    background-color: ${Palette.grayscale[1]} !important;
    box-shadow: none !important;
    border-top: none !important;
    height: auto !important;
  }
  .notification-dismiss {
    border-radius: 4px !important;
    width: 16px !important;
    height: 16px !important;
    font-size: 16px !important;
    top: 8px !important;
    right: 8px !important;
    text-indent: -100000px;
    background: url('${closeImage}') center no-repeat !important;
  }
  .notification-title {
    padding-left: 24px !important;
    background-repeat: no-repeat;
    background-position: 0 0;
    font-size: 14px !important;
    color: ${Palette.black} !important;
    letter-spacing: 0 !important;
    line-height: 18px !important;
    margin-bottom: 1px !important;
    font-weight: 400 !important;
    width: 160px;
    margin-bottom: 8px !important;
    word-break: break-word;
  }
  .notification-message {
    font-size: 14px !important;
    color: ${Palette.black} !important;
    letter-spacing: 0 !important;
    line-height: 18px !important;
    font-weight: 400 !important;
  }
  .notification-info .notification-title {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iSWNvbi1JbmZvLS1XaGl0ZSI+DQogICAgICAgICAgICA8cGF0aCBkPSJNOC4wMDAzMzg2MiwwIEMzLjU4MTk2ODI1LDAgMCwzLjU4MTI5MTAxIDAsNy45OTk2NjEzOCBDMCwxMi40MTgwMzE3IDMuNTgxOTY4MjUsMTYgOC4wMDAzMzg2MiwxNiBDMTIuNDE4MDMxNywxNiAxNiwxMi40MTgwMzE3IDE2LDcuOTk5NjYxMzggQzE2LDMuNTgxMjkxMDEgMTIuNDE4MDMxNywwIDguMDAwMzM4NjIsMCBMOC4wMDAzMzg2MiwwIFoiIGlkPSJGaWxsLTEtQ29weSIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTkuNTc0OTQxOCw1LjAzMTI4MDQyIEM5LjMzNjU1MDI2LDUuMjU0MDk1MjQgOS4wNDgwNDIzMyw1LjM2NDQ4Njc3IDguNzExNDQ5NzQsNS4zNjQ0ODY3NyBDOC4zNzU1MzQzOSw1LjM2NDQ4Njc3IDguMDg1NjcxOTYsNS4yNTQwOTUyNCA3Ljg0Mzg5NDE4LDUuMDMxMjgwNDIgQzcuNjA0ODI1NCw0LjgwOTE0Mjg2IDcuNDgyOTIwNjMsNC41Mzk1OTc4OCA3LjQ4MjkyMDYzLDQuMjI0IEM3LjQ4MjkyMDYzLDMuOTA4NDAyMTIgNy42MDQ4MjU0LDMuNjM2ODI1NCA3Ljg0Mzg5NDE4LDMuNDEzMzMzMzMgQzguMDg1NjcxOTYsMy4xODg0ODY3NyA4LjM3NTUzNDM5LDMuMDc2NzQwNzQgOC43MTE0NDk3NCwzLjA3Njc0MDc0IEM5LjA0ODA0MjMzLDMuMDc2NzQwNzQgOS4zMzY1NTAyNiwzLjE4ODQ4Njc3IDkuNTc0OTQxOCwzLjQxMzMzMzMzIEM5LjgxNDAxMDU4LDMuNjM2ODI1NCA5LjkzMzg4MzYsMy45MDg0MDIxMiA5LjkzMzg4MzYsNC4yMjQgQzkuOTMzODgzNiw0LjUzOTU5Nzg4IDkuODE0MDEwNTgsNC44MDkxNDI4NiA5LjU3NDk0MTgsNS4wMzEyODA0MiBMOS41NzQ5NDE4LDUuMDMxMjgwNDIgWiIgaWQ9IlBhdGgiIGZpbGw9IiMwMDQ0Q0EiPjwvcGF0aD4NCiAgICAgICAgICAgIDxwYXRoIGQ9Ik05LjY2NTY5MzEyLDEyLjM5ODM5MTUgQzkuMjUzMjQ4NjgsMTIuNTYxNjA4NSA4LjkyNjEzNzU3LDEyLjY4NDE5MDUgOC42ODAyOTYzLDEyLjc2OTUyMzggQzguNDM0NDU1MDMsMTIuODU0ODU3MSA4LjE1MDAxMDU4LDEyLjg5ODIwMTEgNy44MjU2MDg0NywxMi44OTgyMDExIEM3LjMyNzE1MzQ0LDEyLjg5ODIwMTEgNi45MzkwODk5NSwxMi43NzYyOTYzIDYuNjYyNzcyNDksMTIuNTMyNDg2OCBDNi4zODY0NTUwMywxMi4yODkzNTQ1IDYuMjQ4OTczNTQsMTEuOTgxMjA2MyA2LjI0ODk3MzU0LDExLjYwNjY4NzggQzYuMjQ4OTczNTQsMTEuNDYxNzU2NiA2LjI1OTEzMjI4LDExLjMxMjc2MTkgNi4yNzk0NDk3NCwxMS4xNjAzODEgQzYuMzAwNDQ0NDQsMTEuMDA5MzU0NSA2LjMzMzYyOTYzLDEwLjgzODAxMDYgNi4zNzkwMDUyOSwxMC42NDcwMjY1IEw2Ljg5NDM5MTUzLDguODI1OTA0NzYgQzYuOTM5NzY3Miw4LjY1MTE3NDYgNi45NzkwNDc2Miw4LjQ4NTkyNTkzIDcuMDEwMjAxMDYsOC4zMzA4MzU5OCBDNy4wNDEzNTQ1LDguMTc0MzkxNTMgNy4wNTYyNTM5Nyw4LjAzMTQ5MjA2IDcuMDU2MjUzOTcsNy45MDIxMzc1NyBDNy4wNTYyNTM5Nyw3LjY3MDUxODUyIDcuMDA4MTY5MzEsNy41MDc5Nzg4NCA2LjkxMjY3NzI1LDcuNDE3MjI3NTEgQzYuODE2NTA3OTQsNy4zMjUxMjE2OSA2LjYzMzY1MDc5LDcuMjc5NzQ2MDMgNi4zNjI3NTEzMiw3LjI3OTc0NjAzIEM2LjIzMDAxMDU4LDcuMjc5NzQ2MDMgNi4wOTI1MjkxLDcuMzAwMDYzNDkgNS45NTIzMzg2Miw3LjM0MTM3NTY2IEM1LjgxMzUwMjY1LDcuMzgzMzY1MDggNS42OTM2Mjk2Myw3LjQyMjY0NTUgNS41OTQwNzQwNyw3LjQ2MDU3MTQzIEw1LjczMDIwMTA2LDYuODk5MTMyMjggQzYuMDY3NDcwOSw2Ljc2MTY1MDc5IDYuMzkwNTE4NTIsNi42NDQ0ODY3NyA2LjY5ODY2NjY3LDYuNTQ2OTYyOTYgQzcuMDA2ODE0ODEsNi40NDg3NjE5IDcuMjk4MDMxNzUsNi40IDcuNTcyMzE3NDYsNi40IEM4LjA2NzM4NjI0LDYuNCA4LjQ0OTM1NDUsNi41MTkxOTU3NyA4LjcxODIyMjIyLDYuNzU4MjY0NTUgQzguOTg1NzM1NDUsNi45OTczMzMzMyA5LjEyMDUwNzk0LDcuMzA4MTkwNDggOS4xMjA1MDc5NCw3LjY5MDgzNTk4IEM5LjEyMDUwNzk0LDcuNzcwMDc0MDcgOS4xMTEwMjY0Niw3LjkwODkxMDA1IDkuMDkyNzQwNzQsOC4xMDg2OTg0MSBDOS4wNzQ0NTUwMyw4LjMwODQ4Njc3IDkuMDM5OTE1MzQsOC40OTA2NjY2NyA4Ljk4OTc5ODk0LDguNjU3MjY5ODQgTDguNDc3MTIxNjksMTAuNDcyMjk2MyBDOC40MzUxMzIyOCwxMC42MTcyMjc1IDguMzk3ODgzNiwxMC43ODQ1MDc5IDguMzY0MDIxMTYsMTAuOTcxNDI4NiBDOC4zMzA4MzU5OCwxMS4xNTY5OTQ3IDguMzE0NTgyMDEsMTEuMjk5MjE2OSA4LjMxNDU4MjAxLDExLjM5NDcwOSBDOC4zMTQ1ODIwMSwxMS42MzY0ODY4IDguMzY4MDg0NjYsMTEuODAwMzgxIDguNDc2NDQ0NDQsMTEuODg3NzQ2IEM4LjU4MzQ0OTc0LDExLjk3NTExMTEgOC43NzEwNDc2MiwxMi4wMTkxMzIzIDkuMDM2NTI5MSwxMi4wMTkxMzIzIEM5LjE2MTgyMDExLDEyLjAxOTEzMjMgOS4zMDIwMTA1OCwxMS45OTY3ODMxIDkuNDYwNDg2NzcsMTEuOTUzNDM5MiBDOS42MTgyODU3MSwxMS45MDk0MTggOS43MzEzODYyNCwxMS44NzE0OTIxIDkuODAzMTc0NiwxMS44MzgzMDY5IEw5LjY2NTY5MzEyLDEyLjM5ODM5MTUgWiIgaWQ9IlBhdGgiIGZpbGw9IiMwMDQ0Q0EiPjwvcGF0aD4NCiAgICAgICAgPC9nPg0KICAgIDwvZz4NCjwvc3ZnPg==");
  }
  .notification-success .notification-title {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iSWNvbi1PayI+DQogICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTIiIGZpbGw9IiM0Q0Q5NjQiIGN4PSI4IiBjeT0iOCIgcj0iOCI+PC9jaXJjbGU+DQogICAgICAgICAgICA8cG9seWxpbmUgaWQ9IlN0cm9rZS0zIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgcG9pbnRzPSIxMiA2IDcuMDgzMDc0MTkgMTEgNCA4LjAwMzk3NTQyIj48L3BvbHlsaW5lPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+');
  }
  .notification-error .notification-title {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iSWNvbi1FcnJvci1XaGl0ZSI+DQogICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTIiIGZpbGw9IiNGRkZGRkYiIGN4PSI4IiBjeT0iOCIgcj0iOCI+PC9jaXJjbGU+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTEuNDI4NTcxNCw0LjU3MTQyODU3IEw0LjU3MTQyODU3LDExLjQyODU3MTQiIGlkPSJMaW5lIiBzdHJva2U9IiNGQTE2NjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICAgICAgPHBhdGggZD0iTTExLjQyODU3MTQsMTEuNDI4NTcxNCBMNC41NzE0Mjg1Nyw0LjU3MTQyODU3IiBpZD0iTGluZS1Db3B5IiBzdHJva2U9IiNGQTE2NjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+');
  }
`

export default NotificationsStyle
