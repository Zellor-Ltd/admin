import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  message,
  PageHeader,
  Row,
  Switch,
  Table,
  Tabs,
  Tag as AntTag,
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
import { Segment } from 'interfaces/Segment';
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

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};
const FeedMixer: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });

  const {
    arrayList: userFeed,
    setArrayList: setUserFeed,
    filteredArrayList: filteredUserFeed,
    addFilterFunction: addUserFeedFilter,
    removeFilterFunction: removeUserFeedFilter,
  } = useFilter<any>([]);

  const {
    arrayList: templateFeed,
    setArrayList: setTemplateFeed,
    filteredArrayList: filteredTemplateFeed,
    addFilterFunction: addTemplateFeedFilter,
    removeFilterFunction: removeTemplateFeedFilter,
  } = useFilter<any>([]);

  const [selectedFan, setSelectedFan] = useState<FanFilter>();
  const [selectedTab, setSelectedTab] = useState<string>('');
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

  const addVideo = (record: FeedItem, index: number) => {
    setUserFeed(prev => [record, ...prev]);
    message.success('Video added into user feed.');
    setTemplateFeed(prev => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const addVideos = (records: string[]) => {
    setUserFeed(prev => {
      return [
        ...prev,
        ...templateFeed.filter(item => records.includes(item.id)),
      ];
    });
    setTemplateFeed(templateFeed.filter(item => !records.includes(item.id)));
    message.success('Videos added into user feed.');
  };

  const removeVideo = (record: FeedItem, index: number) => {
    setUserFeed(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    setTemplateFeed(prev => [record, ...prev]);
  };

  const addObj = { icon: <PlusOutlined />, fn: addVideo };
  const removeObj = { icon: <MinusOutlined />, fn: removeVideo };

  const [actionObj, setActionObj] =
    useState<{ icon: any; fn: (record: FeedItem, index: number) => void }>(
      removeObj
    );

  const rowSelection = {
    onChange: onSelectChange,
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setActionObj(tab === 'User Feed' ? removeObj : addObj);
  };

  const columns: ColumnsType<FeedItem> = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: '30%',
      align: 'center',
    },
    {
      title: 'Segments',
      dataIndex: 'package',
      render: (pack: Array<any> = []) => <AntTag>{pack.length}</AntTag>,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Length',
      dataIndex: 'lengthTotal',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Expiration Date',
      dataIndex: 'validity',
      width: '15%',
      render: (creationDate: Date) =>
        new Date(creationDate).toLocaleDateString(),
      align: 'center',
    },
    {
      title: 'Tags',
      dataIndex: 'package',
      width: '15%',
      render: (pack: Array<any> = []) => (
        <AntTag>{reduceSegmentsTags(pack)}</AntTag>
      ),
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record, index) => (
        <Button
          onClick={() => actionObj.fn(record, index)}
          type="link"
          style={{ padding: 0, margin: '0 6px' }}
        >
          {actionObj.icon}
        </Button>
      ),
    },
  ];

  const onChangeFan = async (_selectedFan: FanFilter) => {
    const fetchFeed = async (_selectedFan: FanFilter) => {
      const response = await doFetch(() =>
        _selectedFan.isGroup
          ? fetchGroupFeed(_selectedFan.id)
          : fetchUserFeed(_selectedFan.id)
      );
      return response;
    };

    setSelectedFan(_selectedFan);
    if (!templateFeed.length) {
      const [{ results: _userFeed }, { results: _templateFeed }] =
        await Promise.all([
          fetchFeed(_selectedFan),
          doFetch(() => fetchVideoFeed()),
        ]);
      setUserFeed(_userFeed);
      setTemplateFeed(_templateFeed);
    } else {
      const { results } = await fetchFeed(_selectedFan);
      setUserFeed(results);
    }
    setLockedFeed(_selectedFan.specialLock === 'y');
  };

  const saveChanges = async () => {
    const action = () =>
      selectedFan!.isFilter
        ? selectedFan!.id === 'allfans'
          ? updateMultipleUsersFeed(userFeed)
          : updateUsersFeedByGroup(selectedFan!.user, userFeed)
        : saveUserFeed(selectedFan!.id, userFeed);
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
        <Col>
          {selectedTab === 'Template Feed' && (
            <Row align="top">
              <Button
                onClick={() => addVideos(selectedRowKeys)}
                disabled={!hasSelected}
                loading={loading}
                style={{
                  marginTop: '32px',
                }}
              >
                {`Send selected videos to ${selectedFan?.user} Feed`}
              </Button>
            </Row>
          )}
        </Col>
      </Row>
      {selectedFan && (
        <Tabs defaultActiveKey="User Feed" onChange={handleTabChange}>
          <Tabs.TabPane forceRender tab={displayFeedName} key="User Feed">
            <FiltersRow
              filterFeedFn={addUserFeedFilter}
              removeFilterFeedFn={removeUserFeedFilter}
            />
            <SortableTable
              rowKey="id"
              columns={columns}
              dataSource={filteredUserFeed}
              setDataSource={setUserFeed}
              loading={loading}
              pagination={false}
            />
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Template Feed" key="Template Feed">
            <FiltersRow
              filterFeedFn={addTemplateFeedFilter}
              removeFilterFeedFn={removeTemplateFeedFilter}
            />

            <Table
              rowSelection={rowSelection}
              rowKey="id"
              columns={columns}
              dataSource={filteredTemplateFeed}
              loading={loading}
              pagination={false}
            />
          </Tabs.TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default FeedMixer;
