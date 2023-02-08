import { Button, Col, PageHeader, Row } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useState } from 'react';
import { rebuildVLink } from '../../services/DiscoClubService';
import { RouteComponentProps } from 'react-router-dom';

const Rebuilds: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [processName, setProcessName] = useState<String>("");
  const { doRequest } = useRequest({ setLoading });

  const rebuild = async (
    path: string,
    feature: string = ""
    ) => {
    try {
      setProcessName(path)
      await doRequest(
        async () => rebuildVLink(path),
        `Rebuild: ${feature} successful`
      )
    } catch (error: any) {
      setLoading(false)
    }
  };

  const isLoadingByProcess = (path: string): boolean => {
    return (loading && processName === path)
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
                    disabled={loading}
                    loading={isLoadingByProcess('feeds/All/All')}
                    type="primary"
                    onClick={() => rebuild('feeds/All/All','Discoclub.com')}
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
                    disabled={loading}
                    loading={isLoadingByProcess('Brands')}
                    type="primary"
                    onClick={() => rebuild('Brands','Brands')}
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
                    disabled={loading}
                    loading={isLoadingByProcess('ProductBrands')}
                    type="primary"
                    onClick={() => rebuild('ProductBrands','Product Brands')}
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
                    disabled={loading}
                    loading={isLoadingByProcess('Creators')}
                    type="primary"
                    onClick={() => rebuild('Creators','Creators')}
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
                    disabled={loading}
                    loading={isLoadingByProcess('Feeds')}
                    type="primary"
                    onClick={() => rebuild('Feeds','Feeds')}
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
