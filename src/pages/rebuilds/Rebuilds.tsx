import { Button, Col, message as msg, PageHeader, Row } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useState } from 'react';
import { rebuildVLink } from '../../services/DiscoClubService';
import { RouteComponentProps } from 'react-router-dom';

const Rebuilds: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });

  const rebuild = async (path: string) => {
    try {
      await doRequest(async () => rebuildVLink(`paths: ["${path}"]`));
      msg.success('Rebuild successful.');
    } catch {}
  };

  const rebuildDisco = async () => {
    try {
      const { success, message }: any = await rebuildVLink({
        category: 'all',
        trend: 'all',
      });
      if (success) msg.success(`Success: ${message}`);
    } catch (error: any) {
      msg.error(`Error: ${error.error ?? 'Failed to rebuild. Try again.'} `);
    }
  };

  return (
    <>
      <PageHeader title="VLink Rebuilds" />
      <Row gutter={8}>
        <Col span={12} className="ml-15">
          <Row justify="space-between" align="top">
            <Col span={12}>
              <p className="mt-05">Rebuild Discoclub.com</p>
            </Col>
            <Col span={12}>
              <Row justify="end">
                <Col>
                  <Button
                    loading={loading}
                    type="primary"
                    onClick={rebuildDisco}
                  >
                    Rebuild
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <p className="mt-05">Rebuild Brands</p>
            </Col>
            <Col span={12}>
              <Row justify="end">
                <Col>
                  <Button
                    disabled
                    loading={loading}
                    type="primary"
                    onClick={() => rebuild('/Brands')}
                  >
                    Rebuild
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <p className="mt-05">Rebuild Product Brands</p>
            </Col>
            <Col span={12}>
              <Row justify="end">
                <Col>
                  <Button
                    disabled
                    loading={loading}
                    type="primary"
                    onClick={() => rebuild('/ProductBrands')}
                  >
                    Rebuild
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <p className="mt-05">Rebuild Creators</p>
            </Col>
            <Col span={12}>
              <Row justify="end">
                <Col>
                  <Button
                    disabled
                    loading={loading}
                    type="primary"
                    onClick={() => rebuild('/Creators')}
                  >
                    Rebuild
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <p className="mt-05">Rebuild Video Feeds</p>
            </Col>
            <Col span={12}>
              <Row justify="end">
                <Col>
                  <Button
                    disabled
                    loading={loading}
                    type="primary"
                    onClick={() => rebuild('/Feeds')}
                  >
                    Rebuild
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default Rebuilds;
