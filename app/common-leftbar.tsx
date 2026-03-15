"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty, List, Space, Typography } from "antd";

type LeftbarItem = {
  key: number;
  title: string;
  subtitle?: string;
};

type CommonLeftbarProps = {
  title: string;
  items: LeftbarItem[];
  activeKey?: number;
  onSelect: (key: number) => void;
  emptyText: string;
  onCreate?: () => void;
  disableCreate?: boolean;
};

export function CommonLeftbar({
  title,
  items,
  activeKey,
  onSelect,
  emptyText,
  onCreate,
  disableCreate,
}: CommonLeftbarProps) {
  return (
    <Card className="h-full shadow-sm" bodyStyle={{ padding: 12 }}>
      <div className="mb-3 flex items-center justify-between">
        <Typography.Title level={5} className="!mb-0">
          {title}
        </Typography.Title>

        {onCreate ? (
          <Space size="small" align="center">
            <Button
              type="text"
              shape="circle"
              icon={<PlusOutlined />}
              disabled={disableCreate}
              onClick={onCreate}
            />
          </Space>
        ) : null}
      </div>

      {items.length === 0 ? (
        <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              className="cursor-pointer rounded px-2 transition-colors"
              style={{
                background: item.key === activeKey ? "#e6f4ff" : "transparent",
              }}
              onClick={() => onSelect(item.key)}
            >
              <List.Item.Meta
                title={<Typography.Text strong={item.key === activeKey}>{item.title}</Typography.Text>}
                description={item.subtitle}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
