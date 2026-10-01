import { images } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";

const Searchbar = () => {
  const params = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(params.query ?? "");

  // 1. Sincronizează inputul dacă parametrul din URL se schimbă din exterior
  useEffect(() => {
    setQuery(params.query ?? "");
  }, [params.query]);

  // 2. Debounce automat: la 500ms după ce utilizatorul se oprește din tastat, actualizăm parametrul
  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanQuery = query.trim();

      // Actualizăm doar dacă valoarea este diferită de ce avem deja în URL
      if (cleanQuery !== (params.query ?? "")) {
        router.setParams({ query: cleanQuery || "" });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    router.setParams({ query: "" });
  };

  const handleSubmit = () => {
    router.setParams({ query: query.trim() || "" });
  };

  return (
    <View className="searchbar">
      <TextInput
        className="flex-1 p-4 text-dark-100 font-quicksand-medium"
        placeholder="Search for pizzas, burgers..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSubmit}
        placeholderTextColor="#A0A0A0"
        returnKeyType="search"
      />
      <TouchableOpacity
        className="pr-4"
        onPress={handleSubmit}
        activeOpacity={0.7}
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

export default Searchbar;
