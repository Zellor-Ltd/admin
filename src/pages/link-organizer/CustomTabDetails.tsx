import { Button, Col, Form, Image, Input, Row, Select, message } from "antd";
import SimpleSelect from "components/select/SimpleSelect";
import { useRequest } from "hooks/useRequest";
import { SelectOption } from "interfaces/SelectOption";
import { filter } from "lodash";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { fetchCustomLinks, updateCustomLinkList } from "services/DiscoClubService";
import { DebounceSelect } from 'components/select/DebounceSelect'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface CustomTabDetailsProps {
    links: any;
}


const CustomTabDetails: React.FC<CustomTabDetailsProps> = ({links}) => {
    const [loading, setLoading] = useState(false);
    const { doFetch } = useRequest({ setLoading });
    const history = useHistory();
    const [form] = Form.useForm();
    const [linkList, setLinkList] = useState<any[]>([]);
    const [selectedLink, setSelectedLink] = useState<any>();

    const fetch = async (query: string) => {
        const response = await doFetch(() => fetchCustomLinks(query)
        );
        setLinkList(response.results);
        return response.results;
    };

    useEffect(() => {
      console.log(links)
    }, [])

    const onFinish = async () => {
      setLoading(true);
      try {
        const role = form.getFieldsValue(true);
        role.description = form.getFieldValue('description');
        /* await */ /* saveRole(role); */
        setLoading(false);
        message.success('Register updated with success.');
        history.goBack();
      } catch (error) {
        setLoading(false);
      }
    };

    return (
      <>
        <Form
          name="roleForm"
          layout="vertical"
          form={form}
          initialValues={links}
          onFinish={onFinish}
        >
          <Row gutter={8}>
              <Col xs={24} lg={12}>
                <Form.Item label="List Name" name="name">
                  <Input allowClear placeholder="Enter a name" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <p className="mb-05">Select new Link</p>
                <DebounceSelect 
                  fetchOptions={(value) => fetch(value)}
                  style={{ width: '100%' }}
                  placeholder="Type to search"
                  onChange={(_, entity) =>
                    setSelectedLink(entity)
                  }
                  optionMapping={{
                    key: 'id',
                    value: 'id',
                    label: "'feed']['title'"
                  }}
                />
              </Col>
              <Col span={24}><div className="custom-link-container">
                {links.map((item) => {return (
                  <div className="custom-link-item">
                    <Image height={150} src={item.feed.package[0].thumbnailUrl} />
                    <p><a>{item.feed.package[0].videoUrl.substring(0,20)}...</a><br/>{item.feed.shortDescription}<br/>{item.feed.videoType.join("/")}</p>
                    </div>
                  )})}</div>
            </Col>
          </Row>
          <Row gutter={8} justify="end">
            <Col>
              <Button type="default" onClick={() => history.goBack()}>
                Cancel
              </Button>
            </Col>
            <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="mb-1"
                >
                  Save Changes
                </Button>
            </Col>
          </Row>
        </Form>
      </>
    );

};

export default CustomTabDetails;