import { Modal } from "antd";

interface PauseModalProps {
  showPauseModal: boolean;
  setShowPauseModal: React.Dispatch<React.SetStateAction<boolean>>;
  onOk: Function;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  showPauseModal,
  setShowPauseModal,
  onOk,
}) => {
  const _onOk = async () => {
    await onOk();
    setShowPauseModal(false);
  };

  const onClose = () => {
    setShowPauseModal(false);
  };

  return (
    <Modal
      title="Pause Brand"
      visible={showPauseModal}
      width="400px"
      onOk={_onOk}
      onCancel={onClose}
      forceRender
    >
      <div>
        <p>Are you sure? There is no going back.</p>
      </div>
    </Modal>
  );
};

export default PauseModal;
