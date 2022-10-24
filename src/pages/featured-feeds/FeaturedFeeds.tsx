/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Col,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { FeedItem } from '../../interfaces/FeedItem';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  deleteFeaturedFeed,
  fetchFeaturedFeeds,
  updateFeaturedFeed,
} from '../../services/DiscoClubService';
import '@pathofdev/react-tag-input/build/index.css';
import { useRequest } from '../../hooks/useRequest';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { useSelector } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
interface DraggableBodyRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const type = 'DraggableBodyRow';

const FeaturedFeed: React.FC<RouteComponentProps> = () => {
  const {
    settings: { feedList = [] },
  } = useSelector((state: any) => state.settings);
  const [loading, setLoading] = useState(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [listRef, setListRef] = useState<any[]>([]);
  const [featuredFeeds, setFeaturedFeeds] = useState<any[]>([]);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const { isMobile } = useContext(AppContext);

  const fetch = async (input: string) => {
    try {
      const { results }: any = await doFetch(() => fetchFeaturedFeeds(input));
      setListRef(results);
      setFeaturedFeeds(results);
    } catch (error) {}
  };

  const deleteItem = async (_id: string, index: number) => {
    await deleteFeaturedFeed(_id);
    setFeaturedFeeds(featuredFeeds.filter(item => item.id !== _id));
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Index',
      width: '3%',
      dataIndex: 'id',
      align: 'center',
      render: (_: number, entity: any, index: number) => `${index}`,
    },
    {
      title: 'Creator',
      dataIndex: ['creator', 'firstName'],
      width: '18%',
      sorter: (a, b): any => {
        if (a.creator?.firstName && b.creator?.firstName)
          return a.creator?.firstName.localeCompare(
            b.creator?.firstName as string
          );
        else if (a.creator?.firstName) return -1;
        else if (b.creator?.firstName) return 1;
        else return 0;
      },
    },
    {
      title: 'Creator Username',
      dataIndex: ['creator', 'userName'],
      width: '18%',
      sorter: (a, b): any => {
        if (a.creator?.userName && b.creator?.userName)
          return a.creator?.userName.localeCompare(
            b.creator?.userName as string
          );
        else if (a.creator?.userName) return -1;
        else if (b.creator?.userName) return 1;
        else return 0;
      },
    },
    {
      title: 'Product Brand',
      dataIndex: ['productBrand', 'name'],
      width: '18%',
      render: (value: string, record: FeedItem, index: number) => (
        <Link
          onClick={() => editList(index)}
          to={{ pathname: window.location.pathname }}
        >
          {value}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.productBrand?.name && b.productBrand?.name)
          return a.productBrand?.name.localeCompare(
            b.productBrand?.name as string
          );
        else if (a.productBrand?.name) return -1;
        else if (b.productBrand?.name) return 1;
        else return 0;
      },
    },
    {
      title: 'Product Brand Description',
      dataIndex: ['productBrand', 'description'],
      width: '18%',
      sorter: (a, b): any => {
        if (a.productBrand?.description && b.productBrand?.description)
          return a.productBrand?.description.localeCompare(
            b.productBrand?.description as string
          );
        else if (a.productBrand?.description) return -1;
        else if (b.productBrand?.description) return 1;
        else return 0;
      },
    },
    {
      title: 'Product Brand vLinkDescription',
      dataIndex: ['productBrand', 'vLinkDescription'],
      width: '18%',
      sorter: (a, b): any => {
        if (
          a.productBrand?.vLinkDescription &&
          b.productBrand?.vLinkDescription
        )
          return a.productBrand?.vLinkDescription.localeCompare(
            b.productBrand?.vLinkDescription as string
          );
        else if (a.productBrand?.vLinkDescription) return -1;
        else if (b.productBrand?.vLinkDescription) return 1;
        else return 0;
      },
    },
    {
      title: 'Product Brand Link',
      width: '18%',
      dataIndex: ['productBrand', 'brandLink'],
      render: (value: string) => (
        <Link
          onClick={() => {
            if (value) window.open(value, '_blank')?.focus();
          }}
          to={{ pathname: window.location.pathname }}
        >
          {value ?? '-'}
        </Link>
      ),
      sorter: (a: any, b: any): any => {
        if (a.productBrand?.brandLink && b.productBrand?.brandLink) {
          const linkA = a.productBrand?.brandLink;
          const linkB = b.productBrand?.brandLink;
          if (linkA && linkB) return linkA.localeCompare(linkB);
          else if (linkA) return -1;
          else if (linkB) return 1;
          else return 0;
        } else if (a.productBrand?.brandLink) return -1;
        else if (b.productBrand?.brandLink) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, feedItem: FeedItem, index: number) => (
        <>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(feedItem.id, index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const editList = (index: number) => {
    setLastViewedIndex(index);
  };

  const DraggableBodyRow = ({
    index,
    moveRow,
    className,
    style,
    ...restProps
  }: DraggableBodyRowProps) => {
    const ref = useRef<HTMLTableRowElement>(null);
    const [{ isOver, dropClassName }, drop] = useDrop({
      accept: type,
      collect: monitor => {
        const { index: dragIndex } = (monitor.getItem() || {}) as any;
        if (dragIndex === index) {
          return {};
        }
        return {
          isOver: monitor.isOver(),
          dropClassName:
            dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
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

    return (
      <tr
        ref={ref}
        className={`${className}${isOver ? dropClassName : ''}`}
        style={{ cursor: 'move', ...style }}
        {...restProps}
      />
    );
  };

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragRow = featuredFeeds[dragIndex];
      setFeaturedFeeds(
        update(featuredFeeds, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      );
    },
    [featuredFeeds]
  );

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const handleDeploy = () => {
    const indexedFeeds = featuredFeeds.map(item => {
      return { ...item, index: featuredFeeds.indexOf(item) };
    });
    doRequest(() => updateFeaturedFeed(indexedFeeds));
  };

  return (
    <>
      <div className="video-feed mb-1">
        <PageHeader
          title="Featured Feeds"
          subTitle={isMobile ? '' : 'List of Featured Feeds'}
        />
        <Row
          justify="space-between"
          align="bottom"
          className="mb-05 sticky-filter-box"
        >
          <Col lg={4} xs={24}>
            <Typography.Title level={5}>List Name</Typography.Title>

            <Select
              style={{ width: '100%' }}
              onChange={value => fetch(value)}
              placeholder="List name"
              showSearch
              allowClear
              disabled={!feedList.length || loading}
              filterOption={filterOption}
            >
              {feedList.map((curr: any) => (
                <Select.Option
                  key={curr.value}
                  value={curr.value}
                  label={curr.name}
                >
                  {curr.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col lg={4} xs={24}>
            <Row justify="end">
              <Col>
                <Button
                  key="2"
                  type="primary"
                  disabled={featuredFeeds === listRef || !featuredFeeds?.length}
                  className={isMobile ? 'mt-15' : ''}
                  onClick={handleDeploy}
                >
                  Deploy
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <DndProvider backend={HTML5Backend}>
          <Table
            scroll={{ x: true }}
            className="mt-1"
            rowClassName={(_, index) =>
              `${index === lastViewedIndex ? 'selected-row' : ''}`
            }
            components={components}
            onRow={(_, index) => {
              const attr = {
                index,
                moveRow,
              };
              return attr as React.HTMLAttributes<any>;
            }}
            size="small"
            columns={columns}
            rowKey="id"
            dataSource={featuredFeeds}
            loading={loading}
          />
        </DndProvider>
      </div>
    </>
  );
};

export default withRouter(FeaturedFeed);
