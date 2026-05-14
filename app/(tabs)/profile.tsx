import AnimatedScreen from "@/components/AnimatedScreen";
import CustomButton from "@/components/CustomButton";
import CustomHeaderButton from "@/components/CustomHeaderButton";
import Loading from "@/components/Loading";
import { images } from "@/constants";
import { signOut } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
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

type InfoRowProps = {
  icon: any;
  label: string;
  value?: string;
  placeholder?: string;
};

const InfoRow = ({ icon, label, value, placeholder }: InfoRowProps) => (
  <View className="flex-row items-center gap-4 py-3">
    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
      <Image
        source={icon}
        className="w-5 h-5"
        resizeMode="contain"
        tintColor="#FE8C00"
      />
    </View>
    <View className="flex-1">
      <Text className="text-gray-500 small-regular">{label}</Text>
      <Text
        className={
          value
            ? "paragraph-semibold text-dark-100"
            : "paragraph-semibold text-gray-400 italic"
        }
      >
        {value || placeholder || "Não cadastrado"}
      </Text>
    </View>
  </View>
);

const Profile = () => {
  const { user, setUser, setIsAuthenticated, isLoading } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isLoading || !user) {
    return (
      <SafeAreaView className="bg-white h-full">
        <Loading />
      </SafeAreaView>
    );
  }

  const handleSignOut = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            setIsSigningOut(true);
            await signOut();
            setUser(null);
            setIsAuthenticated(false);
            router.replace("/sign-in");
          } catch (e: any) {
            Alert.alert("Erro", e.message);
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <AnimatedScreen>
        <ScrollView contentContainerClassName="pb-28 px-5 pt-5">
          <CustomHeaderButton title="Perfil" />

          <View className="items-center mb-2">
            <View className="relative">
              <Image
                source={user?.avatar ? { uri: user.avatar } : images.avatar}
                className="w-28 h-28 rounded-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => router.push("/edit-profile")}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-white"
              >
                <Image
                  source={images.pencil}
                  className="w-4 h-4"
                  resizeMode="contain"
                  tintColor="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-2">
            <InfoRow
              icon={images.user}
              label="Nome completo"
              value={user?.name}
            />
            <View className="h-px bg-gray-100/10" />
            <InfoRow icon={images.envelope} label="Email" value={user?.email} />
            <View className="h-px bg-gray-100/10" />
            <InfoRow
              icon={images.phone}
              label="Telefone"
              value={user?.phones}
              placeholder="Cadastre seu telefone"
            />
            {(user?.addresses && user.addresses.length > 0
              ? user.addresses
              : [undefined]
            ).map((addr, i) => (
              <View key={`addr-${i}`}>
                <View className="h-px bg-gray-100/10" />
                <InfoRow
                  icon={images.location}
                  label={`Endereço ${i + 1}`}
                  value={addr}
                  placeholder="Cadastre um endereço"
                />
              </View>
            ))}
          </View>

          <View className="mt-6 gap-4 w-full flex justify-center items-center flex-col">
            <CustomButton
              title="Editar Perfil"
              onPress={() => router.push("/edit-profile")}
            />
            <CustomButton
              title="Sair"
              onPress={handleSignOut}
              isLoading={isSigningOut}
              style="bg-red-50 border border-red-200"
              textStyle="!text-red-500"
              leftIcon={
                <Image
                  source={images.logout}
                  className="w-5 h-5 mr-2"
                  resizeMode="contain"
                  tintColor="#EF4444"
                />
              }
            />
          </View>
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
};

export default Profile;
