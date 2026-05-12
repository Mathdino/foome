import { CustomInputProps } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import cn from "clsx";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const Custominput = ({
  placeholder = "Escreva algo",
  value,
  onChangeText,
  label,
  secureTextEntry = false,
  keyboardType = "default",
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full">
      <Text className="label">{label}</Text>

      <View
        className={cn(
          "input flex-row items-center",
          isFocused ? "border-primary" : "border-gray-300",
        )}
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#888"
          className="flex-1"
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            className="pl-2"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Custominput;
