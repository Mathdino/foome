import React from "react";
import { Image, View } from "react-native";

type LoadingProps = {
  /** When true (default) the loader fills the screen. Set false for inline usage. */
  fullscreen?: boolean;
  size?: number;
};

const Loading = ({ fullscreen = true, size = 96 }: LoadingProps) => {
  const content = (
    <Image
      source={require("@/assets/gifs/loading.gif")}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );

  if (!fullscreen) {
    return <View className="items-center justify-center py-6">{content}</View>;
  }

  return (
    <View className="flex-1 bg-white items-center justify-center">
      {content}
    </View>
  );
};

export default Loading;
