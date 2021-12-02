import { Col, Form, Input, Modal, Row } from 'antd';
import { useResetFormOnCloseModal } from 'hooks/useResetFormCloseModal';
import { Fan } from 'interfaces/Fan';
import { useEffect, useState } from 'react';
import { useRequest } from 'hooks/useRequest';
import { updateManyFans } from 'services/DiscoClubService';
import { EditMultipleModalProps } from 'components/EditMultipleButton';
import FanGroupDropdown from './FanGroupDropdown';

const EditFanModal: React.FC<EditMultipleModalProps<Fan>> = ({
  selectedItems: selectedFans,
  visible,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });

  useEffect(() => {
    form.resetFields();
  }, [form]);

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const _onOk = () => {
    form.validateFields().then(async () => {
      const fanGroup = form.getFieldValue('group');
      const fansToUpdateIds = selectedFans.map(fan => fan.id);
      await doRequest(
        () => updateManyFans(fanGroup, fansToUpdateIds),
        'Fans updated.'
      );
      onOk();
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Update Fans"
      visible={visible}
      okText="Save"
      onOk={_onOk}
      onCancel={onCancel}
      width="300px"
      okButtonProps={{ loading: loading }}
      forceRender
    >
      <Form form={form} name="updateFans" layout="vertical">
        <Input.Group>
          <Row gutter={8} justify="center">
            <Col>
              <FanGroupDropdown
                form={form}
                loading={loading}
                setLoading={setLoading}
              />
            </Col>
          </Row>
        </Input.Group>
      </Form>
    </Modal>
  );
};

export default EditFanModal;
