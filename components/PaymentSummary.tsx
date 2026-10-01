import { Text, View } from "react-native";
import cn from "clsx";

import { DELIVERY_FEE, DISCOUNT } from "@/constants";
import { PaymentInfoStripeProps, PaymentSummaryProps } from "@/type";
import { formatPrice, getOrderTotal } from "@/utils/cart";

const PaymentInfoStripe = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

const PaymentSummary = ({
  totalItems,
  subtotal,
  style,
}: PaymentSummaryProps) => (
  <View className={cn("border border-gray-200 p-5 rounded-2xl", style)}>
    <Text className="h3-bold text-dark-100 mb-5">Payment Summary</Text>

    <PaymentInfoStripe
      label={`Total Items (${totalItems})`}
      value={formatPrice(subtotal)}
    />
    <PaymentInfoStripe label="Delivery Fee" value={formatPrice(DELIVERY_FEE)} />
    <PaymentInfoStripe
      label="Discount"
      value={`- ${formatPrice(DISCOUNT)}`}
      valueStyle="!text-success"
    />
    <View className="border-t border-gray-300 my-2" />
    <PaymentInfoStripe
      label="Total"
      value={formatPrice(getOrderTotal(subtotal))}
      labelStyle="base-bold !text-dark-100"
      valueStyle="base-bold !text-dark-100 !text-right"
    />
  </View>
);

export default PaymentSummary;
