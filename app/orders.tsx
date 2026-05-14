import AnimatedScreen from "@/components/AnimatedScreen";
import CustomHeader from "@/components/CustomHeader";
import Loading from "@/components/Loading";
import { images } from "@/constants";
import { getOrders } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { CartItemType } from "@/type";
import cn from "clsx";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Order = {
  $id: string;
  $createdAt: string;
  items: CartItemType[];
  subtotal: number;
  deliveryFee: number;
  couponCode?: string;
  couponDiscount: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  status: string;
};

const fmt = (n: number) => `R$${n.toFixed(2).replace(".", ",")}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} • ${d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: "Pix",
  credit: "Cartão de Crédito",
  debit: "Cartão de Débito",
  cash: "Dinheiro",
};

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Pendente", color: "#B45309", bg: "#FEF3C7" },
  preparing: { label: "Preparando", color: "#1D4ED8", bg: "#DBEAFE" },
  delivering: { label: "Saiu para entrega", color: "#7C3AED", bg: "#EDE9FE" },
  delivered: { label: "Entregue", color: "#2F9B65", bg: "#D1FAE5" },
  cancelled: { label: "Cancelado", color: "#B91C1C", bg: "#FEE2E2" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const info = STATUS_LABELS[status] ?? STATUS_LABELS.pending;
  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: info.bg }}
    >
      <Text className="small-bold" style={{ color: info.color }}>
        {info.label}
      </Text>
    </View>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const [expanded, setExpanded] = useState(false);
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <View className="border border-gray-200/20 rounded-2xl p-4 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-2">
          <Text className="body-medium text-gray-200">
            {formatDate(order.$createdAt)}
          </Text>
          <Text className="paragraph-bold text-dark-100 mt-0.5">
            #{order.$id.slice(-6).toUpperCase()}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View className="flex-row items-center gap-3 mb-3">
        <View className="flex-row -space-x-3">
          {order.items.slice(0, 3).map((it, idx) => (
            <View
              key={`${it.id}-${idx}`}
              className="size-12 rounded-full bg-primary/10 border-2 border-white items-center justify-center overflow-hidden"
            >
              <Image
                source={{ uri: it.image_url }}
                className="size-10 rounded-full"
                resizeMode="cover"
              />
            </View>
          ))}
          {order.items.length > 3 && (
            <View className="size-12 rounded-full bg-dark-100 border-2 border-white items-center justify-center">
              <Text className="small-bold text-white">
                +{order.items.length - 3}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="body-medium text-gray-200">
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </Text>
          <Text className="paragraph-bold text-dark-100">
            {fmt(order.total)}
          </Text>
        </View>
      </View>

      {expanded && (
        <View className="border-t border-gray-100/20 pt-3 mt-1 gap-3">
          <View>
            <Text className="small-bold text-gray-200 mb-2">ITENS</Text>
            {order.items.map((it, idx) => {
              const extras =
                it.customizations?.reduce((s, c) => s + c.price, 0) ?? 0;
              const itemTotal = (it.price + extras) * it.quantity;
              return (
                <View
                  key={`${it.id}-${idx}`}
                  className="mb-2 pb-2 border-b border-gray-100/20"
                >
                  <View className="flex-row justify-between">
                    <Text
                      className="paragraph-semibold text-dark-100 flex-1 pr-2"
                      numberOfLines={1}
                    >
                      {it.quantity}x {it.name}
                    </Text>
                    <Text className="paragraph-semibold text-dark-100">
                      {fmt(itemTotal)}
                    </Text>
                  </View>
                  {it.customizations?.map((c) => (
                    <View
                      key={c.id}
                      className="flex-row justify-between mt-0.5"
                    >
                      <Text className="body-medium text-gray-200">
                        + {c.name}
                      </Text>
                      <Text className="body-medium text-primary">
                        +{fmt(c.price)}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>

          <View>
            <Text className="small-bold text-gray-200 mb-1">PAGAMENTO</Text>
            <Text className="paragraph-medium text-dark-100">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </Text>
          </View>

          <View>
            <Text className="small-bold text-gray-200 mb-1">ENTREGA</Text>
            <Text className="paragraph-medium text-dark-100">
              {order.deliveryAddress}
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3 gap-1">
            <View className="flex-row justify-between">
              <Text className="body-medium text-gray-200">Subtotal</Text>
              <Text className="body-medium text-dark-100">
                {fmt(order.subtotal)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="body-medium text-gray-200">Taxa de entrega</Text>
              <Text className="body-medium text-dark-100">
                {order.deliveryFee === 0 ? "Grátis" : fmt(order.deliveryFee)}
              </Text>
            </View>
            {!!order.couponCode && (
              <View className="flex-row justify-between">
                <Text className="body-medium text-gray-200">
                  Cupom ({order.couponCode})
                </Text>
                <Text className="body-medium text-success">
                  - {fmt(order.couponDiscount)}
                </Text>
              </View>
            )}
            <View className="border-t border-gray-200 mt-1 pt-1 flex-row justify-between">
              <Text className="paragraph-bold text-dark-100">Total</Text>
              <Text className="paragraph-bold text-primary">
                {fmt(order.total)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className="h-1 w-full bg-gray-200/10" />

      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        className="mt-2 flex-row items-center justify-center gap-1"
      >
        <Text className="paragraph-semibold text-primary">
          {expanded ? "Ocultar detalhes" : "Ver detalhes"}
        </Text>
        <Image
          source={images.arrowDown}
          className={cn("w-3 h-3", expanded && "rotate-180")}
          resizeMode="contain"
          tintColor="#FE8C00"
        />
      </TouchableOpacity>
    </View>
  );
};

const Orders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!user) return;
        try {
          setLoading(true);
          const res = await getOrders(user.$id);
          if (active) setOrders(res as any);
        } catch (e) {
          console.log("getOrders error", e);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [user]),
  );

  if (loading) {
    return (
      <SafeAreaView className="bg-white h-full">
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <AnimatedScreen>
        <ScrollView
          contentContainerClassName="pb-28 px-5 pt-5"
          showsVerticalScrollIndicator={false}
        >
          <CustomHeader title="Meus Pedidos" />

          {orders.length === 0 ? (
            <View className="flex-center flex-col mt-[40%]">
              <Image
                source={images.bag}
                className="w-16 h-16"
                resizeMode="contain"
                tintColor="#878787"
              />
              <Text className="h3-bold text-dark-100 mt-4">
                Nenhum pedido ainda
              </Text>
              <Text className="body-regular text-gray-200 mt-2 text-center">
                Seus pedidos aparecerão aqui após a primeira compra.
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                className="mt-6 bg-primary rounded-full px-6 py-3"
              >
                <Text className="paragraph-bold text-white">
                  Explorar Cardápio
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((o) => <OrderCard key={o.$id} order={o} />)
          )}
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
};

export default Orders;
