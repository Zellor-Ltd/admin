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
  Tabs,
  Typography,
} from "antd";
import { Role } from "interfaces/Role";
import { useEffect, useState } from "react";
import {
  fetchPrivileges,
  fetchProfiles,
  savePrivileges,
  fetchEndpoints,
} from "services/DiscoClubService";
import CloneModal from "./CloneModal";
import { Privilege } from "interfaces/Privilege";
import { Endpoint } from "interfaces/Endpoint";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

const { TabPane } = Tabs;
const { Text } = Typography;

const methodsList = ["All", "Search", "GetById", "Insert", "Update", "Delete"];

interface endpointPrivilege {
  privilege: Privilege | undefined;
  endpoint: Endpoint;
}

const AccessControl: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const [profiles, setProfiles] = useState<string[]>([]);

  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("All");

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [endpointPrivileges, setEndpointPrivileges] = useState<
    endpointPrivilege[]
  >([]);

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

  const getEndpoints = async () => {
    try {
      const response: any = await fetchEndpoints();
      setEndpoints(response.results);
    } catch (error) {
      console.log(error);
    }
  };

  const getProfiles = async () => {
    try {
      const response: any = await fetchProfiles();
      const prof = response.results.map((profile: Role) => profile.name);
      setProfiles(prof);
      setSelectedProfile(prof[1]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getResources = async () => {
      await Promise.all([getProfiles(), getEndpoints(), fetchAccessControl()]);
      setLoading(false);
    };
    getResources();
  }, []);

  useEffect(() => {
    const filteredEndpoints =
      selectedMethod === "All"
        ? endpoints
        : endpoints.filter((endpoint) => endpoint.action === selectedMethod);

    const filteredPrivileges = privileges.filter(
      (privilege) =>
        selectedProfile === privilege.profile && privilege.isEndpoint
    );

    setEndpointPrivileges(
      filteredEndpoints.map((endpoint) => {
        return {
          endpoint,
          privilege: filteredPrivileges.find(
            (privilege) => privilege.app === endpoint.name
          ),
        };
      })
    );
  }, [endpoints, privileges, selectedMethod, selectedProfile]);

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
      {loading ? (
        <Row justify="center">
          <Spin />
        </Row>
      ) : (
        <>
          <Row gutter={8}>
            <Col xxl={4} lg={6} xs={18}>
              <Select
                placeholder="please select a profile"
                style={{ width: "100%" }}
                onChange={onChangeProfile}
                value={selectedProfile}
              >
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
                disabled={!selectedProfile}
              >
                Clone
              </Button>
            </Col>
          </Row>
          <Form
            form={form}
            name="accessControlForm"
            layout="vertical"
            onFinish={onFinish}
          >
            <Tabs
              defaultActiveKey="template"
              style={{ width: "100%" }}
              onChange={setSelectedMethod}
            >
              {methodsList.map((method, index) => (
                <TabPane tab={method} key={method}>
                  <Row gutter={24}>
                    {endpointPrivileges.map((data, _index) => (
                      <FunctionPrivilege
                        endpointPrivilege={data}
                        profile={selectedProfile}
                        key={`position_${_index}`}
                      />
                    ))}
                  </Row>
                </TabPane>
              ))}
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
      )}
    </>
  );
};

interface FunctionPrivilegeProps {
  endpointPrivilege: endpointPrivilege;
  profile: string;
}

const FunctionPrivilege: React.FC<FunctionPrivilegeProps> = ({
  endpointPrivilege,
  profile,
}) => {
  const { privilege: initialPrivilege, endpoint } = endpointPrivilege;

  const [privilege, setPrevilege] = useState<Privilege>(
    initialPrivilege || {
      app: endpoint.name,
      privileges: "",
      profile: profile,
      isEndpoint: true,
    }
  );
  const [loading, setLoading] = useState<boolean>(false);

  const onChangePermission = async (value: CheckboxChangeEvent) => {
    setLoading(true);
    privilege.privileges = value.target.checked ? "ADULM" : ""
    await savePrivileges(privilege);
    setPrevilege(privilege);
    message.success("Changes saved!");
    setLoading(false);
  };

  return (
    <Col lg={8} md={12} xs={24} style={{ margin: "8px 0" }}>
      <Spin spinning={loading}>
        <Checkbox
          checked={privilege.privileges === "ADULM"}
          onChange={onChangePermission}
        >
          <Text>{endpoint.name}</Text>
        </Checkbox>
      </Spin>
    </Col>
  );
};

export default AccessControl;
