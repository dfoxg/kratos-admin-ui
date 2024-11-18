import React from "react";
import { Button, Input, Tooltip } from "@fluentui/react-components";
import { Add12Filled, Delete12Filled } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { FluentUIInputDataType } from "../../service/schema-service";

interface MultilineEditProps {
  defaultData?: any[];
  datatype: FluentUIInputDataType;
  dataChanged(any: any[]): void;
  name: string;
}

export function MultilineEdit(props: MultilineEditProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (props.defaultData && props.defaultData.length > 0) {
      if (JSON.stringify(data) !== JSON.stringify(props.defaultData)) {
        setData(props.defaultData);
      }
    } else {
      setData([""]);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {data.map((value, index) => {
        return (
          <div
            key={[index, value].join("-")}
            style={{
              display: "flex",
              alignItems: "center",
              paddingBottom: 5,
            }}>
            <Input
              style={{
                flexGrow: 2,
              }}
              type={props.datatype}
              onChange={(ev, inputData) => {
                data[index] = inputData.value;
                props.dataChanged(data);
              }}
              defaultValue={value}
              name={props.name + "_" + index}></Input>
            <div>
              <Tooltip
                content="Add another line"
                relationship="description">
                <Button
                  style={{
                    marginLeft: 5,
                  }}
                  size="small"
                  icon={<Add12Filled></Add12Filled>}
                  onClick={(event) => {
                    setData(data.concat(""));
                  }}></Button>
              </Tooltip>
              <Tooltip
                content={"Remove line"}
                relationship="description">
                <Button
                  style={{
                    marginLeft: 5,
                  }}
                  disabled={data.length === 1}
                  size="small"
                  icon={<Delete12Filled></Delete12Filled>}
                  onClick={(event) => {
                    const filtered = data.filter((arrayvalue, arrayIndex) => {
                      return arrayIndex !== index;
                    });
                    setData(filtered);
                    props.dataChanged(filtered);
                  }}></Button>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </>
  );
}
