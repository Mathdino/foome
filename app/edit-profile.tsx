import AnimatedScreen from "@/components/AnimatedScreen";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import Custominput from "@/components/Custominput";
import { updateUserProfile } from "@/lib/appwrite";
import { formatPhone } from "@/lib/masks";
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

const EditProfile = () => {
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(formatPhone(user?.phones ?? ""));
  const [addresses, setAddresses] = useState<string[]>(
    user?.addresses && user.addresses.length > 0 ? user.addresses : [""],
  );

  const updateAddress = (index: number, value: string) => {
    setAddresses((prev) => prev.map((a, i) => (i === index ? value : a)));
  };

  const removeAddress = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const addAddress = () => {
    setAddresses((prev) => [...prev, ""]);
  };

  const submit = async () => {
    if (!user) return;
    if (!name.trim()) {
      return Alert.alert("Erro", "Nome é obrigatório");
    }

    const trimmedPhone = phone.trim();
    const cleanedAddresses = addresses.map((a) => a.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      const updated = await updateUserProfile({
        userId: user.$id,
        name: name.trim(),
        phones: trimmedPhone,
        addresses: cleanedAddresses,
      });

      setUser({ ...user, ...(updated as any) });
      Alert.alert("Sucesso", "Perfil atualizado");
      router.back();
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <AnimatedScreen>
        <ScrollView contentContainerClassName="pb-28 px-5 pt-5">
          <CustomHeader title="Editar Perfil" />

          <View className="gap-6 mt-4">
            <Custominput
              label="Nome Completo"
              placeholder="Digite seu nome"
              value={name}
              onChangeText={setName}
            />

            <Custominput
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={phone}
              onChangeText={(t) => setPhone(formatPhone(t))}
              keyboardType="phone-pad"
            />

            <View className="gap-4">
              {addresses.map((addr, i) => (
                <View key={i} className="flex-row items-end gap-2">
                  <View className="flex-1">
                    <Custominput
                      label={`Endereço ${i + 1}`}
                      placeholder="Rua, número, cidade"
                      value={addr}
                      onChangeText={(t) => updateAddress(i, t)}
                    />
                  </View>
                  {addresses.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeAddress(i)}
                      className="h-12 w-12 rounded-xl bg-red-50 border border-red-200 items-center justify-center"
                    >
                      <Image
                        source={require("@/assets/icons/trash.png")}
                        className="w-5 h-5"
                        resizeMode="contain"
                        tintColor="#EF4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity
                onPress={addAddress}
                className="flex-row items-center justify-center gap-2 py-3 border border-dashed border-primary rounded-xl"
              >
                <Image
                  source={require("@/assets/icons/plus.png")}
                  className="w-4 h-4"
                  resizeMode="contain"
                  tintColor="#FE8C00"
                />
                <Text className="text-primary paragraph-semibold">
                  Adicionar endereço
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-8 gap-4 w-full flex justify-center items-center flex-col">
            <CustomButton
              title="Salvar"
              onPress={submit}
              isLoading={isSubmitting}
            />
            <CustomButton
              title="Cancelar"
              onPress={() => router.back()}
              style="bg-red-500"
              textStyle="!text-white"
            />
          </View>
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
};

export default EditProfile;
