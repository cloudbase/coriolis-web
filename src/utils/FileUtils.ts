/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import JSZip from "jszip";

export type FileContent = {
  name: string;
  content: string;
};

class FileUtils {
  static async readFile(file: File): Promise<FileContent> {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = e => {
        const content: any = e.target?.result;
        resolve({ name: file.name, content });
      };
      reader.onerror = e => {
        reject(e);
      };
      reader.readAsText(file);
    });
  }

  static async readContentFromFileList(
    fileList: FileList | null,
  ): Promise<FileContent[]> {
    if (!fileList || !fileList.length) {
      return [];
    }
    const result: FileContent[] = [];
    await Promise.all(
      Array.from(fileList).map(async file => {
        if (file.name.substr(file.name.length - 4) === ".zip") {
          const zip = await JSZip.loadAsync(file);
          await Promise.all(
            Object.keys(zip.files).map(async zipFileName => {
              if (zipFileName.indexOf("__MACOSX") === 0) {
                return;
              }
              const zipContent = await zip.files[zipFileName].async("string");
              result.push({ name: zipFileName, content: zipContent });
            }),
          );
        } else {
          const fileContent = await this.readFile(file);
          result.push(fileContent);
        }
      }),
    );
    return result;
  }

  static readTextFromFirstFile(fileList: FileList): Promise<string | null> {
    if (!fileList.length) {
      return Promise.resolve(null);
    }
    const file = fileList[0];
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = e => {
        const content: any = e.target?.result;
        resolve(content);
      };
      reader.onerror = e => {
        reject(e);
      };
      reader.readAsText(file);
    });
  }
}

export default FileUtils;
