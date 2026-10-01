import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import cn from "clsx";

import CartButton from "@/components/CartButton";
import EmptyState from "@/components/EmptyState";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import { getCategories, getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";

const Search = () => {
  const { category, query } = useLocalSearchParams<{
    query?: string;
    category?: string;
  }>();

  // Never send empty strings or the "all" chip to Appwrite
  const cleanCategory =
    category && category.trim() !== "" && category.toLowerCase() !== "all"
      ? category.trim()
      : undefined;

  const cleanQuery = query && query.trim() !== "" ? query.trim() : undefined;

  const params = { category: cleanCategory, query: cleanQuery, limit: 6 };

  const { data, loading, refetch } = useAppwrite({ fn: getMenu, params });
  const { data: categories } = useAppwrite({ fn: getCategories });

  // Skip the first run: useAppwrite already fetches on mount
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    refetch(params);
  }, [category, query]);

  return (
    <SafeAreaView className="bg-white flex-1">
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperClassName={data && data.length > 0 ? "gap-7" : undefined}
        contentContainerClassName="px-5 pb-32 grow"
        ListHeaderComponent={() => (
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full items-center">
              <View className="flex-start">
                <Text className="small-bold uppercase text-primary">
                  Search
                </Text>
                <View className="flex-start flex-row gap-x-1 mt-0.5">
                  <Text className="paragraph-semibold text-dark-100">
                    Find your favorite food
                  </Text>
                </View>
              </View>

              <CartButton />
            </View>

            <SearchBar />

            <Filter
              categories={categories ?? []}
              activeCategory={cleanCategory}
            />
          </View>
        )}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;

          return (
            <View
              className={cn(
                "flex-1 max-w-[48%]",
                !isFirstRightColItem ? "mt-10" : "mt-0",
              )}
            >
              <MenuCard item={item} />
            </View>
          );
        }}
        ListEmptyComponent={() =>
          loading ? (
            <View className="mt-10 items-center justify-center">
              <ActivityIndicator size="large" color="#FE8C00" />
            </View>
          ) : (
            <EmptyState
              title="Nothing matched your search"
              message="Try a different search term or check for typos."
            />
          )
        }
      />
    </SafeAreaView>
  );
};

export default Search;
