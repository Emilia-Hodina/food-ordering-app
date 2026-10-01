import { Image, Text, TouchableOpacity, View } from "react-native";
import cn from "clsx";

import { images } from "@/constants";
import { QuantityStepperProps } from "@/type";

const QuantityStepper = ({
  value,
  onIncrease,
  onDecrease,
  style,
}: QuantityStepperProps) => (
  <View className={cn("flex flex-row items-center gap-x-4", style)}>
    <TouchableOpacity onPress={onDecrease} className="cart-item__actions">
      <Image
        source={images.minus}
        className="size-1/2"
        resizeMode="contain"
        tintColor="#FE8C00"
      />
    </TouchableOpacity>

    <Text className="base-bold text-dark-100">{value}</Text>

    <TouchableOpacity onPress={onIncrease} className="cart-item__actions">
      <Image
        source={images.plus}
        className="size-1/2"
        resizeMode="contain"
        tintColor="#FE8C00"
      />
    </TouchableOpacity>
  </View>
);

export default QuantityStepper;
