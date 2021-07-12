import { CalendarOutlined, EditOutlined } from "@ant-design/icons";
import { Button, DatePicker, PageHeader, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import useFilter from "hooks/useFilter";
import { Fan } from "interfaces/Fan";
import { Promotion } from "interfaces/Promotion";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchPromotions } from "services/DiscoClubService";

const Promotions: React.FC<RouteComponentProps> = ({ history }) => {
  const [tableloading, setTableLoading] = useState<boolean>(false);
  const [promotionUpdateList, setPromotionUpdateList] = useState<boolean[]>([]);

  const {
    arrayList: promotions,
    setArrayList: setPromotions,
    filteredArrayList: filteredPromotions,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Promotion>([]);

  const {
    settings: { promotion: promotionsSettings = [] },
  } = useSelector((state: any) => state.settings);

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

  const columns: ColumnsType<Promotion> = [
    {
      title: "Promo ID",
      dataIndex: "id",
      width: "10%",
      align: "left",
    },
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      width: "10%",
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
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, record) => (
        <Link to={{ pathname: `/promotion`, state: record }}>
          <EditOutlined />
        </Link>
      ),
    },
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
      <PageHeader
        title="Promotions"
        subTitle="List of Promotions"
        extra={[
          <Button key="1" onClick={() => history.push("/promotion")}>
            New Item
          </Button>,
        ]}
      />
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
