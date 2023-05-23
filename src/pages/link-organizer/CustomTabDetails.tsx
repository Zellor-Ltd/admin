import { Button, Col, Form, Image, Input, Row, Select, message } from "antd";
import { useRequest } from "hooks/useRequest";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { fetchCustomLinks, saveCustomLinkList } from "services/DiscoClubService";
import { DebounceSelect } from 'components/select/DebounceSelect'

interface CustomTabDetailsProps {
    customList?: any;
}


const CustomTabDetails: React.FC<CustomTabDetailsProps> = ({customList}) => {
    const [loading, setLoading] = useState(false);
    const { doFetch } = useRequest({ setLoading });
    const history = useHistory();
    const [form] = Form.useForm();
    const [itemLinks, setItemLinks] = useState<any[]>(customList?.links ?? []);
    const [_, setQueriedLinks] = useState<any[]>([]);
    const [selectedLink, setSelectedLink] = useState<any>();
    const [focusIndex, setFocusIndex] = useState<number>(0);

    useEffect(() => {
      if (selectedLink)
      setItemLinks([...itemLinks, selectedLink])
    }, [selectedLink])

    const fetch = async (query: string) => {
        const response = await doFetch(() => fetchCustomLinks(query)
        );
        setQueriedLinks(response.results);
        return response.results;
    };

    const onFinish = async () => {
      setLoading(true);
      try {
        const customListForm = form.getFieldsValue(true);
        customListForm.links = itemLinks;
        saveCustomLinkList(customListForm); 
        message.success('List saved with success.');
        history.goBack();
      } catch (error) {
        message.error('Something went wrong. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <Form
          name="roleForm"
          layout="vertical"
          form={form}
          initialValues={customList}
          onFinish={onFinish}
        >
          <Row gutter={8}>
              <Col xs={24} lg={12}>
                <Form.Item label="List Name" name="name">
                  <Input allowClear placeholder="Enter a name" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <p className="mb-05">Insert new Link</p>
                <DebounceSelect 
                  fetchOptions={(value) => fetch(value)}
                  style={{ width: '100%' }}
                  placeholder="Type to search"
                  onChange={(_, entity) =>
                    {if (entity)
                    setSelectedLink(entity)
                  }}
                  optionMapping={{
                    key: 'id',
                    value: 'id',
                    label: "'feed']['title'"
                  }}
                />
              </Col>
              {itemLinks.length && 
              <Col span={24}>
                <div className="custom-link-container">
                  {itemLinks.map((item, index) => {
                    return (
                      <div key={item ? item?.id : 0} className={index === focusIndex ? "custom-link-item carousel-focus" : "custom-link-item"} onClick={() => setFocusIndex(index)}>
                        <Image height={150} src={item?.feed?.package[0]?.thumbnailUrl} />
                        <p>
                          <a>{item?.feed?.package[0]?.videoUrl?.substring(0,20)}{item?.feed?.package[0]?.videoUrl && '...'}</a>
                          <br/>{item?.feed?.shortDescription?.substring(0,20)}{item?.feed?.shortDescription && '...'}
                          <br/>Type: {item?.feed?.videoType?.join("/")}
                        </p>
                      </div>
                    )})}
                </div>
            </Col>}
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