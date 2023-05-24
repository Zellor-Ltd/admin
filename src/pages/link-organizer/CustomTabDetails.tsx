import { Button, Col, Form, Image, Input, Row, Select, message } from "antd";
import { useRequest } from "hooks/useRequest";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { fetchCustomLinks, saveCustomLinkList } from "services/DiscoClubService";
import { DebounceSelect } from 'components/select/DebounceSelect'
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag } from 'react-dnd'
import update from 'immutability-helper';

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

    const type = 'carousel-item'
    const DraggableBodyRow = ({
      index,
      className,
      key,
      onClick,
      children
    }: any) => {
      const ref = useRef<HTMLDivElement>(null);
      const [{ isOver }, drop] = useDrop({
        accept: type,
        collect: monitor => {
          const { index: dragIndex } = (monitor.getItem() || {}) as any;
          if (dragIndex === index) {
            return {};
          }
          return {
            isOver: monitor.isOver(),
          };
        },
        drop: (item: { index: number }) => {
          moveRow(item.index, index);
        },
      });
      const [, drag] = useDrag({
        type,
        item: { index },
        collect: monitor => ({
          isDragging: monitor.isDragging(),
        }),
      });
      drop(drag(ref));

      const moveRow = useCallback(
        (dragIndex: number, hoverIndex: number) => {
          if (!itemLinks.length) return;
          const dragRow = itemLinks[dragIndex];
          setItemLinks(
            update(itemLinks, {
              $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, dragRow],
              ],
            })
          );
        },
        [itemLinks]
      );
  
      return (
        <div
          ref={ref}
          className={className}
          style={{ cursor: 'move' }}
          key={key}
          onClick={onClick}
        >{children}
        </div>
      );
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
                <DndProvider backend={HTML5Backend}>
                <div className="custom-link-container">
                  {itemLinks.map((item, index) => {
                    return (
                      <DraggableBodyRow key={item ? item?.id : 0} className={index === focusIndex ? "custom-link-item carousel-focus mr-1" : "custom-link-item mr-1"} onClick={() => setFocusIndex(index)}>
                        <Image height={150} src={item?.feed?.package[0]?.thumbnailUrl} />
                        <p>
                          <a>{item?.feed?.package[0]?.videoUrl?.substring(0,20)}{item?.feed?.package[0]?.videoUrl && '...'}</a>
                          <br/>{item?.feed?.shortDescription?.substring(0,20)}{item?.feed?.shortDescription && '...'}
                          <br/>Type: {item?.feed?.videoType?.join("/")}
                        </p>
                      </DraggableBodyRow>
                    )})}
                </div>
                </DndProvider>
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