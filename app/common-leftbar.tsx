"use client";

import { useEffect, useRef } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty, List, Space, Tabs, Typography } from "antd";

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
  headerTabs?: Array<{ key: string; label: string }>;
  activeHeaderTabKey?: string;
  onHeaderTabChange?: (key: string) => void;
};

export function CommonLeftbar({
  title,
  items,
  activeKey,
  onSelect,
  emptyText,
  onCreate,
  scrollStorageKey,
  headerTabs,
  activeHeaderTabKey,
  onHeaderTabChange,
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

  function handleSelect(key: number) {
    if (scrollStorageKey && scrollContainerRef.current) {
      window.sessionStorage.setItem(scrollStorageKey, String(scrollContainerRef.current.scrollTop));
    }
    onSelect(key);
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
      <div className="mb-2 flex shrink-0 items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <Typography.Title level={5} className="!mb-0 whitespace-nowrap">
            {title}
          </Typography.Title>

          {headerTabs && headerTabs.length > 0 ? (
            <Tabs
              size="small"
              className="!mb-0"
              items={headerTabs}
              activeKey={activeHeaderTabKey}
              onChange={onHeaderTabChange}
              tabBarStyle={{ margin: 0 }}
              tabBarGutter={8}
            />
          ) : null}
        </div>

        {onCreate ? (
          <Space size={0} align="center">
            <Button
              type="default"
              shape="circle"
              size="small"
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
                onClick={() => handleSelect(item.key)}
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
