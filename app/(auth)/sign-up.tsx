import CustomButton from "@/components/CustomButton";
import Custominput from "@/components/Custominput";
import { createUser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const submit = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password)
      return Alert.alert(
        "Erro",
        "Por favor, preencha um e-mail ou senha válida",
      );

    setIsSubmitting(true);

    try {
      await createUser({
        name,
        email,
        password,
      });

      router.replace("/");
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <Custominput
        placeholder="Digite seu nome completo"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        label="Nome Completo"
      />

      <Custominput
        placeholder="Digite seu e-mail"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="E-mail"
        keyboardType="email-address"
      />

      <Custominput
        placeholder="Digite sua senha"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        label="Senha"
        secureTextEntry={true}
      />
      <CustomButton
        title="Cadastrar"
        onPress={submit}
        isLoading={isSubmitting}
      />

      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">Já tem conta?</Text>
        <Link href="/sign-in" className="base-bold text-primary">
          Entre agora
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
