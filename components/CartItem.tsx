import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { images } from "@/constants";
import { formatPrice, getUnitPrice } from "@/utils/cart";
import QuantityStepper from "@/components/QuantityStepper";

const CartItem = ({ item }: { item: CartItemType }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  return (
    <View className="cart-item">
      <View className="flex flex-row items-center gap-x-3">
        <View className="cart-item__image">
          <Image
            source={{ uri: item.image_url }}
            className="size-4/5 rounded-lg"
            resizeMode="cover"
          />
        </View>

        <View>
          <Text className="base-bold text-dark-100">{item.name}</Text>
          <Text className="paragraph-bold text-primary mt-1">
            {formatPrice(getUnitPrice(item))}
          </Text>
          <QuantityStepper
            style="mt-2"
            value={item.quantity}
            onDecrease={() => decreaseQty(item.id, item.customizations ?? [])}
            onIncrease={() => increaseQty(item.id, item.customizations ?? [])}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => removeItem(item.id, item.customizations!)}
        className="flex-center"
      >
        <Image source={images.trash} className="size-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default CartItem;
