import {
  Button,
  Checkbox,
  Col,
  Form,
  message,
  PageHeader,
  Row,
  Select,
  Spin,
  Switch,
  Tabs,
  Typography,
} from "antd";
import { Role } from "interfaces/Role";
import { useEffect, useState } from "react";
import {
  fetchPrivileges,
  fetchProfiles,
  savePrivileges,
} from "services/DiscoClubService";
import {
  PlusCircleOutlined,
  SearchOutlined,
  SyncOutlined,
  StopOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import CloneModal from "./CloneModal";
import { Privilege } from "interfaces/Privilege";

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const AccessControl: React.FC = () => {
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [showCloneModal, setShowCloneModal] = useState<boolean>(false);
  const [form] = Form.useForm();

  const fetchAccessControl = async () => {
    try {
      const response: any = await fetchPrivileges();
      setPrivileges(response.results);
    } catch (error) {
      console.log(error);
    }
  };

  const getProfiles = async () => {
    try {
      setProfileLoading(true);
      const response: any = await fetchProfiles();
      const prof = response.results.map((profile: Role) => profile.name);
      setProfiles(prof);
      setSelectedProfile(prof[1]);
      setProfileLoading(false);
    } catch (error) {
      setProfileLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getProfiles();
    fetchAccessControl();
  }, []);

  const endpointPrivileges = () => {
    return privileges.filter(
      (privilege) =>
        selectedProfile === privilege.profile && privilege.isEndpoint
    );
  };

  const screenPrivileges = () =>
    privileges.filter(
      (privilege) =>
        selectedProfile === privilege.profile && !privilege.isEndpoint
    );

  const onFinish = () => {
    console.log("finish");
  };

  const onCloneClick = () => {
    setShowCloneModal(true);
  };

  const onChangeProfile = (value: string) => {
    setSelectedProfile(value);
  };

  return (
    <>
      <PageHeader title="Access Control" />
      <Row gutter={8}>
        <Col xxl={4} lg={6} xs={18}>
          <Select
            placeholder="please select a profile"
            style={{ width: "100%" }}
            onChange={onChangeProfile}
            value={selectedProfile}
            loading={profileLoading}>
            {profiles.map((profie: any) => (
              <Select.Option key={profie} value={profie}>
                {profie}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={6}>
          <Button
            type="primary"
            onClick={onCloneClick}
            disabled={!selectedProfile}>
            Clone
          </Button>
        </Col>
      </Row>
      <Form
        form={form}
        name="accessContorlForm"
        layout="vertical"
        onFinish={onFinish}>
        <Tabs defaultActiveKey="template" style={{ width: "100%" }}>
          <TabPane tab="Endpoints" key="endpoints">
            <Row gutter={24}>
              {endpointPrivileges().map((privilege, index) => (
                <FunctionPrivilege
                  privilege={privilege}
                  position={index}
                  key={`position_${index}`}
                />
              ))}
            </Row>
          </TabPane>
          <TabPane tab="Screens" key="screens">
            <Row gutter={24}>
              {screenPrivileges().map((privilege, index) => (
                <FunctionPrivilege
                  privilege={privilege}
                  position={index}
                  key={`position_${index}`}
                />
              ))}
            </Row>
          </TabPane>
          <TabPane tab="All" key="all">
            <Row gutter={24}>
              {privileges
                .filter((privilege) => selectedProfile === privilege.profile)
                .map((privilege, index) => (
                  <FunctionPrivilege
                    privilege={privilege}
                    position={index}
                    key={`position_${index}`}
                  />
                ))}
            </Row>
          </TabPane>
        </Tabs>
      </Form>
      <CloneModal
        showCloneModal={showCloneModal}
        setShowCloneModal={setShowCloneModal}
        selectedProfile={selectedProfile}
        profiles={profiles}
        privileges={privileges}
      />
    </>
  );
};

interface FunctionPrivilegeProps {
  privilege: Privilege;
  position: number;
}

const getAdulObject = (privileges: string) => {
  let add = false;
  let delet = false;
  let update = false;
  let list = false;
  let menu = false;

  privileges.split("").forEach((privilege) => {
    switch (privilege) {
      case "A":
        add = true;
        break;
      case "D":
        delet = true;
        break;
      case "U":
        update = true;
        break;
      case "L":
        list = true;
        break;
      case "M":
        menu = true;
        break;
    }
  });
  return { add, delet, update, list, menu };
};

const FunctionPrivilege: React.FC<FunctionPrivilegeProps> = (props) => {
  const { privilege, position } = props;
  const { app, privileges } = privilege;
  const { add, delet, update, list, menu } = getAdulObject(privileges);
  const [allChecked, setAllChecked] = useState<boolean>(
    add && delet && update && list && menu
  );

  const [localAdd, setLocalAdd] = useState<boolean>(add);
  const [localDelete, setLocalDelete] = useState<boolean>(delet);
  const [localUpdate, setLocalUpdate] = useState<boolean>(update);
  const [localList, setLocalList] = useState<boolean>(list);
  const [localMenu, setLocalMenu] = useState<boolean>(menu);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLocalAdd(add);
  }, [add]);

  useEffect(() => {
    setLocalDelete(delet);
  }, [delet]);

  useEffect(() => {
    setLocalUpdate(update);
  }, [update]);

  useEffect(() => {
    setLocalList(list);
  }, [list]);

  useEffect(() => {
    setLocalMenu(menu);
  }, [menu]);

  useEffect(() => {
    setAllChecked(add && delet && update && list && menu);
  }, [add, delet, update, list, menu]);

  useEffect(() => {
    setAllChecked(
      localAdd && localDelete && localUpdate && localList && localMenu
    );
  }, [localAdd, localDelete, localUpdate, localList, localMenu]);

  const onChangeAll = async () => {
    setLoading(true);
    if (allChecked) privilege.privileges = "";
    else privilege.privileges = "ADULM";
    await savePrivileges(privilege);

    message.success("Changes saved!");
    setLocalAdd(!allChecked);
    setLocalDelete(!allChecked);
    setLocalUpdate(!allChecked);
    setLocalMenu(!allChecked);
    setLocalList(!allChecked);
    setAllChecked(!allChecked);
    setLoading(false);
  };

  const stringPermissionFromBooleans = (): string => {
    let perm = "";
    if (add) perm = "A";
    if (delet) perm += "D";
    if (update) perm += "U";
    if (list) perm += "L";
    if (menu) perm += "M";
    return perm;
  };

  const onChangePermission = async (
    permissionCheck: boolean,
    setFunction: (state: boolean) => void,
    permissionLetter: string
  ) => {
    setLoading(true);
    const priv = { ...privilege };
    priv.privileges = stringPermissionFromBooleans();
    if (permissionCheck)
      priv.privileges = priv.privileges.replace(permissionLetter, "");
    else priv.privileges += permissionLetter;
    await savePrivileges(priv);
    message.success("Changes saved!");
    setFunction(!permissionCheck);
    setLoading(false);
  };

  return (
    <Col span={8} style={{ margin: "8px 0" }}>
      {position < 3 && (
        <Row gutter={8}>
          <Col span={12}>
            <Title level={5}>Function</Title>
          </Col>
          <Col span={12}>
            <Title level={5}>Privilege</Title>
          </Col>
        </Row>
      )}

      <Spin spinning={loading}>
        <Row gutter={8}>
          <Col span={12}>
            <Checkbox onChange={onChangeAll} checked={allChecked}>
              <Text>{app}</Text>
            </Checkbox>
          </Col>
          <Col span={12}>
            <Row justify="space-between">
              <Switch
                checkedChildren={<PlusCircleOutlined />}
                unCheckedChildren={<StopOutlined />}
                checked={localAdd}
                onChange={() => onChangePermission(localAdd, setLocalAdd, "A")}
              />
              <Switch
                checkedChildren={<SyncOutlined />}
                unCheckedChildren={<StopOutlined />}
                checked={localDelete}
                onChange={() =>
                  onChangePermission(localDelete, setLocalDelete, "D")
                }
              />
              <Switch
                checkedChildren={<DeleteOutlined />}
                unCheckedChildren={<StopOutlined />}
                checked={localUpdate}
                onChange={() =>
                  onChangePermission(localUpdate, setLocalUpdate, "U")
                }
              />
              <Switch
                checkedChildren={<SearchOutlined />}
                unCheckedChildren={<StopOutlined />}
                checked={localList}
                onChange={() =>
                  onChangePermission(localList, setLocalList, "L")
                }
              />
              <Switch
                checkedChildren={<UnorderedListOutlined />}
                unCheckedChildren={<StopOutlined />}
                checked={localMenu}
                onChange={() =>
                  onChangePermission(localMenu, setLocalMenu, "M")
                }
              />
            </Row>
          </Col>
        </Row>
      </Spin>
    </Col>
  );
};

export default AccessControl;
