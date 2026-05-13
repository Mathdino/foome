import { useIsFocused } from "@react-navigation/native";
import React from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  className?: string;
  /**
   * Tipo de animação de entrada. Padrão: "fadeUp".
   */
  variant?: "fade" | "fadeUp";
};

/**
 * Envolve o conteúdo de uma tela e dispara uma animação de entrada toda vez
 * que a tela ganha foco (útil para tabs, onde o componente não desmonta).
 */
const AnimatedScreen = ({
  children,
  className,
  variant = "fadeUp",
}: Props) => {
  const isFocused = useIsFocused();
  const animation =
    variant === "fade"
      ? FadeIn.duration(260)
      : FadeInDown.duration(280).springify().damping(18);

  return (
    <Animated.View
      key={isFocused ? "focused" : "blurred"}
      className={className}
      entering={animation}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedScreen;
