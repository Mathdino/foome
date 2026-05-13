import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { TabBarIconProps } from "@/type";
import cn from "clsx";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

type TabBarIconWithBadgeProps = TabBarIconProps & { badgeCount?: number };

const TabBarIcon = ({
  focused,
  icon,
  title,
  badgeCount,
}: TabBarIconWithBadgeProps) => {
  return (
    <View className="tab-icon">
      <View className="relative">
        <Image
          source={icon}
          className="size-7"
          resizeMode="contain"
          tintColor={focused ? "#FE8C00" : "#5D5F6D"}
        />
        {!!badgeCount && badgeCount > 0 && (
          <View className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary items-center justify-center border border-white">
            <Text className="text-white text-[10px] font-bold">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Text>
          </View>
        )}
      </View>
      <Text
        className={cn(
          "text-sm font-bold",
          focused ? "text-primary" : "text-gray-200",
        )}
      >
        {title}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  const totalItems = useCartStore((state) => state.getTotalItems());

  if (!isAuthenticated) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        animation: "shift",
        tabBarStyle: {
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          marginHorizontal: 20,
          height: 80,
          position: "absolute",
          bottom: 40,
          backgroundColor: "white",
          shadowColor: "#1a1a1a",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={images.home} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={images.search} title="Buscar" />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Carrinho",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={images.bag}
              title="Carrinho"
              badgeCount={totalItems}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={images.person} title="Perfil" />
          ),
        }}
      />
    </Tabs>
  );
}
