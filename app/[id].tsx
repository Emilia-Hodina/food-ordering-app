import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import cn from "clsx";

import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomizationCard from "@/components/CustomizationCard";
import QuantityStepper from "@/components/QuantityStepper";
import { images, sides, toppings } from "@/constants";
import { getMenuImageUrl, getMenuItem } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { useCartStore } from "@/store/cart.store";
import { CartCustomization } from "@/type";
import { formatPrice, getUnitPrice } from "@/utils/cart";

const SECTIONS = [
  { title: "Toppings", type: "topping", options: toppings },
  { title: "Side options", type: "side", options: sides },
];

const toCustomization = (
  type: string,
  { name, price }: { name: string; price: number },
): CartCustomization => ({ id: `${type}:${name}`, name, price, type });

const MenuDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: item, loading } = useAppwrite({
    fn: getMenuItem,
    params: { id },
  });
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<CartCustomization[]>([]);

  if (loading || !item) {
    return (
      <SafeAreaView className="bg-white flex-1 flex-center">
        {loading ? (
          <ActivityIndicator size="large" color="#FE8C00" />
        ) : (
          <Text className="paragraph-medium text-gray-200">Item not found</Text>
        )}
      </SafeAreaView>
    );
  }

  const {
    $id,
    name,
    price,
    image_url,
    description,
    calories,
    protein,
    rating,
  } = item;
  const imageUrl = getMenuImageUrl(image_url);
  const total = getUnitPrice({ price, customizations: selected }) * quantity;

  const stats = [
    { label: "Calories", value: `${calories} Cal` },
    { label: "Protein", value: `${protein}g` },
  ];

  const deliveryInfo = [
    { icon: images.dollar, label: "Free Delivery" },
    { icon: images.clock, label: "20 - 30 mins" },
    { icon: images.star, label: String(rating) },
  ];

  const toggle = (option: CartCustomization) =>
    setSelected((prev) =>
      prev.some((c) => c.id === option.id)
        ? prev.filter((c) => c.id !== option.id)
        : [...prev, option],
    );

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: $id,
        name,
        price,
        image_url: imageUrl,
        customizations: selected,
      });
    }
    router.back();
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView contentContainerClassName="pb-32 px-5 pt-5">
        <CustomHeader />

        <View className="flex-row">
          <View className="w-1/2 gap-y-3">
            <Text className="h1-bold text-dark-100">{name}</Text>

            <View className="flex-row items-center gap-x-1">
              {[...Array(5)].map((_, i) => (
                <Image
                  key={i}
                  source={images.star}
                  className={cn(
                    "size-4",
                    i >= Math.round(rating) && "opacity-30",
                  )}
                  resizeMode="contain"
                />
              ))}
              <Text className="body-medium text-gray-200 ml-1">{rating}/5</Text>
            </View>

            <Text className="h1-bold text-primary">{formatPrice(price)}</Text>

            <View className="flex-row gap-x-8">
              {stats.map(({ label, value }) => (
                <View key={label}>
                  <Text className="body-regular text-gray-200">{label}</Text>
                  <Text className="paragraph-semibold text-dark-100">
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="w-1/2 h-64">
            <Image
              source={{ uri: imageUrl }}
              className="size-full"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="flex-between flex-row bg-primary/10 rounded-full px-5 py-3 mt-6">
          {deliveryInfo.map(({ icon, label }) => (
            <View key={label} className="flex-center flex-row gap-x-1">
              <Image source={icon} className="size-4" resizeMode="contain" />
              <Text className="body-medium text-dark-100">{label}</Text>
            </View>
          ))}
        </View>

        <Text className="body-regular text-gray-200 mt-6 leading-6">
          {description}
        </Text>

        {SECTIONS.map(({ title, type, options }) => (
          <View key={title} className="mt-6">
            <Text className="h3-bold text-dark-100 mb-4">{title}</Text>

            <FlatList
              data={options}
              extraData={selected}
              keyExtractor={(option) => option.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: option }) => {
                const customization = toCustomization(type, option);

                return (
                  <CustomizationCard
                    name={option.name}
                    image={option.image}
                    selected={selected.some((c) => c.id === customization.id)}
                    onPress={() => toggle(customization)}
                  />
                );
              }}
            />
          </View>
        ))}
      </ScrollView>

      <View className="absolute bottom-0 inset-x-0 flex-row items-center gap-x-5 bg-white px-5 py-4 rounded-t-3xl shadow-lg shadow-black/10">
        <QuantityStepper
          value={quantity}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          onIncrease={() => setQuantity((q) => q + 1)}
        />

        <View className="flex-1">
          <CustomButton
            title={`Add to cart (${formatPrice(total)})`}
            leftIcon={
              <Image
                source={images.bag}
                className="size-5 mr-2"
                resizeMode="contain"
                tintColor="#ffffff"
              />
            }
            onPress={handleAddToCart}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MenuDetails;
