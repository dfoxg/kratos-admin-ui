import {
    MessageBar,
    MessageBarActions,
    MessageBarTitle,
    MessageBarBody,
    MessageBarGroup,
    MessageBarGroupProps,
    MessageBarIntent,
    Button,
    Link,
    makeStyles,
    shorthands,
    tokens,
    Field,
    RadioGroup,
    Radio,
  } from "@fluentui/react-components";

interface MessageBarProps {

}

export function MessageBar(props: MessageBarProps) {

    return (
        <MessageBarGroup animate={animate} className={styles.messageBarGroup}>
            {messages.map(({ intent, id }) => (
                <MessageBar key={`${intent}-${id}`} intent={intent}>
                    <MessageBarBody>
                        <MessageBarTitle>Descriptive title</MessageBarTitle>
                        Message providing information to the user with actionable
                        insights. <Link>Link</Link>
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
    )

}