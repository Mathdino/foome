import AnimatedScreen from "@/components/AnimatedScreen";
import CustomHeaderButton from "@/components/CustomHeaderButton";
import Loading from "@/components/Loading";
import { images } from "@/constants";
import { appWriteConfig, getMenuById } from "@/lib/appwrite";
import { getCustomizationImage } from "@/lib/customizationImages";
import { useCartStore } from "@/store/cart.store";
import { CartCustomization } from "@/type";
import cn from "clsx";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Customization = {
  $id: string;
  name: string;
  price: number;
  type: string;
};

type MenuDoc = {
  $id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  categories?: { name?: string } | string;
  category?: { name?: string } | null;
};

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

const Pill = ({
  icon,
  text,
  iconTint,
}: {
  icon: any;
  text: string;
  iconTint?: string;
}) => (
  <View className="flex-row items-center gap-1">
    <Image
      source={icon}
      className="w-4 h-4"
      resizeMode="contain"
      tintColor={iconTint}
    />
    <Text className="small-bold text-dark-100">{text}</Text>
  </View>
);

const CustomizationCard = ({
  item,
  selected,
  onToggle,
}: {
  item: Customization;
  selected: boolean;
  onToggle: () => void;
}) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.85}
    className={cn(
      "w-32 mr-3 rounded-2xl items-center pt-4",
      selected ? "bg-primary/10" : "bg-white",
    )}
    style={
      selected
        ? { borderWidth: 1.5, borderColor: "#FE8C00" }
        : {
            elevation: 4,
            shadowColor: "#878787",
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }
    }
  >
    <Image
      source={getCustomizationImage(item.name)}
      className="w-20 h-20"
      resizeMode="contain"
    />
    <View
      className={cn(
        "w-full justify-between rounded-b-2xl px-2 py-2 mt-2",
        selected ? "bg-primary" : "bg-dark-100",
      )}
    >
      <View className="flex-row items-center">
        <Text className="text-white small-bold flex-1" numberOfLines={2}>
          {item.name}
        </Text>

        <View
          className={cn(
            "w-6 h-6 rounded-full items-center justify-center ml-1",
            selected ? "bg-white" : "bg-primary",
          )}
        >
          <Image
            source={selected ? images.check : images.plus}
            className="w-3 h-3"
            resizeMode="contain"
            tintColor={selected ? "#FE8C00" : "#FFFFFF"}
          />
        </View>
      </View>
      <Text className="text-white small-bold" numberOfLines={1}>
        +{formatPrice(item.price)}
      </Text>
    </View>
  </TouchableOpacity>
);

const MenuDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<MenuDoc | null>(null);
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [selected, setSelected] = useState<CartCustomization[]>([]);
  const [qty, setQty] = useState(1);

  const scrollRef = useRef<ScrollView>(null);
  const toastOpacity = useSharedValue(0);
  const toastTranslate = useSharedValue(-30);
  const btnScale = useSharedValue(1);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastTranslate.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getMenuById(id);
        setMenu(res.menu as any);
        setCustomizations(res.customizations as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !menu) {
    return (
      <SafeAreaView className="bg-white h-full">
        <Loading />
      </SafeAreaView>
    );
  }

  const imageUrl = `${menu.image_url}?project=${appWriteConfig.projectId}`;
  const toppings = customizations.filter((c) => c.type === "topping");
  const sides = customizations.filter((c) => c.type === "side");
  const categoryName =
    menu.category?.name ??
    (typeof menu.categories === "object" ? menu.categories?.name : undefined);

  const extras = selected.reduce((sum, c) => sum + c.price, 0);
  const total = (menu.price + extras) * qty;

  const toggleCustomization = (c: Customization) => {
    setSelected((prev) =>
      prev.some((p) => p.id === c.$id)
        ? prev.filter((p) => p.id !== c.$id)
        : [...prev, { id: c.$id, name: c.name, price: c.price, type: c.type }],
    );
  };

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: menu.$id,
        name: menu.name,
        price: menu.price,
        image_url: imageUrl,
        customizations: selected,
      });
    }

    scrollRef.current?.scrollTo({ y: 0, animated: true });

    btnScale.value = withSequence(
      withTiming(0.94, { duration: 100 }),
      withSpring(1, { damping: 6, stiffness: 200 }),
    );

    toastOpacity.value = withSequence(
      withTiming(1, { duration: 220 }),
      withDelay(1400, withTiming(0, { duration: 300 })),
    );
    toastTranslate.value = withSequence(
      withTiming(0, { duration: 220 }),
      withDelay(1400, withTiming(-30, { duration: 300 })),
    );
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <AnimatedScreen>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 16,
              left: 20,
              right: 20,
              zIndex: 50,
            },
            toastStyle,
          ]}
        >
          <View
            className="flex-row items-center gap-2 bg-success rounded-full px-4 py-3"
            style={{
              elevation: 6,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
              <Image
                source={images.check}
                className="w-3.5 h-3.5"
                resizeMode="contain"
                tintColor="#2F9B65"
              />
            </View>
            <Text className="paragraph-bold text-white flex-1">
              Adicionado ao carrinho!
            </Text>
          </View>
        </Animated.View>

        <ScrollView ref={scrollRef} contentContainerClassName="pb-40 px-5 pt-5">
          <CustomHeaderButton title={menu.name} />

          <View className="relative mt-4 min-h-[260px]">
            <Image
              source={{ uri: imageUrl }}
              style={{
                position: "absolute",
                width: 320,
                height: 320,
                top: -20,
                right: -120,
              }}
              resizeMode="contain"
            />
            <View className="w-1/2 pr-3">
              <Text className="h3-bold text-dark-100" numberOfLines={2}>
                {menu.name}
              </Text>
              {!!categoryName && (
                <Text className="py-1 small-regular text-gray-200">
                  {categoryName}
                </Text>
              )}

              <View className="flex-row items-center mt-2 gap-1 flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Image
                    key={i}
                    source={images.star}
                    className="w-4 h-4"
                    resizeMode="contain"
                    tintColor={
                      i < Math.round(menu.rating) ? "#FE8C00" : "#E0E0E0"
                    }
                  />
                ))}
                <Text className="small-bold text-dark-100 ml-1">
                  {menu.rating?.toFixed(1)}/5
                </Text>
              </View>

              <Text className="h3-bold text-primary mt-3">
                {formatPrice(menu.price)}
              </Text>

              <View className="flex-row gap-6 mt-4">
                <View>
                  <Text className="small-regular text-gray-200">Calorias</Text>
                  <Text className="paragraph-semibold text-dark-100">
                    {menu.calories} Cal
                  </Text>
                </View>
                <View>
                  <Text className="small-regular text-gray-200">Proteína</Text>
                  <Text className="paragraph-semibold text-dark-100">
                    {menu.protein}g
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="bg-primary/10 rounded-2xl flex-row justify-between items-center px-4 py-3 mt-6">
            <Pill icon={images.moto} text="Entrega Grátis" iconTint="#FE8C00" />
            <Pill icon={images.clock} text="20 - 30 min" iconTint="#FE8C00" />
            <Pill
              icon={images.star}
              text={menu.rating?.toFixed(1)}
              iconTint="#FE8C00"
            />
          </View>

          <Text className="body-regular text-gray-200 mt-4">
            {menu.description}
          </Text>

          {toppings.length > 0 && (
            <View className="mt-6">
              <Text className="paragraph-bold text-dark-100 mb-3">
                Adicionais
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {toppings.map((t) => (
                  <CustomizationCard
                    key={t.$id}
                    item={t}
                    selected={selected.some((s) => s.id === t.$id)}
                    onToggle={() => toggleCustomization(t)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {sides.length > 0 && (
            <View className="mt-6">
              <Text className="paragraph-bold text-dark-100 mb-3">
                Acompanhamentos
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sides.map((s) => (
                  <CustomizationCard
                    key={s.$id}
                    item={s}
                    selected={selected.some((p) => p.id === s.$id)}
                    onToggle={() => toggleCustomization(s)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {selected.length > 0 && (
            <View className="mt-5 bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <Text className="paragraph-bold text-dark-100 mb-2">
                Selecionados
              </Text>
              {selected.map((c) => (
                <View
                  key={c.id}
                  className="flex-row justify-between items-center py-1"
                >
                  <Text className="body-medium text-dark-100">+ {c.name}</Text>
                  <Text className="body-medium text-primary">
                    +{formatPrice(c.price)}
                  </Text>
                </View>
              ))}
              <View className="border-t border-primary/20 mt-2 pt-2 flex-row justify-between">
                <Text className="paragraph-bold text-dark-100">Extras</Text>
                <Text className="paragraph-bold text-primary">
                  +{formatPrice(extras)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 flex-row items-center gap-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <Image
                source={images.minus}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="paragraph-bold text-dark-100">{qty}</Text>
            <TouchableOpacity
              onPress={() => setQty((q) => q + 1)}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <Image
                source={images.plus}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <Animated.View style={[{ flex: 1 }, btnStyle]}>
            <TouchableOpacity
              onPress={handleAddToCart}
              className="bg-primary rounded-full py-3 items-center justify-center flex-row gap-2"
            >
              <Image
                source={images.bag}
                className="w-4 h-4"
                resizeMode="contain"
                tintColor="#FFFFFF"
              />
              <Text className="paragraph-bold text-white">
                Adicionar ({formatPrice(total)})
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  );
};

export default MenuDetails;
