import { FlatList, Platform, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import cn from "clsx";

import { FilterProps } from "@/type";

const ALL = { $id: "all", name: "All" };

const Filter = ({ categories, activeCategory = "all" }: FilterProps) => {
  const handlePress = (id: string) =>
    router.setParams({ category: id === "all" ? undefined : id });

  const filterData = [ALL, ...categories];

  return (
    <FlatList
      data={filterData}
      extraData={activeCategory}
      keyExtractor={(item) => item.$id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-x-2 pb-3"
      renderItem={({ item }) => {
        const isActive = activeCategory === item.$id;

        return (
          <TouchableOpacity
            className={cn("filter", isActive ? "bg-primary" : "bg-white")}
            style={
              Platform.OS === "android"
                ? { elevation: 5, shadowColor: "#878787" }
                : {}
            }
            onPress={() => handlePress(item.$id)}
          >
            <Text
              className={cn(
                "body-medium",
                isActive ? "text-white" : "text-gray-200",
              )}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default Filter;
