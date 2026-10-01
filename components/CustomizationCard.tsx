import { Image, Text, TouchableOpacity, View } from "react-native";
import cn from "clsx";

import { images } from "@/constants";
import { CustomizationCardProps } from "@/type";

const CustomizationCard = ({
  name,
  image,
  selected,
  onPress,
}: CustomizationCardProps) => (
  <TouchableOpacity
    className="option-card"
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View className="option-card__image">
      <Image source={image} className="size-14" resizeMode="contain" />
    </View>

    <View className="option-card__label">
      <Text className="small-bold text-white flex-1" numberOfLines={1}>
        {name}
      </Text>
      <View
        className={cn(
          "option-card__action",
          selected ? "bg-success" : "bg-error",
        )}
      >
        <Image
          source={selected ? images.check : images.plus}
          className="size-2.5"
          resizeMode="contain"
          tintColor="#ffffff"
        />
      </View>
    </View>
  </TouchableOpacity>
);

export default CustomizationCard;
