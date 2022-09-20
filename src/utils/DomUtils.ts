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

import { Base64 } from "js-base64";

class DomUtils {
  static getScrollableParent(
    element: HTMLElement,
    includeHidden?: boolean
  ): HTMLElement {
    let style = getComputedStyle(element);
    const excludeStaticParent = style.position === "absolute";
    const overflowRegex = includeHidden
      ? /(auto|scroll|hidden)/
      : /(auto|scroll)/;
    const windowElement: any = window;

    if (style.position === "fixed") {
      return windowElement;
    }
    /* eslint no-cond-assign: off */
    for (
      let parent: HTMLElement | null = element;
      (parent = parent.parentElement);

    ) {
      style = getComputedStyle(parent);
      if (excludeStaticParent && style.position === "static") {
        /* eslint no-continue: off */
        continue;
      }
      if (
        overflowRegex.test(style.overflow + style.overflowY + style.overflowX)
      ) {
        const htmlEl: any = parent;
        return htmlEl;
      }
    }

    return windowElement;
  }

  static isElementInViewport(el: HTMLElement, scrollableParent: any): boolean {
    const rect = el.getBoundingClientRect();
    const scrollableRect = scrollableParent.getBoundingClientRect
      ? scrollableParent.getBoundingClientRect()
      : {
          top: 0,
          left: 0,
          bottom: scrollableParent.innerHeight
            ? scrollableParent.innerHeight
            : window.innerHeight,
          right: scrollableParent.innerWidth
            ? scrollableParent.innerWidth
            : window.innerWidth,
        };

    return (
      rect.top + rect.height >= scrollableRect.top &&
      rect.left >= scrollableRect.left &&
      rect.bottom - rect.height <= scrollableRect.bottom &&
      rect.right <= scrollableRect.right
    );
  }

  static getEventPath(event: Event): HTMLElement[] {
    const path = [];
    let node: any = event.target;

    while (node !== document.body && node.parentNode) {
      path.push(node);

      node = node.parentNode;
    }

    return path;
  }

  /**
   * Copies specified text to clipboard
   * @param {string} text The text to copy
   * @return True if successful, false otherwise
   */
  static copyTextToClipboard(text: string): boolean {
    const textArea = document.createElement("textarea");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";

    textArea.value = text;

    if (document.body) document.body.appendChild(textArea);

    textArea.select();

    let successful;

    try {
      successful = document.execCommand("copy");
    } catch (e) {
      successful = false;
    } finally {
      if (document.body) document.body.removeChild(textArea);
    }
    return successful;
  }

  static download(text: string, fileName: string) {
    const href = `data:text/json;charset=utf-8,${encodeURIComponent(text)}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", href);
    downloadAnchorNode.setAttribute("download", fileName);
    if (document.body) {
      document.body.appendChild(downloadAnchorNode); // required for firefox
    }
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  static executeDownloadLink(href: string) {
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", href);
    if (document.body) {
      document.body.appendChild(downloadAnchorNode); // required for firefox
    }
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  static jsonSyntaxHighlight(json: any) {
    const newJson = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return newJson.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match: any) => {
        let cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }

  static isSafari() {
    return (
      navigator.userAgent.indexOf("Chrome") === -1 &&
      navigator.userAgent.indexOf("Safari") > -1
    );
  }

  static encodeToBase64Url(data: any) {
    let dataStr: string;
    if (typeof data === "string") {
      dataStr = data;
    } else {
      dataStr = JSON.stringify(data);
    }

    return Base64.encode(dataStr).replace(/\+/g, "-").replace(/\//g, "_");
  }

  static decodeFromBase64Url(data: string) {
    return JSON.parse(
      Base64.decode(data.replace(/-/g, "+").replace(/_/g, "/"))
    );
  }
}

export default DomUtils;
