import { Col, PageHeader, Row, Switch } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AppSettings } from 'interfaces/AppSettings';
import { getSettings, updateSettings } from 'services/AdminService';

const Settings: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    id: '',
    underMaintenance: false,
  });
  const toggled = appSettings.underMaintenance;

  const toggleStatus = async (checked: boolean) => {
    try {
      setLoading(true);
      await doRequest(
        async () =>
          updateSettings({ ...appSettings, underMaintenance: checked }),
        `App settings update successful`
      );
      setAppSettings((prev: AppSettings) => ({
        ...prev,
        underMaintenance: !prev.underMaintenance,
      }));
    } catch (error: any) {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const results: any = await getSettings();
      setAppSettings(results);
    };

    fetch();
  }, []);

  return (
    <>
      <PageHeader title="App settings" className="mt-1" />
      <Row gutter={8}>
        <Col span={12}>
          <Row align="top" className="mt-15">
            <Col span={12}>
              <p>Under maintenance</p>
            </Col>
            <Col span={12}>
              <Row justify="end">
                <Col>
                  <Switch
                    onChange={(toggled: boolean) => toggleStatus(toggled)}
                    checked={toggled}
                    loading={loading}
                    disabled={loading}
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

export default Settings;
