import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Input,
  message,
  PageHeader,
  Select,
  Space,
  Table,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import useFilter from "hooks/useFilter";
import { Fan } from "interfaces/Fan";
import { Promotion } from "interfaces/Promotion";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchPromotions, savePromotion } from "services/DiscoClubService";

const Promotions: React.FC<RouteComponentProps> = () => {
  const [tableloading, setTableLoading] = useState<boolean>(false);
  const [promotionUpdateList, setPromotionUpdateList] = useState<boolean[]>([]);

  const {
    arrayList: promotions,
    setArrayList: setPromotions,
    filteredArrayList: filteredPromotions,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Promotion>([]);

  const [fans, setFans] = useState<Fan[]>([]);

  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");

  const searchInput = useRef<Input>(null);

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText("");
  };

  const {
    settings: { promotion: promotionsSettings = [] },
  } = useSelector((state: any) => state.settings);

  const handleSelectChange = async (value: string, promotionIndex: number) => {
    // const currentPromotionUpdateList = [...promotionUpdateList];
    // currentPromotionUpdateList[promotionIndex] = true;
    // setPromotionUpdateList(currentPromotionUpdateList);
    // await savePromotion({
    //   ...promotions[promotionIndex],
    //   stage: value,
    // });
    // const _promotions = [...promotions];
    // _promotions[promotionIndex].hLastUpdate = moment
    //   .utc()
    //   .format("YYYY-MM-DDTHH:mm:ss.SSSSSSSZ");
    // setPromotions(_promotions);
    // message.success("Changes saved!");
    // setPromotionUpdateList((prev) => {
    //   prev[promotionIndex] = false;
    //   return [...prev];
    // });
  };

  const handleDateChange = (values: any) => {
    if (!values) {
      removeFilterFunction("creationDate");
      return;
    }
    const startDate = moment(values[0], "DD/MM/YYYY").startOf("day").utc();
    const endDate = moment(values[1], "DD/MM/YYYY").endOf("day").utc();
    addFilterFunction("creationDate", (promotions: Promotion[]) =>
      promotions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
  };

  const getFan = (fanId: string) => fans.find((fan) => fan.id === fanId);

  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: any;
      selectedKeys: any;
      confirm: any;
      clearFilters: any;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.current!.select(), 100);
      }
    },
    render: (text: any) => (
      <Link to={{ pathname: `/fan`, state: getFan(text) }}>
        {searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        ) : (
          text
        )}
      </Link>
    ),
  });

  const columns: ColumnsType<Promotion> = [
    {
      title: "User",
      dataIndex: "fanName",
      width: "10%",
      align: "left",
      ...getColumnSearchProps("userId"),
    },
    {
      title: "Paid",
      dataIndex: "paid",
      width: "5%",
      align: "center",
      render: (value: boolean) => <b>{value ? "Yes" : "No"}</b>,
    },
    {
      title: "Amount / 100",
      dataIndex: "amount",
      width: "5%",
      align: "center",
      render: (value: number) => `${value / 100}x`,
    },
    {
      title: "Name",
      dataIndex: ["product", "name"],
      width: "12%",
      align: "center",
    },
    {
      title: "Creation",
      dataIndex: "hCreationDate",
      width: "10%",
      align: "center",
      filterIcon: <CalendarOutlined />,
      filterDropdown: () => (
        <DatePicker.RangePicker
          style={{ padding: 8 }}
          onChange={handleDateChange}
        />
      ),
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:mm")}</div>
        </>
      ),
    },
    {
      title: "Disco Dollars",
      dataIndex: "discoDollars",
      width: "5%",
      align: "center",
    },
    {
      title: "Stage",
      dataIndex: "stage",
      width: "15%",
      align: "center",
      render: (value: string, _, index) => (
        <Select
          loading={promotionUpdateList[index]}
          disabled={promotionUpdateList[index]}
          defaultValue={value}
          style={{ width: "175px" }}
          onChange={(value) => handleSelectChange(value, index)}
        >
          {promotionsSettings.map((promotionsSetting: any) => (
            <Select.Option
              key={promotionsSetting.value}
              value={promotionsSetting.value}
            >
              {promotionsSetting.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Last Update",
      dataIndex: "hLastUpdate",
      width: "10%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:mm")}</div>
          {/* <div style={{ color: "grey" }}>({moment(value).fromNow()})</div> */}
        </>
      ),
    },
    // {
    //   title: "Actions",
    //   key: "action",
    //   width: "5%",
    //   align: "right",
    //   render: (_, record) => (
    //     <Link to={{ pathname: `/promotion`, state: record }}>
    //       <EditOutlined />
    //     </Link>
    //   ),
    // },
  ];

  const getPromotions = useCallback(async () => {
    const response: any = await fetchPromotions();
    setPromotions(response.results);
  }, [setPromotions]);

  useEffect(() => {
    const getResources = async () => {
      setTableLoading(true);
      getPromotions();
      setTableLoading(false);
    };
    getResources();
  }, [getPromotions]);

  return (
    <div className="promotions">
      <PageHeader title="Promotions" subTitle="List of Promotions" />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredPromotions}
        loading={tableloading}
      />
    </div>
  );
};

export default Promotions;
