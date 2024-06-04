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

import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";

import { ThemePalette } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import Modal from "@src/components/ui/Modal";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
`;
const Message = styled.div<any>`
  font-size: 18px;
  text-align: center;
  margin-top: 48px;
`;
const ExtraMessage = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  margin: 11px 0 48px 0;
  text-align: center;
  font-size: 12px;
`;
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: flex-end;
`;
const ButtonsColumn = styled.div<any>`
  display: flex;
  flex-direction: column;
`;
const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 64px;
`;
const LoadingMessage = styled.div`
  max-width: 100%;
  overflow: auto;
  margin-top: 48px;
  text-align: center;
`;
const LoadingTitle = styled.div`
  font-size: 18px;
  margin-bottom: 8px;
`;
const LoadingSubtitle = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
`;

type Props = {
  hasDisks: boolean;
  isMultiReplicaSelection?: boolean;
  loading?: boolean;
  onDeleteReplica: () => void;
  onDeleteDisks: () => void;
  onRequestClose: () => void;
};

@observer
class DeleteReplicaModal extends React.Component<Props> {
  renderExtraMessage() {
    if (this.props.hasDisks) {
      if (this.props.isMultiReplicaSelection) {
        return (
          <ExtraMessage>
            Some of the selected Replicas have been executed at least once and
            thus may have disks created on the destination platform. If those
            Replicas are to be deleted now, the disks on the destination will
            persist. If this is not desired, please use the &quot;Delete Replica
            Disks&quot; option to delete those disks before deleting the
            Replicas themselves.
          </ExtraMessage>
        );
      }

      return (
        <ExtraMessage>
          This Replica has been executed at least once and thus may have disks
          created on the destination platform. If the Replica is to be deleted
          now, the disks on the destination will persist. If this is not
          desired, please use the &quot;Delete Replica Disks&quot; option to
          delete the disks before deleting the Replica itself.
        </ExtraMessage>
      );
    }

    return (
      <ExtraMessage>Deleting a Coriolis Replica is permanent!</ExtraMessage>
    );
  }

  renderLoading() {
    return (
      <Loading>
        <StatusImage loading />
        <LoadingMessage>
          <LoadingTitle>Validating Replicas Details</LoadingTitle>
          <LoadingSubtitle>Please wait ...</LoadingSubtitle>
        </LoadingMessage>
      </Loading>
    );
  }

  renderContent() {
    const message = this.props.isMultiReplicaSelection
      ? "Are you sure you want to delete the selected replicas?"
      : "Are you sure you want to delete this replica?";

    return (
      <Wrapper>
        <StatusImage status="QUESTION" />
        <Message>{message}</Message>
        {this.renderExtraMessage()}
        <Buttons>
          <Button secondary onClick={this.props.onRequestClose}>
            Cancel
          </Button>
          <ButtonsColumn>
            {this.props.hasDisks ? (
              <Button
                onClick={this.props.onDeleteDisks}
                hollow
                style={{ marginBottom: "16px" }}
                alert
              >
                Delete Replica Disks
              </Button>
            ) : null}
            <Button onClick={this.props.onDeleteReplica} alert>
              Delete Replica{this.props.isMultiReplicaSelection ? "s" : ""}
            </Button>
          </ButtonsColumn>
        </Buttons>
      </Wrapper>
    );
  }

  render() {
    const title = this.props.isMultiReplicaSelection
      ? "Delete Selected Transfers?"
      : "Delete Transfer?";
    return (
      <Modal isOpen title={title} onRequestClose={this.props.onRequestClose}>
        {this.props.loading ? this.renderLoading() : this.renderContent()}
      </Modal>
    );
  }
}

export default DeleteReplicaModal;
