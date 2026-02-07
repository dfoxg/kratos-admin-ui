import {
  Title1,
  Toolbar,
  ToolbarButton,
  DataGrid,
  DataGridHeader,
  DataGridBody,
  DataGridRow,
  DataGridHeaderCell,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
  TableRowId,
  Input,
} from "@fluentui/react-components";
import { Identity, IdentityApi } from "@ory/kratos-client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { getKratosConfig } from "../../config";
import {
  ArrowClockwiseRegular,
  ClipboardEditRegular,
  ContentViewRegular,
  DeleteRegular,
  MailRegular,
  NewRegular,
} from "@fluentui/react-icons";
import { MessageService } from "../../components/messages/messagebar";

export interface ToolbarItem {
  text: string;
  key: string;
  onClick: () => void;
  icon: any;
}

interface IdentityTableItem {
  id: string;
  state: string;
  schema: string;
  verifiable_addresses: string;
}

const columns: TableColumnDefinition<IdentityTableItem>[] = [
  createTableColumn<IdentityTableItem>({
    columnId: "verifiable_addresses",
    renderHeaderCell: () => {
      return "Verifiable Address";
    },
    renderCell: (item) => {
      return <span>{item.verifiable_addresses}</span>;
    },
    compare: (a, b) =>
      a.verifiable_addresses.localeCompare(b.verifiable_addresses),
  }),
  createTableColumn<IdentityTableItem>({
    columnId: "state",
    renderHeaderCell: () => {
      return "State";
    },
    renderCell: (item) => {
      return (
        <span style={{ color: item.state === "active" ? "green" : "red" }}>
          {item.state}
        </span>
      );
    },
    compare: (a, b) => a.state.localeCompare(b.state),
  }),
  createTableColumn<IdentityTableItem>({
    columnId: "schema",
    renderHeaderCell: () => {
      return "Schema";
    },
    renderCell: (item) => {
      return <span>{item.schema}</span>;
    },
    compare: (a, b) => a.schema.localeCompare(b.schema),
  }),
  createTableColumn<IdentityTableItem>({
    columnId: "id",
    renderHeaderCell: () => {
      return "ID";
    },
    renderCell: (item) => {
      return <span>{item.id}</span>;
    },
    compare: (a, b) => a.id.localeCompare(b.id),
  }),
];

const IdentitiesSite: React.FC = () => {
  const navigate = useNavigate();
  const [commandBarItems, setCommandBarItems] = React.useState<ToolbarItem[]>(
    () => getCommandbarItems(0),
  );
  const [tableItems, setTableItems] = React.useState<IdentityTableItem[]>([]);
  const [displayedItems, setDisplayedItems] = React.useState<
    IdentityTableItem[]
  >([]);
  const [selectedRows, setSelectedRows] = React.useState<TableRowId[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const apiRef = React.useRef<IdentityApi | undefined>(undefined);

  React.useEffect(() => {
    getKratosConfig().then((config) => {
      apiRef.current = new IdentityApi(config.adminConfig);
      refreshData(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getCommandbarItems(localCount: number): ToolbarItem[] {
    const array: ToolbarItem[] = [];

    array.push({
      key: "new",
      text: "Create New",
      icon: NewRegular,
      onClick: () => {
        navigate("/identities/create");
      },
    });

    if (localCount === 1) {
      array.push({
        key: "view",
        text: "View",
        icon: ContentViewRegular,
        onClick: () => {
          navigate("/identities/" + selectedRows[0] + "/view");
        },
      });
      array.push({
        key: "edit",
        text: "Edit",
        icon: ClipboardEditRegular,
        onClick: () => {
          navigate("/identities/" + selectedRows[0] + "/edit");
        },
      });
    }
    if (localCount >= 1) {
      array.push({
        key: "delete",
        text: "Delete",
        icon: DeleteRegular,
        onClick: () => deleteSelected(),
      });
      array.push({
        key: "recoveryLink",
        text: "Recovery",
        icon: MailRegular,
        onClick: () => recoverySelected(),
      });
    }
    array.push({
      key: "refresh",
      text: "Refresh",
      icon: ArrowClockwiseRegular,
      onClick: () => refreshData(true),
    });

    return array;
  }

  function refreshData(showBanner: boolean) {
    refreshDataInternal(showBanner).catch(() => {
      MessageService.Instance.dispatchMessage({
        message: {
          intent: "error",
          title: "failed to get identities",
        },
        removeAfterSeconds: 4000,
      });
    });
  }

  async function refreshDataInternal(showBanner: boolean) {
    const adminIdentitiesReturn = await apiRef.current!.listIdentities();
    if (adminIdentitiesReturn) {
      const ti = mapIdentitysToTable(adminIdentitiesReturn.data);
      const di = searchQuery ? filterItems(ti, searchQuery) : ti;
      setTableItems(ti);
      setDisplayedItems(di);
    }

    if (showBanner) {
      MessageService.Instance.dispatchMessage({
        removeAfterSeconds: 2,
        message: {
          title: "identities refreshed",
          intent: "success",
        },
      });
    }
  }

  function mapIdentitysToTable(identities: Identity[]): IdentityTableItem[] {
    return identities.map((identity) => {
      return {
        id: identity.id,
        state: identity.state?.toString()!,
        schema: identity.schema_id,
        verifiable_addresses: identity.verifiable_addresses
          ?.map((e) => e.value)
          .join(", ")!,
      };
    });
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);
    setDisplayedItems(q ? filterItems(tableItems, q) : tableItems);
  };

  function filterItems(
    items: IdentityTableItem[],
    query: string,
  ): IdentityTableItem[] {
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.id.toLowerCase().includes(lowerQuery) ||
        item.state.toLowerCase().includes(lowerQuery) ||
        item.schema.toLowerCase().includes(lowerQuery) ||
        item.verifiable_addresses.toLowerCase().includes(lowerQuery),
    );
  }

  function deleteSelected() {
    const values = selectedRows;
    const promises: Promise<any>[] = [];
    values.forEach((val) => {
      promises.push(
        apiRef.current!.deleteIdentity({
          id: val + "",
        }),
      );
    });
    Promise.all(promises)
      .then(() => {
        refreshData(false);
        MessageService.Instance.dispatchMessage({
          removeAfterSeconds: 2,
          message: {
            title: "selected identites deleted",
            intent: "success",
          },
        });
      })
      .catch(() => {
        MessageService.Instance.dispatchMessage({
          removeAfterSeconds: 5,
          message: {
            title: "failed to delete identites",
            intent: "error",
            content: (
              <div>
                <span>See console logs for more informations</span>
              </div>
            ),
          },
        });
      });
  }

  function recoverySelected() {
    const values = selectedRows;
    const promises: Promise<any>[] = [];
    values.forEach((val) => {
      promises.push(
        apiRef.current!.createRecoveryLinkForIdentity({
          createRecoveryLinkForIdentityBody: {
            identity_id: val + "",
          },
        }),
      );
    });
    Promise.all(promises)
      .then(() => {
        MessageService.Instance.dispatchMessage({
          removeAfterSeconds: 2,
          message: {
            title: "selected identites recovered",
            intent: "success",
          },
        });
      })
      .catch(() => {
        MessageService.Instance.dispatchMessage({
          removeAfterSeconds: 5,
          message: {
            title: "failed to recover identites",
            intent: "error",
            content: (
              <div>
                <span>See console logs for more informations</span>
              </div>
            ),
          },
        });
      });
  }

  return (
    <div className="container">
      <Title1 as={"h1"}>Identities</Title1>
      <div style={{ marginTop: 10 }}>
        <Toolbar>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}>
            <div>
              {commandBarItems.map((item) => {
                const CustomIcon = item.icon;
                return (
                  <ToolbarButton
                    key={item.key}
                    onClick={() => item.onClick()}>
                    <CustomIcon />
                    <span style={{ paddingLeft: 4 }}>{item.text}</span>
                  </ToolbarButton>
                );
              })}
            </div>
            <div>
              <Input
                placeholder="Search ..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </Toolbar>
      </div>

      <DataGrid
        selectionMode="multiselect"
        items={displayedItems}
        columns={columns}
        sortable
        resizableColumns
        getRowId={(item: IdentityTableItem) => item.id}
        onSelectionChange={(e, data) => {
          const sel = Array.from(data.selectedItems.values());
          setSelectedRows(sel);
          setCommandBarItems(getCommandbarItems(data.selectedItems.size));
        }}
        columnSizingOptions={{
          id: {
            defaultWidth: 300,
          },
          state: {
            defaultWidth: 60,
            minWidth: 60,
          },
          schema: {
            defaultWidth: 80,
          },
          verifiable_addresses: {
            defaultWidth: 300,
          },
        }}>
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<IdentityTableItem>>
          {({ item, rowId }) => (
            <DataGridRow<IdentityTableItem>
              key={rowId}
              onDoubleClick={() => {
                navigate("/identities/" + rowId + "/view");
              }}>
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
    </div>
  );
};

export default IdentitiesSite;
