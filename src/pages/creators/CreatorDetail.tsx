import {
  FacebookFilled,
  GlobalOutlined,
  InstagramFilled,
  SoundFilled,
  TwitterCircleFilled,
  YoutubeFilled,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
  Tabs,
  Select,
  Slider,
  Typography,
} from 'antd';
import { Upload } from 'components';
import { ServerAlias } from 'interfaces/ServerAlias';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchServersList, saveCreator } from 'services/DiscoClubService';

const CreatorDetail: React.FC<RouteComponentProps> = props => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState(false);
  const [ageRange, setageRange] = useState<[number, number]>([12, 100]);
  const [serversList, setServersList] = useState<ServerAlias[]>([]);

  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const creator = form.getFieldsValue(true);
      await saveCreator(creator);
      setLoading(false);
      message.success('Register updated with success.');
      history.goBack();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const getServersList = async () => {
      const response: any = await fetchServersList();
      setServersList(response.results);
    };
    if (initial?.ageMin && initial?.ageMax)
      setageRange([initial?.ageMin, initial?.ageMax]);
    getServersList();
  }, [initial]);

  const onChangeAge = (value: [number, number]) => {
    form.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setageRange(value);
  };

  return (
    <>
      <PageHeader title="Creator Update" subTitle="Creator" />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initial}
        autoComplete="off"
      >
        <Tabs defaultActiveKey="Details">
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item label="First Name" name="firstName">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Last name" name="lastName">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  label="Email"
                  name="user"
                  rules={[
                    { type: 'email', message: 'please use an valid email' },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Password" name="pwd">
                  <Input.Password autoComplete="off" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Phone" name="phone">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Username" name="userName">
                  <Input prefix="@" autoComplete="off" />
                </Form.Item>
              </Col>

              <Col lg={12} xs={24}>
                <Form.Item name={'serverAlias'} label="Server Alias">
                  <Select>
                    {serversList.map(serverAlias => (
                      <Select.Option
                        key={serverAlias.alias}
                        value={serverAlias.alias}
                      >
                        {serverAlias.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Agreed Percentage" name="agreedPercentage">
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={4} xs={24}>
                <Form.Item label="Cover Picture">
                  <Upload.ImageUpload
                    fileList={initial?.coverPictureUrl}
                    formProp="coverPictureUrl"
                    form={form}
                  />
                </Form.Item>
              </Col>
              <Col lg={4} xs={24}>
                <Form.Item label="Avatar">
                  <Upload.ImageUpload
                    fileList={initial?.avatar}
                    formProp="avatar"
                    form={form}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Your Work" key="YourWork">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Form.Item
                  label="Describe your content focus"
                  name="contentFocus"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item
                  label="Top Brand collaborations you have completed"
                  name="topBrands"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Typography.Title level={4}>Target</Typography.Title>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Slider">
                  <Slider
                    range
                    marks={{ 12: '12', 100: '100' }}
                    min={12}
                    max={100}
                    value={ageRange}
                    onChange={onChangeAge}
                  />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="gender" label="Gender">
                  <Select mode="multiple">
                    <Select.Option value="Female">Female</Select.Option>
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                    <Select.Option value="Prefer not to say">
                      Prefer not to say
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Social" key="Social">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Typography.Title level={4}>Social Channels</Typography.Title>
              </Col>
            </Row>
            <Row>
              <Col lg={8} xs={24} md={24}>
                <Form.Item name="instagram" label="Instagram">
                  <Input prefix={<InstagramFilled />} />
                </Form.Item>
                <Form.Item name="facebook" label="Facebook">
                  <Input prefix={<FacebookFilled />} />
                </Form.Item>
                <Form.Item name="tiktok" label="TikTok">
                  <Input prefix={<SoundFilled />} />
                </Form.Item>
                <Form.Item name="youtube" label="Youtube">
                  <Input prefix={<YoutubeFilled />} />
                </Form.Item>
                <Form.Item name="website" label="Website">
                  <Input prefix={<GlobalOutlined />} />
                </Form.Item>
                <Form.Item name="twitter" label="Twitter">
                  <Input prefix={<TwitterCircleFilled />} />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CreatorDetail;
