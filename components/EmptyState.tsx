import { Image, Text, View } from "react-native";
import cn from "clsx";

import { images } from "@/constants";
import { EmptyStateProps } from "@/type";

const EmptyState = ({ title, message, style }: EmptyStateProps) => (
  <View className={cn("flex-center gap-y-2 mt-10", style)}>
    <Image
      source={images.emptyState}
      className="size-48"
      resizeMode="contain"
    />

    <Text className="h3-bold text-dark-100 text-center">{title}</Text>

    {message && (
      <Text className="body-regular text-gray-200 text-center">{message}</Text>
    )}
  </View>
);

export default EmptyState;
