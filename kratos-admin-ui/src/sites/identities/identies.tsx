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
import { withRouter } from "react-router-dom";
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

interface IdentitiesState {
  commandBarItems: ToolbarItem[];
  tableItems: IdentityTableItem[];
  displayedItems: IdentityTableItem[];
  selectedRows: TableRowId[];
  searchQuery: string;
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

class IdentitiesSite extends React.Component<any, IdentitiesState> {
  state: IdentitiesState = {
    commandBarItems: this.getCommandbarItems(0),
    tableItems: [],
    displayedItems: [],
    selectedRows: [],
    searchQuery: "",
  };

  private api: IdentityApi | undefined;

  componentDidMount() {
    getKratosConfig().then((config) => {
      this.api = new IdentityApi(config.adminConfig);
      this.refreshData(false);
    });
  }

  private getCommandbarItems(localCount: number): ToolbarItem[] {
    const array: ToolbarItem[] = [];

    array.push({
      key: "new",
      text: "New",
      icon: NewRegular,
      onClick: () => {
        this.props.history.push("/identities/create");
      },
    });

    if (localCount === 1) {
      array.push({
        key: "view",
        text: "View",
        icon: ContentViewRegular,
        onClick: () => {
          this.props.history.push(
            "/identities/" + this.state.selectedRows[0] + "/view",
          );
        },
      });
      array.push({
        key: "edit",
        text: "Edit",
        icon: ClipboardEditRegular,
        onClick: () => {
          this.props.history.push(
            "/identities/" + this.state.selectedRows[0] + "/edit",
          );
        },
      });
    }
    if (localCount >= 1) {
      array.push({
        key: "delete",
        text: "Delete",
        icon: DeleteRegular,
        onClick: () => this.deleteSelected(),
      });
      array.push({
        key: "recoveryLink",
        text: "Recovery",
        icon: MailRegular,
        onClick: () => this.recoverySelected(),
      });
    }
    array.push({
      key: "refresh",
      text: "Refresh",
      icon: ArrowClockwiseRegular,
      onClick: () => this.refreshData(true),
    });

    return array;
  }

  private refreshData(showBanner: boolean) {
    this.refreshDataInternal(showBanner)
      .then(() => {})
      .catch((err) => {
        MessageService.Instance.dispatchMessage({
          message: {
            intent: "error",
            title: "failed to get identities",
          },
          removeAfterSeconds: 4000,
        });
      });
  }

  private async refreshDataInternal(showBanner: boolean) {
    const adminIdentitiesReturn = await this.api!.listIdentities();
    if (adminIdentitiesReturn) {
      const tableItems = this.mapIdentitysToTable(adminIdentitiesReturn.data);
      const displayedItems = this.state.searchQuery
        ? this.filterItems(tableItems, this.state.searchQuery)
        : tableItems;
      this.setState({
        tableItems: tableItems,
        displayedItems: displayedItems,
      });
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

  private mapIdentitysToTable(identities: Identity[]): IdentityTableItem[] {
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

  private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value.toLowerCase();
    this.setState((prevState) => ({
      searchQuery,
      displayedItems: searchQuery
        ? this.filterItems(prevState.tableItems, searchQuery)
        : prevState.tableItems,
    }));
  };

  private filterItems = (
    items: IdentityTableItem[],
    query: string,
  ): IdentityTableItem[] => {
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.id.toLowerCase().includes(lowerQuery) ||
        item.state.toLowerCase().includes(lowerQuery) ||
        item.schema.toLowerCase().includes(lowerQuery) ||
        item.verifiable_addresses.toLowerCase().includes(lowerQuery),
    );
  };

  private deleteSelected() {
    const values = this.state.selectedRows;
    const promises: Promise<any>[] = [];
    values.forEach((val) => {
      promises.push(
        this.api!.deleteIdentity({
          id: val + "",
        }),
      );
    });
    Promise.all(promises)
      .then(() => {
        this.refreshData(false);
        MessageService.Instance.dispatchMessage({
          removeAfterSeconds: 2,
          message: {
            title: "selected identites deleted",
            intent: "success",
          },
        });
      })
      .catch((err) => {
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

  private recoverySelected() {
    const values = this.state.selectedRows;
    const promises: Promise<any>[] = [];
    values.forEach((val) => {
      promises.push(
        this.api!.createRecoveryLinkForIdentity({
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
      .catch((err) => {
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
  render() {
    return (
      <div className="container">
        <Title1 as={"h1"}>Identities</Title1>
        <Toolbar>
          <div>
            <Input
              placeholder="Search..."
              value={this.state.searchQuery}
              onChange={this.handleSearchChange}
            />
          </div>

          <div>
            {this.state.commandBarItems.map((item) => {
              const CustomIcon = item.icon;
              return (
                <ToolbarButton key={item.key} onClick={() => item.onClick()}>
                  <CustomIcon />
                  <span style={{ paddingLeft: 4 }}>{item.text}</span>
                </ToolbarButton>
              );
            })}
          </div>
        </Toolbar>

        <DataGrid
          selectionMode="multiselect"
          items={this.state.displayedItems}
          columns={columns}
          sortable
          resizableColumns
          getRowId={(item: IdentityTableItem) => item.id}
          onSelectionChange={(e, data) => {
            this.setState({
              commandBarItems: this.getCommandbarItems(data.selectedItems.size),
              selectedRows: Array.from(data.selectedItems.values()),
            });
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
          }}
        >
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
                  this.props.history.push("/identities/" + rowId + "/view");
                }}
              >
                {({ renderCell }) => (
                  <DataGridCell>{renderCell(item)}</DataGridCell>
                )}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </div>
    );
  }
}

export default withRouter(IdentitiesSite);
