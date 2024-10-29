import {
  MessageBar,
  MessageBarActions,
  MessageBarTitle,
  MessageBarBody,
  MessageBarGroup,
  Button,
  MessageBarIntent,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import React, { useEffect, useState } from "react";

interface Message {
  intent: MessageBarIntent;
  title: string;
  content?: JSX.Element;
}

interface InternalMessage extends Message {
  id: number;
  removeAfterSeconds: number;
}

type MessageConfig = {
  message: Message;
  removeAfterSeconds: number;
};

export class MessageService {
  private static _instance: MessageService;

  private eventQueue: InternalMessage[] = [];
  private id: number = 0;

  public dispatchMessage(message: MessageConfig): void {
    const msg: InternalMessage = {
      id: this.id++,
      content: message.message.content,
      intent: message.message.intent,
      title: message.message.title,
      removeAfterSeconds: message.removeAfterSeconds,
    };

    this.eventQueue.push(msg);
    window.dispatchEvent(new Event("new_event_dispatched"));
  }

  public getAndCleanMessages(): InternalMessage[] {
    const data = this.eventQueue;
    this.eventQueue = [];
    return data;
  }

  private constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}

export function MessageBarComponent() {
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const dismissMessage = (messageId: number) =>
    setMessages((s) => s.filter((entry) => entry.id !== messageId));

  function handleWindowClick() {
    const newMessages = MessageService.Instance.getAndCleanMessages();
    setMessages(messages.concat(newMessages));

    newMessages.forEach((newMessage) => {
      setTimeout(() => {
        dismissMessage(newMessage.id);
      }, newMessage.removeAfterSeconds * 1000);
    });
  }

  useEffect(() => {
    window.addEventListener("new_event_dispatched", handleWindowClick);
    return () => {
      window.removeEventListener("new_event_dispatched", handleWindowClick);
    };
  });

  return (
    <MessageBarGroup
      animate="both"
      style={{
        position: "absolute",
        top: 70,
        right: 20,
        zIndex: 300,
      }}>
      {messages.map(({ intent, id, title, content }) => (
        <MessageBar
          key={`${intent}-${id}`}
          intent={intent}>
          <MessageBarBody>
            <MessageBarTitle>{title}</MessageBarTitle>
            {content}
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                onClick={() => dismissMessage(id)}
                aria-label="dismiss"
                appearance="transparent"
                icon={<DismissRegular />}
              />
            }
          />
        </MessageBar>
      ))}
    </MessageBarGroup>
  );
}
