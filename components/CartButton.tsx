import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Image, Text, TouchableOpacity } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedText = Animated.createAnimatedComponent(Text);

const CartButton = () => {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  // bounce no botão e no badge quando o total muda
  const btnScale = useSharedValue(1);
  const badgeScale = useSharedValue(1);
  const prev = useRef(totalItems);

  useEffect(() => {
    if (prev.current !== totalItems) {
      btnScale.value = withSequence(
        withTiming(0.9, { duration: 90 }),
        withSpring(1, { damping: 6, stiffness: 200 }),
      );
      badgeScale.value = withSequence(
        withTiming(1.4, { duration: 120 }),
        withSpring(1, { damping: 6, stiffness: 220 }),
      );
      prev.current = totalItems;
    }
  }, [totalItems]);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Animated.View style={btnStyle}>
      <TouchableOpacity
        className="cart-btn"
        onPress={() => {
          router.push("/cart");
        }}
      >
        <Image source={images.bag} className="size-5" resizeMode="contain" />

        {totalItems > 0 && (
          <Animated.View
            className="cart-badge"
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(180)}
            style={badgeStyle}
          >
            <AnimatedText className="small-bold text-white">
              {totalItems}
            </AnimatedText>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CartButton;
