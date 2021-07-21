import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, PageHeader, Popconfirm, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { DdTemplate } from "interfaces/DdTemplate";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { deleteDdTemplate, fetchDdTemplates } from "services/DiscoClubService";

const DdTemplates: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });

  const {
    setArrayList: setDdTemplates,
    filteredArrayList: filteredDdTemplates,
  } = useFilter<DdTemplate>([]);

  const getResources = async () => {
    await getDdTemplates();
  };

  const getDdTemplates = async () => {
    const ddTemplates = await doFetch(fetchDdTemplates);
    setDdTemplates(ddTemplates);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteDdTemplate({ id }));
    await getDdTemplates();
  };

  const columns: ColumnsType<DdTemplate> = [
    {
      title: "Code",
      dataIndex: "code",
      width: "30%",
      render: (value: string, record: DdTemplate) => (
        <Link to={{ pathname: `promo-code`, state: record }}>{value}</Link>
      ),
    },
    {
      title: "Dollars",
      dataIndex: "dollars",
      width: "10%",
      align: "center",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      width: "10%",
      align: "center",
    },
    {
      title: "Creation",
      dataIndex: "hCreationDate",
      width: "15%",
      align: "center",
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
      width: "10%",
      align: "right",
      render: (_, record: DdTemplate) => (
        <>
          <Link to={{ pathname: `promo-code`, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Disco Dollars Templates"
        subTitle="List of Disco Dollars Templates"
        extra={[
          <Button key="1" onClick={() => history.push("dd-template")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredDdTemplates}
        loading={loading}
      />
    </div>
  );
};

export default DdTemplates;
