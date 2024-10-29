import {
  Button,
  Toolbar,
  ToolbarButton,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  TableColumnDefinition,
  createTableColumn,
  TableRowId,
} from "@fluentui/react-components";
import {
  ArrowClockwiseRegular,
  DeleteDismissRegular,
  DeleteRegular,
  ExtendedDockRegular,
} from "@fluentui/react-icons";
import {
  IdentityApi,
  Session,
  SessionAuthenticationMethod,
  SessionDevice,
} from "@ory/kratos-client";
import React from "react";
import { getKratosConfig } from "../../config";
import { ToolbarItem } from "../../sites/identities/identies";
import { MessageService } from "../messages/messagebar";

interface ListSessionsProps {
  identity_id: string;
}

interface ListSessionsState {
  sessions: Session[];
  commandBarItems: ToolbarItem[];
  selectedRows: TableRowId[];
}

function mapBoolean(state?: boolean): string {
  if (state) {
    return "true";
  }
  return "false";
}

function mapAuthenticationMethod(list?: SessionAuthenticationMethod[]): string {
  if (list) {
    return list.map((el) => el.method).join(", ");
  }
  return "none";
}

function mapDevices(devices?: SessionDevice[]): string {
  if (devices) {
    return devices
      .map((d) => {
        if (d.location) {
          return d.ip_address + " (" + d.location + ")";
        }
        return d.ip_address;
      })
      .join(", ");
  }
  return "none";
}

function mapDate(dateString?: string): string {
  if (dateString) {
    return new Date(dateString).toLocaleString();
  }
  return "none";
}

const columns: TableColumnDefinition<Session>[] = [
  createTableColumn<Session>({
    columnId: "session_active",
    renderHeaderCell: () => {
      return "Active";
    },
    renderCell: (item) => {
      return (
        <span style={{ color: item.active ? "green" : "red" }}>
          {mapBoolean(item.active)}
        </span>
      );
    },
    compare: (a, b) => mapBoolean(a.active).localeCompare(mapBoolean(b.active)),
  }),
  createTableColumn<Session>({
    columnId: "authentication_method",
    renderHeaderCell: () => {
      return "Authentication Method";
    },
    renderCell: (item) => {
      return (
        <span>{mapAuthenticationMethod(item.authentication_methods)}</span>
      );
    },
    compare: (a, b) =>
      mapAuthenticationMethod(a.authentication_methods).localeCompare(
        mapAuthenticationMethod(b.authentication_methods),
      ),
  }),
  createTableColumn<Session>({
    columnId: "assurance_level",
    renderHeaderCell: () => {
      return "Assurance Level";
    },
    renderCell: (item) => {
      return <span>{item.authenticator_assurance_level}</span>;
    },
    compare: (a, b) => {
      if (a.authenticator_assurance_level && b.authenticator_assurance_level) {
        return a.authenticator_assurance_level.localeCompare(
          b.authenticator_assurance_level,
        );
      } else {
        return 0;
      }
    },
  }),
  createTableColumn<Session>({
    columnId: "devices",
    renderHeaderCell: () => {
      return "Devices";
    },
    renderCell: (item) => {
      return <span>{mapDevices(item.devices)}</span>;
    },
    compare: (a, b) =>
      mapDevices(a.devices).localeCompare(mapDevices(b.devices)),
  }),
  createTableColumn<Session>({
    columnId: "authenticated_at",
    renderHeaderCell: () => {
      return "Authenticated at";
    },
    renderCell: (item) => {
      return <span>{mapDate(item.authenticated_at)}</span>;
    },
    compare: (a, b) =>
      mapDate(a.authenticated_at).localeCompare(mapDate(b.authenticated_at)),
  }),
  createTableColumn<Session>({
    columnId: "expires_at",
    renderHeaderCell: () => {
      return "Expires at";
    },
    renderCell: (item) => {
      return <span>{mapDate(item.expires_at)}</span>;
    },
    compare: (a, b) =>
      mapDate(a.expires_at).localeCompare(mapDate(b.expires_at)),
  }),
];

export class ListSessions extends React.Component<
  ListSessionsProps,
  ListSessionsState
> {
  state: Readonly<ListSessionsState> = {
    sessions: [],
    commandBarItems: this.getCommandbarItems(0, 0),
    selectedRows: [],
  };

  identityApi?: IdentityApi;

  async componentDidMount() {
    await this.refreshData(false);
  }

  private async refreshData(showBanner: boolean) {
    const kratosConfig = await getKratosConfig();
    this.identityApi = new IdentityApi(kratosConfig.adminConfig);
    const sessionsAPIresponse = await this.identityApi.listIdentitySessions({
      id: this.props.identity_id,
    });
    this.setState({
      sessions: sessionsAPIresponse.data,
      commandBarItems: this.getCommandbarItems(
        0,
        sessionsAPIresponse.data.length,
      ),
    });

    if (showBanner) {
      MessageService.Instance.dispatchMessage({
        removeAfterSeconds: 2,
        message: {
          title: "sessions refreshed",
          intent: "success",
        },
      });
    }
  }

  getCommandbarItems(
    countSelectedElements: number,
    countSessions: number,
  ): ToolbarItem[] {
    const array: ToolbarItem[] = [];

    if (countSelectedElements === 1) {
      array.push({
        icon: ExtendedDockRegular,
        text: "Extend",
        key: "extend",
        onClick: () => {
          this.identityApi
            ?.extendSession({
              id: this.state.sessions[0].id,
            })
            .then((d) => {
              MessageService.Instance.dispatchMessage({
                removeAfterSeconds: 2,
                message: {
                  title: "session extended",
                  intent: "success",
                },
              });
              this.refreshData(false);
            });
        },
      });
    }

    if (countSelectedElements > 0) {
      array.push({
        icon: DeleteDismissRegular,
        text: "Deactivate",
        key: "deactivate",
        onClick: () => {
          this.deactiveSelected();
        },
      });
    }

    if (countSessions > 0) {
      array.push({
        icon: DeleteRegular,
        text: "Delete & Invalidate all",
        key: "delete_invalidate",
        onClick: () => {
          this.identityApi
            ?.deleteIdentitySessions({
              id: this.props.identity_id,
            })
            .then((d) => {
              this.refreshData(false);
              MessageService.Instance.dispatchMessage({
                removeAfterSeconds: 2,
                message: {
                  title: "sessions deleted",
                  intent: "success",
                },
              });
            });
        },
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

  private deactiveSelected() {
    const values = this.state.selectedRows;
    const promises: Promise<any>[] = [];
    values.forEach((val) => {
      promises.push(
        this.identityApi!.disableSession({
          id: val + "",
        }),
      );
    });
    Promise.all(promises).then(() => {
      this.refreshData(false);
      MessageService.Instance.dispatchMessage({
        removeAfterSeconds: 2,
        message: {
          title: "session deactivated",
          intent: "success",
        },
      });
    });
  }

  render(): React.ReactNode {
    return (
      <div>
        {!this.state.sessions || (
          <div>
            {this.state.sessions.length !== 0 || (
              <div>
                <p>There are no sessions referenced with this identity</p>
                <Button onClick={(e) => this.refreshData(true)}>Refresh</Button>
              </div>
            )}
            {this.state.sessions.length === 0 || (
              <div>
                <Toolbar>
                  <div>
                    {this.state.commandBarItems.map((item) => {
                      var CustomIcon = item.icon;
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
                </Toolbar>
                <DataGrid
                  selectionMode="multiselect"
                  items={this.state.sessions}
                  columns={columns}
                  sortable
                  resizableColumns
                  getRowId={(item: Session) => item.id}
                  onSelectionChange={(e, data) => {
                    this.setState({
                      commandBarItems: this.getCommandbarItems(
                        data.selectedItems.size,
                        this.state.sessions.length,
                      ),
                      selectedRows: Array.from(data.selectedItems.values()),
                    });
                  }}
                  columnSizingOptions={{
                    session_active: {
                      defaultWidth: 50,
                    },
                    authentication_method: {
                      defaultWidth: 160,
                      minWidth: 160,
                    },
                  }}>
                  <DataGridHeader>
                    <DataGridRow>
                      {({ renderHeaderCell }) => (
                        <DataGridHeaderCell>
                          {renderHeaderCell()}
                        </DataGridHeaderCell>
                      )}
                    </DataGridRow>
                  </DataGridHeader>
                  <DataGridBody<Session>>
                    {({ item, rowId }) => (
                      <DataGridRow<Session> key={rowId}>
                        {({ renderCell }) => (
                          <DataGridCell>{renderCell(item)}</DataGridCell>
                        )}
                      </DataGridRow>
                    )}
                  </DataGridBody>
                </DataGrid>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
