import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCartStore } from "@/store/cart.store";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import CartItem from "@/components/CartItem";
import EmptyState from "@/components/EmptyState";
import PaymentSummary from "@/components/PaymentSummary";
import { getCartKey } from "@/utils/cart";

const Cart = () => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => getCartKey(item.id, item.customizations)}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={() => <CustomHeader title="Your Cart" />}
        ListEmptyComponent={() => (
          <EmptyState
            title="Your cart is empty"
            message="Add something tasty to get started."
          />
        )}
        ListFooterComponent={() =>
          totalItems > 0 ? (
            <View className="gap-5">
              <PaymentSummary
                totalItems={totalItems}
                subtotal={totalPrice}
                style="mt-6"
              />

              <CustomButton
                title="Order Now"
                onPress={() => router.push("/checkout")}
              />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default Cart;
