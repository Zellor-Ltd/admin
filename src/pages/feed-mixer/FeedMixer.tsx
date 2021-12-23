import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Image,
  message,
  PageHeader,
  Row,
  Switch,
  Table,
  Typography,
} from 'antd';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox';
import { SwitchChangeEventHandler } from 'antd/lib/switch';
import { ColumnsType } from 'antd/lib/table';
import { SortableTable } from 'components';
import { SearchFilter } from 'components/SearchFilter';
import { SelectCategory } from 'components/SelectCategory';
import { SelectStatus } from 'components/SelectStatus';
import { SelectVideoType } from 'components/SelectVideoType';
import { SelectFanQuery } from 'components/SelectFanQuery';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { FanFilter } from 'interfaces/Fan';
import { FeedItem } from 'interfaces/FeedItem';
import React, { useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  fetchGroupFeed,
  fetchUserFeed,
  fetchVideoFeed,
  lockFeedMixer,
  saveUserFeed,
  setPreserveDdTags,
  unlockFeedMixer,
  unsetPreserveDdTags,
  updateMultipleUsersFeed,
  updateUsersFeedByGroup,
} from 'services/DiscoClubService';
import { Category } from 'interfaces/Category';
import { ColumnType } from 'antd/lib/table/interface';

const FeedMixer: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });

  const {
    arrayList: publishedFeed,
    setArrayList: setPublishedFeed,
    filteredArrayList: filteredPublishedFeed,
    addFilterFunction: addPublishedFeedFilter,
    removeFilterFunction: removePublishedFeedFilter,
  } = useFilter<FeedItem>([]);

  const {
    arrayList: unpublishedFeed,
    setArrayList: setUnpublishedFeed,
    filteredArrayList: filteredUnpublishedFeed,
    addFilterFunction: addUnpublishedFeedFilter,
    removeFilterFunction: removeUnpublishedFeedFilter,
  } = useFilter<FeedItem>([]);

  const [selectedFan, setSelectedFan] = useState<FanFilter>();
  const [lockedFeed, setLockedFeed] = useState<boolean>(false);
  const [displayFeedName, setDisplayFeedName] = useState<string>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const hasSelected = selectedRowKeys.length > 0;

  useEffect(() => {
    setDisplayFeedName(
      selectedFan?.isFilter ? `${selectedFan.user} Feed` : 'User Feed'
    );
  }, [selectedFan]);

  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const addVideo = (feedItem: FeedItem, index: number) => {
    setPublishedFeed(prev => [feedItem, ...prev]);
    setUnpublishedFeed(prev => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
    message.success('Video added to Published Feeds.');
  };

  const addVideos = (feedItemIds: string[]) => {
    setPublishedFeed(prev => {
      return [
        ...prev,
        ...unpublishedFeed.filter(item => feedItemIds.includes(item.id)),
      ];
    });
    setUnpublishedFeed(
      unpublishedFeed.filter(item => !feedItemIds.includes(item.id))
    );
    message.success('Videos added to Published Feeds.');
  };

  const removeVideo = (feedItem: FeedItem, index: number) => {
    setPublishedFeed(prev => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
    setUnpublishedFeed(prev => [feedItem, ...prev]);
  };

  const addObj = { icon: <PlusOutlined />, fn: addVideo };
  const removeObj = { icon: <MinusOutlined />, fn: removeVideo };

  const rowSelection = {
    onChange: onSelectChange,
    columnWidth: '10%',
  };

  const titleColumns: ColumnType<FeedItem> = {
    title: 'Feed',
    dataIndex: 'title',
    width: '70%',
    align: 'center',
    render: (title, feedItem) => (
      <>
        <Row justify="space-between" align="middle">
          <Col span={6}>
            <Image
              width="5rem"
              src={feedItem.package[0].thumbnail?.url}
              fallback="data:image/png;base64,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"
            ></Image>
          </Col>
          <Col span={18}>{title}</Col>
        </Row>
      </>
    ),
  };

  const actionRender = (
    feedItem: FeedItem,
    index: number,
    actionObj: { icon: any; fn: (feedItem: FeedItem, index: number) => void }
  ) => (
    <Button
      onClick={() => actionObj.fn(feedItem, index)}
      type="link"
      style={{ padding: 0, margin: '0 6px' }}
    >
      {actionObj.icon}
    </Button>
  );

  const publishedFeedColumns: ColumnsType<FeedItem> = [
    titleColumns,
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, feedItem, index) => actionRender(feedItem, index, removeObj),
    },
  ];

  const unpublishedFeedColumns: ColumnsType<FeedItem> = [
    titleColumns,
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, feedItem, index) => actionRender(feedItem, index, addObj),
    },
  ];

  const onChangeFan = async (_selectedFan: FanFilter) => {
    setLoading(true);
    const fetchFeed = async (_selectedFan: FanFilter) => {
      const response = await doFetch(() =>
        _selectedFan.isGroup
          ? fetchGroupFeed(_selectedFan.id)
          : fetchUserFeed(_selectedFan.id)
      );
      return response;
    };

    setSelectedFan(_selectedFan);
    if (!unpublishedFeed.length) {
      const [{ results: _publishedFeed }, { results: _unpublishedFeed }] =
        await Promise.all([
          fetchFeed(_selectedFan),
          doFetch(() => fetchVideoFeed()),
        ]);
      setPublishedFeed(_publishedFeed);
      setUnpublishedFeed(
        _unpublishedFeed.filter(
          unpubFeed =>
            !_publishedFeed.some(pubFeed => unpubFeed.id === pubFeed.id)
        )
      );
    } else {
      const { results } = await fetchFeed(_selectedFan);
      setPublishedFeed(results);
    }
    setLockedFeed(_selectedFan.specialLock === 'y');
    setLoading(false);
  };

  const saveChanges = async () => {
    const action = () =>
      selectedFan!.isFilter
        ? selectedFan!.id === 'allfans'
          ? updateMultipleUsersFeed(publishedFeed)
          : updateUsersFeedByGroup(selectedFan!.user, publishedFeed)
        : saveUserFeed(selectedFan!.id, publishedFeed);
    await doRequest(action, `${displayFeedName} updated.`);
  };

  const handleLockChange: SwitchChangeEventHandler = async checked => {
    await doRequest(() =>
      checked
        ? lockFeedMixer(selectedFan!.id)
        : unlockFeedMixer(selectedFan!.id)
    );
    setLockedFeed(checked);
  };

  const handleCheckboxChange = async (e: CheckboxChangeEvent) => {
    const fnToCall = e.target.checked ? setPreserveDdTags : unsetPreserveDdTags;
    await doRequest(() => fnToCall(selectedFan!.id));
  };

  const titleFilterFunction = (filterText: string, filterFeedFn: Function) => {
    filterFeedFn('name', (feed: any[]) =>
      feed.filter(feedVideo =>
        feedVideo.title.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  const onChangeStatus = async (
    _selectedStatus: string | undefined,
    filterFeedFn: Function,
    removeFilterFeedFn: Function
  ) => {
    if (!_selectedStatus) {
      removeFilterFeedFn('status');
      return;
    }
    filterFeedFn('status', (feed: any[]) =>
      feed.filter(
        feedVideo =>
          feedVideo.status.toUpperCase() === _selectedStatus.toUpperCase()
      )
    );
  };

  const onChangeCategory = async (
    _selectedCategory: Category | undefined,
    filterFeedFn: Function,
    removeFilterFeedFn: Function
  ) => {
    if (!_selectedCategory) {
      removeFilterFeedFn('category');
      return;
    }
    filterFeedFn('category', (feed: any[]) =>
      feed.filter(feedVideo => {
        return feedVideo.category === _selectedCategory.name;
      })
    );
  };

  const onChangeVideoType = async (
    _selectedVideoType: string | undefined,
    filterFeedFn: Function,
    removeFilterFeedFn: Function
  ) => {
    if (!_selectedVideoType) {
      removeFilterFeedFn('videoType');
      return;
    }
    filterFeedFn('videoType', (feed: any[]) =>
      feed.filter(
        feedVideo =>
          typeof feedVideo.videoType === 'object' &&
          feedVideo.videoType.includes(_selectedVideoType)
      )
    );
  };

  const FiltersRow = useMemo(
    () =>
      ({
        filterFeedFn,
        removeFilterFeedFn,
      }: {
        filterFeedFn: Function;
        removeFilterFeedFn: Function;
      }) =>
        (
          <Row gutter={8}>
            <Col lg={6} xs={16}>
              <SearchFilter
                filterFunction={text => titleFilterFunction(text, filterFeedFn)}
                label="Title"
              />
            </Col>
            <Col lg={6} xs={16}>
              <SelectStatus
                label="Status"
                style={{ width: '100%' }}
                onChange={_selectedStatus =>
                  onChangeStatus(
                    _selectedStatus,
                    filterFeedFn,
                    removeFilterFeedFn
                  )
                }
              />
            </Col>
            <Col lg={6} xs={16}>
              <SelectCategory
                label="Category"
                style={{ width: '100%' }}
                onChange={_selectedCategory =>
                  onChangeCategory(
                    _selectedCategory,
                    filterFeedFn,
                    removeFilterFeedFn
                  )
                }
              />
            </Col>
            <Col lg={6} xs={16}>
              <SelectVideoType
                label="Video Type"
                style={{ width: '100%' }}
                onChange={_selectedVideoType =>
                  onChangeVideoType(
                    _selectedVideoType,
                    filterFeedFn,
                    removeFilterFeedFn
                  )
                }
              />
            </Col>
          </Row>
        ),
    []
  );

  return (
    <div className="feed-mixer">
      <PageHeader title="Feed Mixer" subTitle="Define feed for users." />
      <Row gutter={8} style={{ marginBottom: '20px', width: '100%' }}>
        <Col>
          <SelectFanQuery
            style={{ width: '250px' }}
            onChange={onChangeFan}
          ></SelectFanQuery>
        </Col>
        {selectedFan && !selectedFan.isFilter && (
          <>
            <Col>
              <Form.Item
                label="Lock Feed"
                style={{ margin: '32px 12px 16px 16px' }}
              >
                <Switch
                  loading={loading}
                  onChange={handleLockChange}
                  checked={lockedFeed}
                ></Switch>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                name="preserveDdTags"
                label="Preserve DD Tags"
                style={{ margin: '32px 16px 16px 16px' }}
              >
                <Checkbox
                  onChange={handleCheckboxChange}
                  disabled={loading}
                ></Checkbox>
              </Form.Item>
            </Col>
          </>
        )}
        {selectedFan && (
          <Col>
            <Button
              onClick={saveChanges}
              style={{
                marginTop: '32px',
                color: 'white',
                borderColor: 'white',
                backgroundColor: selectedFan.isFilter
                  ? 'rgb(255, 77, 79)'
                  : '#4CAF50',
              }}
            >
              {selectedFan.isFilter
                ? `Deploy Feed to ${selectedFan.user}`
                : 'Deploy Feed'}
            </Button>
          </Col>
        )}
      </Row>
      {selectedFan && (
        <Row justify="space-around">
          <Col lg={11} xs={24}>
            <Row justify="space-between">
              <Col lg={10} xs={24}>
                <Typography.Title level={2} title="Unpublished Feeds">
                  Unpublished Feeds
                </Typography.Title>
              </Col>
              <Col lg={10} xs={24}>
                <Button
                  onClick={() => addVideos(selectedRowKeys)}
                  disabled={!hasSelected}
                  loading={loading}
                >
                  {`Send selected videos to ${selectedFan?.user} Feed`}
                </Button>
              </Col>
            </Row>
            <Typography.Title level={4} title="Quick Filter">
              Quick Filter
            </Typography.Title>
            <FiltersRow
              filterFeedFn={addUnpublishedFeedFilter}
              removeFilterFeedFn={removeUnpublishedFeedFilter}
            />
            <Table
              rowSelection={rowSelection}
              rowKey="id"
              columns={unpublishedFeedColumns}
              dataSource={filteredUnpublishedFeed}
              loading={loading}
              pagination={false}
            />
          </Col>
          <Col lg={11} xs={24}>
            <Typography.Title level={2} title="Published Feeds">
              Published Feeds
            </Typography.Title>
            <Typography.Title level={4} title="Quick Filter">
              Quick Filter
            </Typography.Title>
            <FiltersRow
              filterFeedFn={addPublishedFeedFilter}
              removeFilterFeedFn={removePublishedFeedFilter}
            />
            <SortableTable
              rowKey="id"
              columns={publishedFeedColumns}
              dataSource={filteredPublishedFeed}
              setDataSource={setPublishedFeed}
              loading={loading}
              pagination={false}
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FeedMixer;
