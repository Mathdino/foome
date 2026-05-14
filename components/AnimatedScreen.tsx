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
 * Envolve o conteúdo de uma tela e dispara uma animação de entrada na
 * primeira montagem. Antes era refeita a cada foco (via key), o que causava
 * remount e tela branca ao trocar de aba — agora é uma animação só na entrada.
 */
const AnimatedScreen = ({ children, className, variant = "fadeUp" }: Props) => {
  const animation =
    variant === "fade"
      ? FadeIn.duration(220)
      : FadeInDown.duration(240).springify().damping(18);

  return (
    <Animated.View
      className={className}
      entering={animation}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedScreen;
