import React from "react";
import { Text, View } from "react-native";

const Custominput = ({
  placeholder = "Escreva algo",
  value,
  onChangeText,
  label,
  secureTextEntery = false,
  keyboardType = "default",
}: CustomInputProps) => {
  return (
    <View>
      <Text>Custominput</Text>
    </View>
  );
};

export default Custominput;
