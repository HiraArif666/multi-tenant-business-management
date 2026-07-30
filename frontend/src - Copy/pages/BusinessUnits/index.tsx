import { useState } from "react";
import {
  Row,
  Col,
  Empty,
  Modal,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import ListingFilters from "../../components/common/ListingFilters";
import BusinessUnitCard from "../../components/business-units/BusinessUnitCard";

import {
  useBusinessUnits,
  useDeleteBusinessUnit,
  useSelectBusinessUnit,
} from "../../hooks/useBusinessUnits";

import { setSelectedBusinessUnit } from "../../utils/businessUnit";

export default function BusinessUnits() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    search: "",
    status: true,
  });

  const { data, isLoading } = useBusinessUnits(filters);

  const deleteMutation = useDeleteBusinessUnit();

  const selectMutation = useSelectBusinessUnit();

  // ==========================
  // Delete Business Unit
  // ==========================

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Business Unit",
      content:
        "Are you sure you want to delete this Business Unit?",
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);

          message.success(
            "Business Unit deleted successfully"
          );
        } catch (error: any) {
          message.error(
            error?.response?.data?.message ||
              "Something went wrong"
          );
        }
      },
    });
  };

  // ==========================
  // Select Business Unit
  // ==========================

  const handleSelect = async (
    businessUnit: any
  ) => {
    try {
      // Call backend
      await selectMutation.mutateAsync(
        businessUnit.id
      );

      // Save in localStorage
      setSelectedBusinessUnit(
        businessUnit
      );

      message.success(
        `${businessUnit.name} selected`
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          "Failed to select Business Unit"
      );
    }
  };

  return (
    <>
      <PageHeader
        title={`Business Units (${data?.total || 0})`}
        onAdd={() =>
          navigate("/business-units/new")
        }
      />

      <ListingFilters
        onSearch={(values: any) =>
          setFilters({
            ...filters,
            search: values.search || "",
            status: values.status,
          })
        }
        onClear={() =>
          setFilters({
            page: 1,
            limit: 100,
            search: "",
            status: true,
          })
        }
      />

      {!isLoading &&
      data?.data?.length ? (
        <Row gutter={[24, 24]}>
          {data.data.map(
            (businessUnit: any) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={businessUnit.id}
              >
                <BusinessUnitCard
                  item={businessUnit}
                  onSelect={
                    handleSelect
                  }
                  onEdit={(id) =>
                    navigate(
                      `/business-units/edit/${id}`
                    )
                  }
                  onDelete={
                    handleDelete
                  }
                />
              </Col>
            )
          )}
        </Row>
      ) : (
        !isLoading && (
          <Empty
            description="No Business Units Found"
          />
        )
      )}
    </>
  );
}