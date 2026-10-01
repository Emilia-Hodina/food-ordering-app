import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import cn from "clsx";

import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import EmptyState from "@/components/EmptyState";
import PaymentSummary from "@/components/PaymentSummary";
import SuccessModal from "@/components/SuccessModal";
import { DELIVERY_FEE, DISCOUNT } from "@/constants";
import { createOrder, createPaymentIntent } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import {
  formatPrice,
  getCartKey,
  getLinePrice,
  getOrderTotal,
  toCents,
} from "@/utils/cart";

const Checkout = () => {
  const { user } = useAuthStore();
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Only addresses the user actually filled in
  const addresses = [
    { type: "Home", address: user?.address_home },
    { type: "Work", address: user?.address_work },
  ].filter((a): a is { type: string; address: string } => Boolean(a.address));

  const selected =
    addresses.find((a) => a.type === selectedType) ?? addresses[0];

  const subtotal = getTotalPrice();
  const total = getOrderTotal(subtotal);

  const handlePay = async () => {
    if (isPaying || !user) return;

    if (!selected) {
      return Alert.alert(
        "Delivery address",
        "Please add a delivery address in your profile first.",
      );
    }

    setIsPaying(true);

    try {
      // 1. Our backend creates the PaymentIntent (secret key never leaves the server)
      const { clientSecret, paymentIntentId } = await createPaymentIntent(
        toCents(total),
      );

      // 2. Prepare Stripe's PaymentSheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Food Ordering",
        paymentIntentClientSecret: clientSecret,
        returnURL: Linking.createURL("stripe-redirect"),
      });
      if (initError) throw new Error(initError.message);

      // 3. Show it and wait for the customer
      const { error: payError } = await presentPaymentSheet();
      if (payError) {
        if (payError.code === PaymentSheetError.Canceled) return;
        throw new Error(payError.message);
      }

      // 4. Payment went through: record the order
      try {
        await createOrder({
          user_id: user.$id,
          items,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          discount: DISCOUNT,
          total,
          address: selected.address,
          payment_intent_id: paymentIntentId,
        });
      } catch {
        Alert.alert(
          "Order not saved",
          `Your payment went through, but we couldn't save the order. Keep this reference: ${paymentIntentId}`,
        );
      }

      clearCart();
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert("Payment failed", error.message);
    } finally {
      setIsPaying(false);
    }
  };

  const goToHomepage = () => {
    setShowSuccess(false);
    router.replace("/");
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView contentContainerClassName="pb-10 px-5 pt-5">
        <CustomHeader title="Checkout" />

        {items.length === 0 ? (
          <EmptyState title="Your cart is empty" />
        ) : (
          <View className="gap-6">
            <View className="gap-3">
              <Text className="h3-bold text-dark-100">Delivery address</Text>

              {addresses.length === 0 ? (
                <>
                  <Text className="body-regular text-gray-200">
                    You haven't added a delivery address yet.
                  </Text>
                  <CustomButton
                    title="Add address"
                    style="!bg-white border border-primary"
                    textStyle="!text-primary"
                    onPress={() => router.push("/edit-profile")}
                  />
                </>
              ) : (
                addresses.map(({ type, address }) => {
                  const isSelected = selected?.type === type;

                  return (
                    <TouchableOpacity
                      key={type}
                      activeOpacity={0.7}
                      onPress={() => setSelectedType(type)}
                      className={cn(
                        "p-4 rounded-2xl border",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-black/10 bg-white",
                      )}
                    >
                      <Text className="paragraph-bold text-dark-100">
                        {type}
                      </Text>
                      <Text
                        className="body-regular text-gray-200 mt-0.5"
                        numberOfLines={1}
                      >
                        {address}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            <View className="gap-2">
              <Text className="h3-bold text-dark-100 mb-1">Your order</Text>

              {items.map((item) => (
                <View
                  key={getCartKey(item.id, item.customizations)}
                  className="flex-between flex-row"
                >
                  <Text
                    className="paragraph-medium text-dark-100 flex-1 mr-3"
                    numberOfLines={1}
                  >
                    {item.quantity} x {item.name}
                  </Text>
                  <Text className="paragraph-bold text-dark-100">
                    {formatPrice(getLinePrice(item))}
                  </Text>
                </View>
              ))}
            </View>

            <PaymentSummary totalItems={getTotalItems()} subtotal={subtotal} />

            <CustomButton
              title={`Pay ${formatPrice(total)}`}
              isLoading={isPaying}
              onPress={handlePay}
            />
          </View>
        )}
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        title="Order Placed!"
        message="Your payment was successful. We'll start preparing your food right away."
        buttonTitle="Back to Home"
        onPress={goToHomepage}
      />
    </SafeAreaView>
  );
};

export default Checkout;
