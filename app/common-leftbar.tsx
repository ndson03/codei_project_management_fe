"use client";

import { useEffect, useRef } from "react";
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
  scrollStorageKey?: string;
};

export function CommonLeftbar({
  title,
  items,
  activeKey,
  onSelect,
  emptyText,
  onCreate,
  scrollStorageKey,
}: CommonLeftbarProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const restoredKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!scrollStorageKey || restoredKeyRef.current === scrollStorageKey) {
      return;
    }

    const saved = window.sessionStorage.getItem(scrollStorageKey);
    if (saved && scrollContainerRef.current) {
      const scrollTop = Number(saved);
      scrollContainerRef.current.scrollTop = Number.isFinite(scrollTop) ? scrollTop : 0;
    }
    restoredKeyRef.current = scrollStorageKey;
  }, [scrollStorageKey]);

  function handleScroll() {
    if (!scrollStorageKey || !scrollContainerRef.current) {
      return;
    }
    window.sessionStorage.setItem(scrollStorageKey, String(scrollContainerRef.current.scrollTop));
  }

  return (
    <Card
      className="leftbar-card h-full shadow-sm"
      bodyStyle={{
        padding: 12,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <Typography.Title level={5} className="!mb-0">
          {title}
        </Typography.Title>

        {onCreate ? (
          <Space size="small" align="center">
            <Button
              type="default"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={onCreate}
            />
          </Space>
        ) : null}
      </div>

      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto" onScroll={handleScroll}>
        {items.length === 0 ? (
          <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            size="small"
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                className={`leftbar-item cursor-pointer rounded px-2 transition-colors ${item.key === activeKey ? "active" : ""}`}
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
      </div>
    </Card>
  );
}
