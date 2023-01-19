import React from "react";
import {
  Layout,
  Text,
  useTheme,
  Button,
  Input,
  Icon,
  Datepicker,
  CalendarViewModes,
  ButtonGroup,
  RadioGroup,
  Radio,
} from "@ui-kitten/components";

import { SignUpStyles } from "~/styles/SignUpStyle";
import { View } from "react-native";

export const SuffixInput = ({ suffix, ...props }: any) => {
  const renderSuffix = (_evaProps: any) => <Text>{suffix}</Text>;
  return <Input {...props} accessoryRight={renderSuffix} />;
};

export const PrefixInput = ({ suffix, ...props }: any) => {
  const renderPrefix = (_evaProps: any) => <Text>{suffix}</Text>;
  return <Input {...props} accessoryLeft={renderPrefix} />;
};

export const FormControl = ({
  label = null,
  children,
  level = "1",
  containerStyle,
}: any) => {
  const theme = useTheme();

  return (
    <Layout style={[SignUpStyles.inputGroup, containerStyle]} level={level}>
      {label && (
        <Text
          style={{
            color: theme["text-hint-color"],
          }}
          category="label"
        >
          {label}
        </Text>
      )}
      {children}
    </Layout>
  );
};

interface RadioProps {
  title: string;
  description: string;
  status?: string;
  formStyles?: any;
}
export const RadioDescription = ({
  title,
  description,
  status,
  formStyles,
  ...props
}: RadioProps) => {
  const renderDescription = (_evaProps: any) => (
    <View style={{ paddingRight: 15, paddingLeft: 15 }}>
      <Text
        appearance={status === "disabled" ? "hint" : "default"}
        category="h2"
      >
        {title}
      </Text>
      <Text
        appearance={status === "disabled" ? "hint" : "default"}
        category="p1"
      >
        {description}
      </Text>
    </View>
  );
  return (
    <Radio
      {...props}
      status={status}
      disabled={status === "disabled"}
      style={[formStyles.radioButton, { marginBottom: 10, marginTop: 10 }]}
    >
      {renderDescription}
    </Radio>
  );
};

export const renderRadio = (title: string, index: number) => (
  <Radio key={index}>{title}</Radio>
);
export default FormControl;
