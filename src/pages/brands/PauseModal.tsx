import { Button, Col, Divider, Form, Input, Modal, Row } from "antd";
import { deactivateBrand, reactivateBrand } from "services/DiscoClubService";
import { useState } from "react";
import { useRequest } from "hooks/useRequest";

interface PauseModalProps {
  brandId: string;
  showPauseModal: boolean;
  isBrandPaused: boolean;
  setShowPauseModal: React.Dispatch<React.SetStateAction<boolean>>;
  onOk: Function;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  brandId,
  showPauseModal,
  setShowPauseModal,
  onOk,
  isBrandPaused,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });
  const [form] = Form.useForm();

  const _onOk = async (values: any) => {
    await doRequest(() =>
      isBrandPaused
        ? reactivateBrand(brandId, values.masterPassword)
        : deactivateBrand(brandId, values.masterPassword)
    );
    onOk();
    onClose();
  };

  const onClose = () => {
    form.resetFields();
    setShowPauseModal(false);
  };

  return (
    <Modal
      title="Pause Brand"
      visible={showPauseModal}
      width="400px"
      confirmLoading={loading}
      footer={false}
      forceRender
      onCancel={onClose}
    >
      <Form form={form} onFinish={_onOk}>
        <Form.Item
          label="Master Password"
          rules={[{ required: true }]}
          name="masterPassword"
        >
          <Input />
        </Form.Item>
        <Divider />
        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={onClose}>Cancel</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isBrandPaused ? "Reactivate" : "Deactivate"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PauseModal;
