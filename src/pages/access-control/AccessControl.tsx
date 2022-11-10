/* eslint-disable react-hooks/exhaustive-deps */
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
} from 'antd';
import { Role } from 'interfaces/Role';
import { useContext, useState, useCallback, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import {
  fetchPrivileges,
  fetchProfiles,
  fetchEndpoints,
  savePrivileges,
  deletePrivileges,
} from 'services/DiscoClubService';
import CloneModal from './CloneModal';
import { Privilege } from 'interfaces/Privilege';
import { Endpoint } from 'interfaces/Endpoint';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useRequest } from 'hooks/useRequest';

const { TabPane } = Tabs;
const { Text } = Typography;

const methodsList = ['All', 'Search', 'GetById', 'Insert', 'Update', 'Remove'];

interface endpointPrivilege {
  privilege: Privilege | undefined;
  endpoint: Endpoint;
}

const AccessControl: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [profiles, setProfiles] = useState<string[]>([]);

  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [selectedMethod, setSelectedMethod] = useState<string>('All');

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [endpointPrivileges, setEndpointPrivileges] = useState<
    endpointPrivilege[]
  >([]);

  const [showCloneModal, setShowCloneModal] = useState<boolean>(false);

  const [form] = Form.useForm();
  const { isMobile } = useContext(AppContext);

  const getPrivileges = async (selectedProfile: string) => {
    try {
      const response: any = await fetchPrivileges(selectedProfile);
      setPrivileges(response.results);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getEndpoints = useCallback(async () => {
    try {
      const response: any = await doFetch(() => fetchEndpoints());
      setEndpoints(response.results);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getProfiles = useCallback(async () => {
    try {
      const response: any = await doFetch(() => fetchProfiles());
      const prof = response.results.map((profile: Role) => profile.name);
      setProfiles(prof);
      setSelectedProfile(prof[1]);
      getPrivileges(prof[1]);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const getResources = async () => {
      await Promise.all([getEndpoints(), getProfiles()]);
    };
    getResources();
  }, [getProfiles, getEndpoints]);

  useEffect(() => {
    const filteredEndpoints =
      selectedMethod === 'All'
        ? endpoints
        : endpoints.filter(endpoint => endpoint.action === selectedMethod);

    const filteredPrivileges = privileges.filter(
      privilege => privilege.isEndpoint
    );

    setEndpointPrivileges(
      filteredEndpoints.map(endpoint => {
        return {
          endpoint,
          privilege: filteredPrivileges.find(
            privilege => privilege.app === endpoint.name
          ),
        };
      })
    );
  }, [endpoints, privileges, selectedMethod, setEndpointPrivileges]);

  const onFinish = () => {
    console.log('finish');
  };

  const onCloneClick = () => {
    setShowCloneModal(true);
  };

  const onChangeProfile = (value: string) => {
    setLoading(true);
    getPrivileges(value);
    setSelectedProfile(value);
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  return (
    <>
      <PageHeader title="Access Control" className={isMobile ? 'mb-05' : ''} />
      <Row
        gutter={[8, 8]}
        justify={isMobile ? 'end' : 'start'}
        className="sticky-filter-box"
      >
        <Col lg={4} xs={24}>
          <Typography.Title level={5}>Profile</Typography.Title>
          <Select
            disabled={loading}
            placeholder="Select a Profile"
            style={{ width: '100%' }}
            onChange={onChangeProfile}
            value={selectedProfile}
            allowClear
            showSearch
            filterOption={filterOption}
          >
            {profiles.map((profile: any) => (
              <Select.Option key={profile} value={profile}>
                {profile}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={onCloneClick}
            disabled={!selectedProfile}
            className={isMobile ? 'mt-1' : 'mt-2'}
          >
            Clone
          </Button>
        </Col>
      </Row>
      <Form
        className="sticky-filter-box"
        form={form}
        name="accessControlForm"
        layout="vertical"
        onFinish={onFinish}
      >
        <div>
          <Tabs
            style={{ width: '100%' }}
            defaultActiveKey="template"
            onChange={setSelectedMethod}
            className="mt-05"
          >
            {methodsList.map((method, index) => (
              <TabPane tab={method} key={method}>
                <Row gutter={24}>
                  {loading ? (
                    <Spin style={{ margin: '0 auto' }} />
                  ) : (
                    endpointPrivileges.map((data, _index) => (
                      <FunctionPrivilege
                        endpointPrivilege={data}
                        profile={selectedProfile ?? ''}
                        key={`position_${_index}`}
                      />
                    ))
                  )}
                </Row>
              </TabPane>
            ))}
          </Tabs>
        </div>
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
      privileges: '',
      profile: profile,
      isEndpoint: true,
    }
  );
  const [loading, setLoading] = useState<boolean>(false);

  const onChangePermission = async (value: CheckboxChangeEvent) => {
    setLoading(true);
    if (value.target.checked) {
      const _privilege = { ...privilege, privileges: 'ADULM' };
      await savePrivileges(_privilege);
      setPrevilege(_privilege);
    } else {
      await deletePrivileges(privilege);
      const _privilege = { ...privilege, privileges: '' };
      setPrevilege(_privilege);
    }
    message.success('Changes saved!');
    setLoading(false);
  };

  return (
    <Col lg={8} xs={24} className="mt-05 mb-05">
      <Spin spinning={loading}>
        <Checkbox
          checked={privilege.privileges === 'ADULM'}
          onChange={onChangePermission}
        >
          <Text>{endpoint.name}</Text>
        </Checkbox>
      </Spin>
    </Col>
  );
};

export default AccessControl;
