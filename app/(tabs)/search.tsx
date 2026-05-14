import AnimatedScreen from "@/components/AnimatedScreen";
import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import Loading from "@/components/Loading";
import MenuCard from "@/components/MenuCard";
import SeacrhBar from "@/components/SeacrhBar";
import { images } from "@/constants";
import { getCategories, getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { MenuItem } from "@/type";
import cn from "clsx";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const { category, query } = useLocalSearchParams<{
    category?: string;
    query?: string;
  }>();

  const { data, refetch, loading } = useAppwrite({
    fn: getMenu,
    params: {
      category: category || "",
      query: query || "",
      limit: 6,
    },
  });

  const { data: categories } = useAppwrite({
    fn: getCategories,
  });

  useEffect(() => {
    refetch({ category: category || "", query: query || "", limit: 6 });
  }, [category, query]);

  return (
    <SafeAreaView className="bg-white h-full">
      <AnimatedScreen>
        <View className="flex-between flex-row w-full px-5 my-5">
          <View className="flex-start">
            <Text className="small-bold uppercase text-primary">Pesquisar</Text>
            <View className="flex-start flex-row gap-x-1 mt-0.5">
              <Text className="paragraph-semibold text-dark-100">
                Encontre sua comida favorita.
              </Text>
            </View>
          </View>
          <CartButton />
        </View>

        <FlatList
          data={data}
          renderItem={({ item, index }) => {
            const isFirstRightColItem = index % 2 === 0;

            return (
              <View
                className={cn(
                  "flex-1 max-w-[48%]",
                  !isFirstRightColItem ? "mt-10" : "mt-0",
                )}
              >
                <MenuCard item={item as MenuItem} />
              </View>
            );
          }}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          columnWrapperClassName="gap-7"
          contentContainerClassName="gap-7 px-5 pb-32"
          ListHeaderComponent={() => (
            <View className="gap-5 mb-5">
              <SeacrhBar />
              <Filter categories={categories!} />
            </View>
          )}
          ListEmptyComponent={() =>
            loading ? (
              <Loading fullscreen={false} />
            ) : (
              <View className="flex-center">
                <Image
                  source={images.emptyState}
                  className="w-40 h-40"
                  resizeMode="contain"
                />
                <Text className="h3-bold">Nenhum resultado encontrado</Text>
                <Text className="mt-4 body-regular text-gray-200">
                  Tente novamente com uma pesquisa diferente.
                </Text>
              </View>
            )
          }
        />
      </AnimatedScreen>
    </SafeAreaView>
  );
};

export default Search;
