import AnimatedScreen from "@/components/AnimatedScreen";
import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeaderButton from "@/components/CustomHeaderButton";
import { useCartStore } from "@/store/cart.store";
import { PaymentInfoStripeProps } from "@/type";
import cn from "clsx";
import { Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfoStripe = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

const Cart = () => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // chave única por item considerando customizações — necessário para o
  // reanimated identificar mount/unmount e disparar entering/exiting.
  const keyOf = (it: (typeof items)[number]) =>
    `${it.id}-${(it.customizations ?? [])
      .map((c) => c.id)
      .sort()
      .join("|")}`;

  return (
    <SafeAreaView className="bg-white h-full">
      <AnimatedScreen>
        <Animated.FlatList
          data={items}
          renderItem={({ item }) => <CartItem item={item} />}
          keyExtractor={keyOf}
          itemLayoutAnimation={LinearTransition.springify().damping(16)}
          contentContainerClassName="pb-28 px-5 pt-5"
          ListHeaderComponent={() => (
            <CustomHeaderButton title="Seu Carrinho" />
          )}
          ListEmptyComponent={() => <Text>Nenhum Item</Text>}
          ListFooterComponent={() =>
            totalItems > 0 && (
              <View className="gap-5">
                <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                  <Text className="h3-bold text-dark-100 mb-5">
                    Resumo do Pagamento
                  </Text>

                  <PaymentInfoStripe
                    label={`Total de Items (${totalItems})`}
                    value={`R$${totalPrice.toFixed(2).replace(".", ",")}`}
                  />

                  <PaymentInfoStripe
                    label={`Taxa de Entrega`}
                    value={`R$5,00`}
                  />

                  <PaymentInfoStripe
                    label={`Desconto`}
                    value={`- R$10,00`}
                    valueStyle="!text-success"
                  />

                  <View className="border-t border-gray-300 my-2" />

                  <PaymentInfoStripe
                    label={`Total a Pagar`}
                    labelStyle="base-bold !text-dark-100"
                    valueStyle="base-bold !text-dark-100 !text-right"
                    value={`R$${(totalPrice + 5 - 10).toFixed(2).replace(".", ",")}`}
                  />
                </View>

                <CustomButton title="Finalizar Compra" />
              </View>
            )
          }
        />
      </AnimatedScreen>
    </SafeAreaView>
  );
};

export default Cart;
