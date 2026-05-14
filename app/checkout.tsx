import AnimatedScreen from "@/components/AnimatedScreen";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import Custominput from "@/components/Custominput";
import { images } from "@/constants";
import { createOrder } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import cn from "clsx";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DELIVERY_FEE = 5;

const VALID_COUPONS: Record<string, { label: string; discount: number }> = {
  PROMO10: { label: "10% off", discount: 0.1 },
  FRETE0: { label: "Frete grátis", discount: 0 },
};

type PaymentMethod = "pix" | "credit" | "debit" | "cash";

const paymentOptions: { id: PaymentMethod; label: string; icon: any }[] = [
  { id: "pix", label: "Pix", icon: images.dollar },
  { id: "credit", label: "Cartão de Crédito", icon: images.bag },
  { id: "debit", label: "Cartão de Débito", icon: images.bag },
  { id: "cash", label: "Dinheiro", icon: images.dollar },
];

const SectionTitle = ({ children }: { children: string }) => (
  <Text className="h3-bold text-dark-100 mb-4">{children}</Text>
);

const Row = ({
  label,
  value,
  bold,
  green,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}) => (
  <View className="flex-row justify-between items-center my-1">
    <Text
      className={cn(
        "paragraph-medium text-gray-200",
        bold && "paragraph-bold !text-dark-100",
      )}
    >
      {label}
    </Text>
    <Text
      className={cn("paragraph-bold text-dark-100", green && "!text-success")}
    >
      {value}
    </Text>
  </View>
);

const fmt = (n: number) => `R$${n.toFixed(2).replace(".", ",")}`;

const CheckoutItemRow = ({ item }: { item: CartItemType }) => {
  const extrasTotal =
    item.customizations?.reduce((s, c) => s + c.price, 0) ?? 0;
  const unitTotal = item.price + extrasTotal;
  const rowTotal = unitTotal * item.quantity;

  return (
    <View className="mb-4 pb-4 border-b border-gray-100">
      <View className="flex-row items-start gap-3">
        <View className="size-14 bg-primary/10 rounded-xl items-center justify-center shrink-0">
          <Image
            source={{ uri: item.image_url }}
            className="size-4/5 rounded-lg"
            resizeMode="cover"
          />
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text
              className="paragraph-bold text-dark-100 flex-1 pr-2"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text className="paragraph-bold text-dark-100">
              {fmt(rowTotal)}
            </Text>
          </View>

          <Text className="body-medium text-gray-200 mt-0.5">
            {fmt(item.price)} × {item.quantity}
          </Text>

          {item.customizations && item.customizations.length > 0 && (
            <View className="mt-1.5 gap-0.5">
              {item.customizations.map((c) => (
                <View
                  key={c.id}
                  className="flex-row justify-between items-center"
                >
                  <Text className="body-medium text-gray-200">+ {c.name}</Text>
                  <Text className="body-medium text-primary">
                    +{fmt(c.price)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const Checkout = () => {
  const { user } = useAuthStore();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState(
    user?.addresses?.[0] ?? "",
  );
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    label: string;
    discount: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();
  const couponDiscount =
    appliedCoupon?.code === "FRETE0"
      ? DELIVERY_FEE
      : (appliedCoupon?.discount ?? 0) * subtotal;
  const frete = appliedCoupon?.code === "FRETE0" ? 0 : DELIVERY_FEE;
  const total =
    subtotal + frete - (appliedCoupon?.code === "FRETE0" ? 0 : couponDiscount);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const found = VALID_COUPONS[code];
    if (!found) {
      Alert.alert("Cupom inválido", "O código informado não é válido.");
      return;
    }
    setAppliedCoupon({ code, ...found });
    Alert.alert("Cupom aplicado!", `${found.label} adicionado ao seu pedido.`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleOrder = async () => {
    if (!selectedAddress.trim()) {
      Alert.alert(
        "Endereço obrigatório",
        "Selecione ou informe um endereço de entrega.",
      );
      return;
    }

    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para fazer um pedido.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        userId: user.$id,
        items,
        subtotal,
        deliveryFee: frete,
        couponCode: appliedCoupon?.code ?? "",
        couponDiscount,
        total,
        paymentMethod,
        deliveryAddress: selectedAddress,
        status: "pending",
      });

      setOrderPlaced(true);
      clearCart();
      router.replace("/orders");
      Alert.alert(
        "Pedido realizado! 🎉",
        "Seu pedido foi enviado com sucesso.",
      );
    } catch (e: any) {
      Alert.alert("Erro", e.message ?? "Não foi possível enviar o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    router.replace("/(tabs)/cart");
    return null;
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <AnimatedScreen>
        <ScrollView
          contentContainerClassName="pb-32 px-5 pt-5"
          showsVerticalScrollIndicator={false}
        >
          <CustomHeader title="Finalizar Pedido" />

          {/* ── Informações do usuário ── */}
          <View className="border-b border-gray-100/20 rounded-2xl p-5 mb-5">
            <SectionTitle>Informações</SectionTitle>

            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <Image
                  source={images.person}
                  className="w-5 h-5"
                  resizeMode="contain"
                  tintColor="#FE8C00"
                />
              </View>
              <View>
                <Text className="body-medium text-gray-200">Nome</Text>
                <Text className="paragraph-bold text-dark-100">
                  {user?.name ?? "—"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <Image
                  source={images.phone}
                  className="w-5 h-5"
                  resizeMode="contain"
                  tintColor="#FE8C00"
                />
              </View>
              <View>
                <Text className="body-medium text-gray-200">Telefone</Text>
                <Text className="paragraph-bold text-dark-100">
                  {user?.phones ?? "Não cadastrado"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <Image
                  source={images.envelope}
                  className="w-5 h-5"
                  resizeMode="contain"
                  tintColor="#FE8C00"
                />
              </View>
              <View className="flex-1">
                <Text className="body-medium text-gray-200">E-mail</Text>
                <Text
                  className="paragraph-bold text-dark-100"
                  numberOfLines={1}
                >
                  {user?.email ?? "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Endereço de entrega ── */}
          <View className="border-b border-gray-100/20 rounded-2xl p-5 mb-5">
            <SectionTitle>Endereço de Entrega</SectionTitle>

            {user?.addresses && user.addresses.length > 0 ? (
              <>
                {user.addresses.map((addr, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedAddress(addr)}
                    className={cn(
                      "flex-row items-center gap-3 p-3 rounded-xl mb-2 border",
                      selectedAddress === addr
                        ? "border-primary bg-primary/5"
                        : "border-gray-200",
                    )}
                  >
                    <View
                      className={cn(
                        "w-5 h-5 rounded-full border-2 items-center justify-center",
                        selectedAddress === addr
                          ? "border-primary"
                          : "border-gray-300",
                      )}
                    >
                      {selectedAddress === addr && (
                        <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </View>
                    <View className="flex-row items-center gap-2 flex-1">
                      <Image
                        source={images.location}
                        className="w-4 h-4"
                        resizeMode="contain"
                        tintColor={
                          selectedAddress === addr ? "#FE8C00" : "#878787"
                        }
                      />
                      <Text
                        className={cn(
                          "paragraph-medium flex-1",
                          selectedAddress === addr
                            ? "text-dark-100"
                            : "text-gray-200",
                        )}
                        numberOfLines={2}
                      >
                        {addr}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View className="gap-2">
                <Custominput
                  label="Endereço completo"
                  placeholder="Rua, número, bairro, cidade"
                  value={selectedAddress}
                  onChangeText={setSelectedAddress}
                />
                <Text className="body-medium text-gray-200 pl-2">
                  Nenhum endereço salvo.{" "}
                  <Text
                    className="text-primary"
                    onPress={() => router.push("/edit-profile")}
                  >
                    Cadastrar no perfil
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* ── Itens do pedido ── */}
          <View className="border-b border-gray-100/20 rounded-2xl p-5 mb-5">
            <SectionTitle>Resumo do Pedido</SectionTitle>

            {items.map((item, i) => (
              <CheckoutItemRow key={`${item.id}-${i}`} item={item} />
            ))}
          </View>

          {/* ── Cupom de desconto ── */}
          <View className="border-b border-gray-100/20 rounded-2xl p-5 mb-5">
            <SectionTitle>Cupom de Desconto</SectionTitle>

            {appliedCoupon ? (
              <View className="flex-row items-center justify-between bg-success/10 border border-success rounded-xl p-3">
                <View className="flex-row items-center gap-2">
                  <Image
                    source={images.check}
                    className="w-4 h-4"
                    resizeMode="contain"
                    tintColor="#2F9B65"
                  />
                  <View>
                    <Text className="paragraph-bold text-success">
                      {appliedCoupon.code}
                    </Text>
                    <Text className="body-medium text-success">
                      {appliedCoupon.label}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={removeCoupon}>
                  <Image
                    source={images.trash}
                    className="w-4 h-4"
                    resizeMode="contain"
                    tintColor="#F14141"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row gap-2 items-end">
                <View className="flex-1">
                  <Custominput
                    label="Código do cupom"
                    placeholder="Ex: PROMO10"
                    value={couponInput}
                    onChangeText={setCouponInput}
                  />
                </View>
                <TouchableOpacity
                  onPress={applyCoupon}
                  className="h-12 px-4 bg-primary rounded-xl items-center justify-center"
                >
                  <Text className="paragraph-bold text-white">Aplicar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Método de pagamento ── */}
          <View className="border-b border-gray-100/20 rounded-2xl p-5 mb-5">
            <SectionTitle>Método de Pagamento</SectionTitle>

            <View className="gap-2">
              {paymentOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setPaymentMethod(opt.id)}
                  className={cn(
                    "flex-row items-center gap-3 p-3 rounded-xl border",
                    paymentMethod === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200",
                  )}
                >
                  <View
                    className={cn(
                      "w-5 h-5 rounded-full border-2 items-center justify-center",
                      paymentMethod === opt.id
                        ? "border-primary"
                        : "border-gray-300",
                    )}
                  >
                    {paymentMethod === opt.id && (
                      <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </View>
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                    <Image
                      source={opt.icon}
                      className="w-4 h-4"
                      resizeMode="contain"
                      tintColor={
                        paymentMethod === opt.id ? "#FE8C00" : "#878787"
                      }
                    />
                  </View>
                  <Text
                    className={cn(
                      "paragraph-medium",
                      paymentMethod === opt.id
                        ? "paragraph-bold text-dark-100"
                        : "text-gray-200",
                    )}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Resumo de valores ── */}
          <View className="border border-gray-200 rounded-2xl p-5 mb-6">
            <SectionTitle>Resumo de Valores</SectionTitle>

            <Row
              label={`Subtotal (${totalItems} ${totalItems === 1 ? "item" : "itens"})`}
              value={fmt(subtotal)}
            />
            <Row
              label="Taxa de entrega"
              value={frete === 0 ? "Grátis" : fmt(frete)}
            />

            {appliedCoupon && appliedCoupon.code !== "FRETE0" && (
              <Row
                label={`Cupom (${appliedCoupon.code})`}
                value={`- ${fmt(couponDiscount)}`}
                green
              />
            )}
            {appliedCoupon?.code === "FRETE0" && (
              <Row
                label={`Cupom (${appliedCoupon.code})`}
                value="Frete grátis"
                green
              />
            )}

            <View className="border-t border-gray-200 my-3" />

            <Row label="Total a Pagar" value={fmt(total)} bold />
          </View>

          {/* ── Botão Pedir ── */}
          <CustomButton
            title="Fazer Pedido"
            onPress={handleOrder}
            isLoading={isSubmitting}
          />
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
};

export default Checkout;
