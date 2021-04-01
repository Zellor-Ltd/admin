import { Form, message, Modal, Select, Typography } from "antd";
import { Privilege } from "interfaces/Privilege";
import { savePrivileges } from "services/DiscoClubService";

interface CloneModalProps {
  showCloneModal: boolean;
  setShowCloneModal: (visible: boolean) => void;
  selectedProfile: string | undefined;
  privileges: Privilege[];
  profiles: string[];
}

const CloneModal: React.FC<CloneModalProps> = ({
  showCloneModal,
  setShowCloneModal,
  selectedProfile,
  privileges,
  profiles,
}) => {
  const [form] = Form.useForm();

  const onFinish = () => {
    form.validateFields().then(async ({ profile }) => {
      const clonedPrivileges = privileges.filter(
        (privilege) => privilege.profile === selectedProfile
      );
      const profilePrivileges = privileges.filter(
        (privilege) => privilege.profile === profile
      );
      const profilesToSave = profilePrivileges.reduce(
        (prev: Privilege[], curr) => {
          const currPrivilege = { ...curr };
          const indexClone = clonedPrivileges.findIndex(
            (privilege) => privilege.app === currPrivilege.app
          );
          if (indexClone > -1) {
            const [privilegeClone] = clonedPrivileges.splice(indexClone, 1);
            currPrivilege.privileges = privilegeClone.privileges;
          }
          prev.push(currPrivilege);
          return prev;
        },
        []
      );

      profilesToSave.push(
        ...clonedPrivileges.map(({ app, isEndpoint, privileges }) => ({
          app,
          isEndpoint,
          privileges,
          profile: profile,
        }))
      );
      profilesToSave.forEach(async (profile) => {
        const response: any = await savePrivileges(profile);
        if (response.success) message.success("Profile clone was successfull");
        else message.error(response.error);
      });

      setShowCloneModal(false);
    });
  };

  return (
    <Modal
      visible={showCloneModal}
      onCancel={() => setShowCloneModal(false)}
      title="Clone profile"
      onOk={() => form.submit()}
      forceRender>
      <Form onFinish={onFinish} layout="vertical" form={form}>
        <Typography.Title level={5}>
          {`Cloning `}
          <Typography.Text strong> {`${selectedProfile}`}</Typography.Text>
        </Typography.Title>
        <Form.Item name="profile" label="Profile" rules={[{ required: true }]}>
          <Select
            placeholder="Select a profile to save"
            style={{ width: "100%" }}
            value={selectedProfile}>
            {profiles
              .filter((profile) => profile !== selectedProfile)
              .map((profie: any) => (
                <Select.Option key={profie} value={profie}>
                  {profie}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CloneModal;
