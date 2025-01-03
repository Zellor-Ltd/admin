import { Col, PageHeader, Row } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AppSettings } from 'interfaces/AppSettings';
import { getSettings, updateSettings } from 'services/AdminService';
import { SimpleSwitch } from 'components/SimpleSwitch';

const Maintenance: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    underMaintenance: false,
  });

  const handleToggleStatus = async (checked: boolean) => {
    try {
      setLoading(true);
      await doRequest(
        async () => updateSettings({ underMaintenance: checked }),
        `App settings update successful`
      );
    } catch (error: any) {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const results: any = await doFetch(() => getSettings());
      setAppSettings(results);
    };

    fetch();
  }, []);

  return (
    <>
      <PageHeader title="App status" />
      <Row gutter={8}>
        <Col span={12} className="ml-05">
          <Row align="top" className="mt-15">
            <Col span={12}>
              <p>App under maintenance</p>
            </Col>
            <Col span={12}>
              <Row justify="end">
                <Col>
                  <SimpleSwitch
                    disabled={loading}
                    toggled={appSettings.underMaintenance}
                    handleSwitchChange={(toggled: boolean) =>
                      handleToggleStatus(toggled)
                    }
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default Maintenance;
