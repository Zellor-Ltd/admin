import { Button, Col, Form, Input, PageHeader, Row, Typography } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useState } from 'react';
import { rebuildVLink } from '../../services/DiscoClubService';
import { RouteComponentProps } from 'react-router-dom';
import { MinusCircleOutlined } from '@ant-design/icons';

const Transformations: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [processName, setProcessName] = useState<String>('');
  const { doRequest } = useRequest({ setLoading });

  interface ItemListProp {
    name: string;
  }
  /* 
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
  }; */

  const ItemList: React.FC<ItemListProp> = ({ name }) => (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <div>
          <Button className="mb-1 mt-05" onClick={() => add()}>
            Add {name.charAt(0)?.toUpperCase() + name.slice(1)}
          </Button>
          {fields.map(field => (
            <Row gutter={8} key={Math.random()}>
              <Col lg={12} xs={24}>
                <Form.Item
                  name={[field.name, 'from']}
                  fieldKey={[field.key, 'from']}
                  label="From"
                >
                  <Input allowClear placeholder="Previous URL" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Row justify="space-between">
                  <Col>
                    <Typography.Text>To</Typography.Text>
                  </Col>
                  <Col>
                    <Typography.Text>
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        className="mr-06 mb-08"
                      />
                    </Typography.Text>
                  </Col>
                </Row>
                <Form.Item
                  name={[field.name, 'to']}
                  fieldKey={[field.key, 'to']}
                >
                  <Input allowClear placeholder="New URL" />
                </Form.Item>
              </Col>
            </Row>
          ))}
        </div>
      )}
    </Form.List>
  );

  return (
    <>
      <PageHeader title="SM Transformations" />
      <Row gutter={8}>
        <Col span={12}>
          <ItemList name="URLs" />
          <Form.Item name="from" label="From">
            <Input allowClear placeholder="Previous URL" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="to" label="To">
            <Input allowClear placeholder="New URL" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default Transformations;
