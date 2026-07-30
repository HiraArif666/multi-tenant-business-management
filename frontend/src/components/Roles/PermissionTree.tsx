import { Checkbox, Collapse, Row, Col, Spin } from "antd";
import { usePermissions } from "../../hooks/usePermissions";

interface Props {
  value: number[];
  onChange: (ids: number[]) => void;
}

export default function PermissionTree({
  value,
  onChange,
}: Props) {
  const { data, isLoading } = usePermissions();

  if (isLoading) return <Spin />;

  const permissions = data?.data || [];

  const grouped = permissions.reduce(
    (acc: any, permission: any) => {
      const module = permission.module;
      const subModule =
        permission.subModule || "_";

      if (!acc[module]) {
        acc[module] = {};
      }

      if (!acc[module][subModule]) {
        acc[module][subModule] = [];
      }

      acc[module][subModule].push(permission);

      return acc;
    },
    {}
  );

  const excludedModules = new Set([
    "companies",
    "company types",
    "profile",
    "profiles",
  ]);

  const visibleGroups = Object.entries(grouped).filter(
    ([module]) => {
      const normalized =
        module?.toString().toLowerCase().trim();
      return !excludedModules.has(normalized);
    }
  );

  const defaultActiveKeys = visibleGroups.map(
    ([module]) => module
  );

  const toggleGroup = (
    ids: number[],
    checked: boolean
  ) => {
    if (checked) {
      const merged = [
        ...new Set([...value, ...ids]),
      ];

      onChange(merged);
    } else {
      onChange(
        value.filter(
          (id) => !ids.includes(id)
        )
      );
    }
  };

  return (
    <Collapse
      ghost
      defaultActiveKey={defaultActiveKeys}
      items={visibleGroups.map(
        ([module, subModules]: any) => ({
          key: module,

          label: <strong>{module}</strong>,

          children: Object.entries(
            subModules
          ).map(
            ([subModule, permissions]: any) => {
              const ids =
                permissions.map(
                  (x: any) => x.id
                );

              const checked =
                ids.every((id: number) =>
                  value.includes(id)
                );

              const indeterminate =
                !checked &&
                ids.some((id: number) =>
                  value.includes(id)
                );

              return (
                <div
                  key={subModule}
                  style={{
                    marginBottom: 25,
                  }}
                >
                  <Checkbox
                    checked={checked}
                    indeterminate={
                      indeterminate
                    }
                    onChange={(e) =>
                      toggleGroup(
                        ids,
                        e.target.checked
                      )
                    }
                    style={{
                      fontWeight: 600,
                      marginBottom: 15,
                    }}
                  >
                    {subModule === "_"
                      ? module
                      : subModule}
                  </Checkbox>

                  <Row gutter={[16, 16]}>
                    {permissions.map(
                      (permission: any) => (
                        <Col
                          span={6}
                          key={permission.id}
                        >
                          <Checkbox
                            checked={value.includes(
                              permission.id
                            )}
                            onChange={(e) => {
                              if (
                                e.target.checked
                              ) {
                                onChange([
                                  ...value,
                                  permission.id,
                                ]);
                              } else {
                                onChange(
                                  value.filter(
                                    (id) =>
                                      id !==
                                      permission.id
                                  )
                                );
                              }
                            }}
                          >
                            {
                              permission.action
                            }
                          </Checkbox>
                        </Col>
                      )
                    )}
                  </Row>
                </div>
              );
            }
          ),
        })
      )}
    />
  );
}