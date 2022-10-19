/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, PageHeader, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { FeedItem } from 'interfaces/FeedItem';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  fetchFeaturedFeeds,
  saveFeaturedFeeds,
} from 'services/DiscoClubService';
import '@pathofdev/react-tag-input/build/index.css';
import { useRequest } from 'hooks/useRequest';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { SearchOutlined } from '@ant-design/icons';

interface DraggableBodyRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const type = 'DraggableBodyRow';

const FeaturedFeed: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [list, setList] = useState<any[]>([]);
  const [listName, setListName] = useState<string>();
  const [listBuffer, setListBuffer] = useState<any[]>([]);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const { isMobile } = useContext(AppContext);

  const fetch = async (input?: string) => {
    try {
      if (input) setListName(input);
      const { results }: any = await doFetch(() => fetchFeaturedFeeds());
      setList(results);
    } catch (error) {}
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Index',
      dataIndex: 'index',
      width: '3%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.index && b.index) return a.index - b.index;
        else if (a.index) return -1;
        else if (b.index) return 1;
        else return 0;
      },
      render: (value: number) => `${value + 1}`,
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
        if (a.productBrand.name && b.productBrand.name)
          return a.productBrand.name.localeCompare(
            b.productBrand.name as string
          );
        else if (a.productBrand.name) return -1;
        else if (b.productBrand.name) return 1;
        else return 0;
      },
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
      const dragRow = listBuffer[dragIndex];
      setListBuffer(
        update(listBuffer, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      );
    },
    [listBuffer]
  );

  return (
    <>
      <div className="video-feed mb-1">
        <PageHeader
          title="Featured Feeds"
          subTitle={isMobile ? '' : 'List of Featured Feeds'}
          extra={
            <Row
              justify="end"
              align="middle"
              className={isMobile ? 'mt-2' : 'mr-06'}
            >
              <Col>
                <Button
                  key="2"
                  disabled={listBuffer === list}
                  className={isMobile ? 'mt-05' : ''}
                  onClick={() =>
                    doRequest(() => saveFeaturedFeeds({ listName, listBuffer }))
                  }
                >
                  Deploy
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={() => fetch()}
                  loading={loading}
                  className="ml-1"
                >
                  Search
                  <SearchOutlined style={{ color: 'white' }} />
                </Button>
              </Col>
            </Row>
          }
        />
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
            dataSource={listBuffer}
            loading={loading}
          />
        </DndProvider>
      </div>
    </>
  );
};

export default withRouter(FeaturedFeed);
