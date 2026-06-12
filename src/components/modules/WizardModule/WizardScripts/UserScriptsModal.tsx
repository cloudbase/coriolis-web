/*
Copyright (C) 2026  Cloudbase Solutions SRL
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

import React from "react";
import styled from "styled-components";

import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import InfoIcon from "@src/components/ui/InfoIcon";
import DomUtils from "@src/utils/DomUtils";
import FileUtils from "@src/utils/FileUtils";

import type { InstanceScript } from "@src/@types/Instance";
import {
  USER_SCRIPT_PHASE_DESCRIPTIONS,
  USER_SCRIPT_PHASE_OPTIONS,
  USER_SCRIPT_PHASES,
  UserScriptPhase,
} from "@src/@types/Instance";

export type PhaseScript = { content: string | null; fileName: string | null };
export type ScriptsByPhase = Partial<Record<UserScriptPhase, PhaseScript>>;

const Wrapper = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
`;
const PhaseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${ThemePalette.grayscale[1]};
  padding: 16px 0;
  &:last-of-type {
    border-bottom: 1px solid ${ThemePalette.grayscale[1]};
  }
`;
const PhaseLabel = styled.div`
  display: flex;
  align-items: center;
  font-weight: ${ThemeProps.fontWeights.medium};
`;
const InfoIconStyled = styled(InfoIcon)`
  margin-left: 8px;
`;
const PhaseControl = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 16px;
`;
const FileName = styled.div`
  max-width: 180px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-right: 16px;
`;
const ActionLink = styled.div<{ red?: boolean }>`
  color: ${props => (props.red ? ThemePalette.alert : ThemePalette.primary)};
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;
const FakeFileInput = styled.input`
  position: absolute;
  opacity: 0;
  top: -99999px;
`;
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

type Props = {
  title: string;
  global: "windows" | "linux" | null;
  instanceId: string | null;
  scriptsByPhase: ScriptsByPhase;
  onRequestClose: () => void;
  onSave: (scripts: InstanceScript[]) => void;
};
type State = {
  scriptsByPhase: ScriptsByPhase;
};

class UserScriptsModal extends React.Component<Props, State> {
  fileInputRefs: { [phase: string]: HTMLInputElement | null } = {};

  constructor(props: Props) {
    super(props);
    this.state = { scriptsByPhase: { ...props.scriptsByPhase } };
  }

  getPhaseLabel(phase: UserScriptPhase): string {
    return (
      USER_SCRIPT_PHASE_OPTIONS.find(o => o.value === phase)?.label || phase
    );
  }

  setPhaseScript(phase: UserScriptPhase, script: PhaseScript) {
    this.setState(prevState => ({
      scriptsByPhase: { ...prevState.scriptsByPhase, [phase]: script },
    }));
  }

  async handleFileUpload(phase: UserScriptPhase, files: FileList | null) {
    if (!files || !files.length) {
      return;
    }
    const fileName = files[0].name;
    const content = await FileUtils.readTextFromFirstFile(files);
    this.setPhaseScript(phase, { content: content ?? null, fileName });
  }

  handleRemove(phase: UserScriptPhase) {
    this.setPhaseScript(phase, { content: null, fileName: null });
    const ref = this.fileInputRefs[phase];
    if (ref) {
      ref.value = "";
    }
  }

  handleDownload(phase: UserScriptPhase) {
    const entry = this.state.scriptsByPhase[phase];
    if (!entry?.content) {
      return;
    }
    const baseName = this.props.global || this.props.instanceId || "script";
    DomUtils.download(entry.content, entry.fileName || `${baseName}_${phase}`);
  }

  handleSave() {
    const scripts: InstanceScript[] = USER_SCRIPT_PHASES.reduce<
      InstanceScript[]
    >((acc, phase) => {
      const entry = this.state.scriptsByPhase[phase];
      if (entry && entry.content && entry.content.trim() !== "") {
        acc.push({
          global: this.props.global,
          instanceId: this.props.instanceId,
          phase,
          scriptContent: entry.content,
          fileName: entry.fileName ?? null,
        });
      }
      return acc;
    }, []);
    this.props.onSave(scripts);
    this.props.onRequestClose();
  }

  render() {
    return (
      <Wrapper>
        {USER_SCRIPT_PHASES.map(phase => {
          const entry = this.state.scriptsByPhase[phase];
          const hasContent = Boolean(entry?.content);
          return (
            <PhaseRow key={phase}>
              <PhaseLabel>
                {this.getPhaseLabel(phase)}
                <InfoIconStyled text={USER_SCRIPT_PHASE_DESCRIPTIONS[phase]} />
              </PhaseLabel>
              <PhaseControl>
                {hasContent ? (
                  <>
                    <FileName title={entry?.fileName || "Script selected"}>
                      {entry?.fileName || "Script selected"}
                    </FileName>
                    <ActionLink
                      style={{ marginRight: "16px" }}
                      onClick={() => this.handleDownload(phase)}
                    >
                      Download
                    </ActionLink>
                    <ActionLink red onClick={() => this.handleRemove(phase)}>
                      Remove
                    </ActionLink>
                  </>
                ) : (
                  <ActionLink
                    onClick={() => {
                      this.fileInputRefs[phase]?.click();
                    }}
                  >
                    Choose File...
                  </ActionLink>
                )}
                <FakeFileInput
                  type="file"
                  ref={(r: HTMLInputElement) => {
                    this.fileInputRefs[phase] = r;
                  }}
                  onChange={e => {
                    this.handleFileUpload(phase, e.target.files);
                  }}
                />
              </PhaseControl>
            </PhaseRow>
          );
        })}
        <Buttons>
          <Button secondary hollow onClick={() => this.props.onRequestClose()}>
            Cancel
          </Button>
          <Button onClick={() => this.handleSave()}>Save</Button>
        </Buttons>
      </Wrapper>
    );
  }
}

export default UserScriptsModal;
