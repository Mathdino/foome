import { images } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";

const SeacrhBar = () => {
  const params = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(params.query || "");

  const handleSearch = (text: string) => {
    setQuery(text);
    router.setParams({ query: text });
  };
  return (
    <View className="searchbar">
      <TextInput
        className="flex-1 p-5"
        placeholder="Pesquise por pizzas, hambúrgueres..."
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor="#a0a0a0"
      />
      <TouchableOpacity
        className="pr-5"
        onPress={() => console.log("PESQUISA ATIVA")}
      >
        <Image
          source={images.search}
          className="size-6"
          resizeMode="contain"
          tintColor="#5D5F6D"
        />
      </TouchableOpacity>
    </View>
  );
};

export default SeacrhBar;
