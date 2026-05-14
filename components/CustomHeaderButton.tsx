import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { images } from "@/constants";
import { CustomHeaderProps } from "@/type";
import CartButton from "@/components/CartButton";

const CustomHeader = ({ title }: CustomHeaderProps) => {
  const router = useRouter();

  return (
    <View className="custom-header">
      <TouchableOpacity onPress={() => router.back()}>
        <Image
          source={images.arrowBack}
          className="size-5"
          resizeMode="contain"
        />
      </TouchableOpacity>

      {title && (
        <Text
          className="base-semibold text-dark-100 max-w-[60%]"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      )}

      <CartButton />
    </View>
  );
};

export default CustomHeader;
