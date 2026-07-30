import { Flex, Pagination } from "antd";

interface ListingPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

export default function ListingPagination({
  current,
  pageSize,
  total,
  onChange,
}: ListingPaginationProps) {
  return (
    <Flex
      justify="end"
      style={{
        marginTop: 20,
      }}
    >
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} of ${total} records`
        }
        onChange={onChange}
      />
    </Flex>
  );
}