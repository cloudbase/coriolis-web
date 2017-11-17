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

class DomUtils {
  static getEventPath(event) {
    let path = []
    let node = event.target
    while (node !== document.body && node.parentNode) {
      path.push(node)
      node = node.parentNode
    }

    return path
  }

  /**
   * Copies specified text to clipboard
   * @param {string} text The text to copy
   * @return True if successful, false otherwise
   */
  static copyTextToClipboard(text) {
    let textArea = document.createElement('textarea')
    textArea.style.position = 'fixed'
    textArea.style.top = 0
    textArea.style.left = 0
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = 0
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'

    textArea.value = text

    document.body.appendChild(textArea)

    textArea.select()

    let successful

    try {
      successful = document.execCommand('copy')
    } catch (e) {
      successful = false
    } finally {
      document.body.removeChild(textArea)
    }
    return successful
  }
}

export default DomUtils
