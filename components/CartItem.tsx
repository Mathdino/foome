import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import { useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedText = Animated.createAnimatedComponent(Text);

const CartItem = ({ item }: { item: CartItemType }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  // bounce na quantidade quando muda
  const qtyScale = useSharedValue(1);
  useEffect(() => {
    qtyScale.value = withSequence(
      withTiming(1.35, { duration: 120 }),
      withSpring(1, { damping: 6, stiffness: 180 }),
    );
  }, [item.quantity]);
  const qtyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qtyScale.value }],
  }));

  return (
    <Animated.View
      className="cart-item"
      entering={SlideInRight.duration(280)}
      exiting={SlideOutLeft.duration(220)}
    >
      <View className="flex flex-row items-center gap-x-3 flex-1 pr-3">
        <View className="cart-item__image">
          <Image
            source={{ uri: item.image_url }}
            className="size-4/5 rounded-lg"
            resizeMode="cover"
          />
        </View>

        <View className="flex-1">
          <Text
            className="base-bold text-dark-100"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text className="paragraph-bold text-primary mt-1">
            R${item.price.toString().replace(".", ",")}
          </Text>

          <View className="flex flex-row items-center gap-x-4 mt-2">
            <TouchableOpacity
              onPress={() => decreaseQty(item.id, item.customizations!)}
              className="cart-item__actions"
            >
              <Image
                source={images.minus}
                className="size-1/2"
                resizeMode="contain"
                tintColor={"#FF9C01"}
              />
            </TouchableOpacity>

            <AnimatedText
              className="base-bold text-dark-100"
              style={qtyStyle}
            >
              {item.quantity}
            </AnimatedText>

            <TouchableOpacity
              onPress={() => increaseQty(item.id, item.customizations!)}
              className="cart-item__actions"
            >
              <Image
                source={images.plus}
                className="size-1/2"
                resizeMode="contain"
                tintColor={"#FF9C01"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => removeItem(item.id, item.customizations!)}
        className="flex-center shrink-0"
      >
        <Image source={images.trash} className="size-5" resizeMode="contain" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CartItem;
