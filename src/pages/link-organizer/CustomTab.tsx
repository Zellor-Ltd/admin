import { EditOutlined } from "@ant-design/icons";
import { Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import { useRequest } from "hooks/useRequest";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { fetchLinkBrand, updateLinkBrand } from "services/DiscoClubService";
import LinkOrganizerDetail from "./LinkOrganizerDetail";


const CustomTab: React.FC<any> = () => {
    const [loading, setLoading] = useState(false);
    const { doFetch } = useRequest({ setLoading });
    const [listData, setListData] = useState<any[]>([]);
    const [details, setDetails] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<any>();
    const history = useHistory();

    useEffect(() => {
        history.listen((_, action) => {
            if (action === 'POP' && details) setDetails(false);
        });
    });

    useEffect(() => {
        fetch()
    }, []);

    const fetch = async () => {
        const response = await doFetch(() =>
            fetchLinkBrand({})
        );
        setListData(response.results)
    };

    const onEditRecord = (_: number, record?: any) => {
        setCurrentRecord(record);
        setDetails(true);
        history.push(window.location.pathname);
    };

    const onSaveRecord = async (record: any, setLoadingLocal: any) => {
        try {
            setLoadingLocal(true)
            await updateLinkBrand(record)
            setDetails(false);
        } finally {
            setLoadingLocal(true)
        }
    };

    const onCancelRecord = () => {
        setDetails(false);
    };

    const columns: ColumnsType<any> = [
        {
            title: (
                <div style={{ display: 'grid', placeItems: 'stretch' }}>
                    <div
                        style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Tooltip title="Name">Name</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'name',
            width: '30%',
            /* render: (productBrand: any) => (
                productBrand?.brandName
            ), */
            align: 'center',
        },
        {
            title: (
                <div style={{ display: 'grid', placeItems: 'stretch' }}>
                    <div
                        style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Tooltip title="Edit">Edit</Tooltip>
                    </div>
                </div>
            ),
            key: 'action',
            width: '5%',
            align: 'right',
            render: (_, record, index: number) => (
                <>
                    <Link
                        to={{ pathname: window.location.pathname, state: record }}
                        onClick={() => onEditRecord(index, record)}>
                        <EditOutlined />
                    </Link>
                </>
            ),
        },
    ];

    return (
        <>
            {!details && (
                <Table
                    rowClassName={(_, index) => `scrollable-row-${index}`}
                    rowKey="id"
                    columns={columns}
                    dataSource={listData}
                    loading={loading}
                    pagination={false}
                    scroll={{ y: 240, x: true }}
                    size="small"
                />
            )}

            {details && (
                <LinkOrganizerDetail
                    record={currentRecord}
                    onSave={onSaveRecord}
                    onCancel={onCancelRecord} />
            )}
        </>
    );
};

export default CustomTab;
