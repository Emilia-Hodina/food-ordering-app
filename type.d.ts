import { Models } from "react-native-appwrite";
import type { ImageSourcePropType } from "react-native";

export interface MenuItem extends Models.Document {
  name: string;
  price: number;
  image_url: string;
  description: string;
  calories: number;
  protein: number;
  rating: number;
  type: string;
}

export interface Category extends Models.Document {
  name: string;
  description: string;
}

export interface User extends Models.Document {
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  address_home?: string;
  address_work?: string;
}

export interface CartCustomization {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface CartItemType {
  id: string; // menu item id
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  customizations?: CartCustomization[];
}

export interface CartStore {
  items: CartItemType[];
  addItem: (item: Omit<CartItemType, "quantity">) => void;
  removeItem: (id: string, customizations: CartCustomization[]) => void;
  increaseQty: (id: string, customizations: CartCustomization[]) => void;
  decreaseQty: (id: string, customizations: CartCustomization[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export interface TabBarIconProps {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}

export interface PaymentInfoStripeProps {
  label: string;
  value: string;
  labelStyle?: string;
  valueStyle?: string;
}

export interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  leftIcon?: React.ReactNode;
  textStyle?: string;
  isLoading?: boolean;
}

export interface CustomHeaderProps {
  title?: string;
}

export interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

export interface ProfileFieldProps {
  label: string;
  value: string;
  icon: ImageSourcePropType;
}

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface GetMenuParams {
  category?: string;
  query?: string;
  limit?: number;
}

export interface QuantityStepperProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  style?: string;
}

export interface CustomizationCardProps {
  name: string;
  image: ImageSourcePropType;
  selected: boolean;
  onPress: () => void;
}

export interface UpdateUserParams {
  name?: string;
  phone?: string;
  avatar?: string;
  address_home?: string;
  address_work?: string;
}

export interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonTitle: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  title: string;
  message?: string;
  style?: string;
}

export interface FilterProps {
  categories: Category[];
  activeCategory?: string;
}

export interface CreateOrderParams {
  user_id: string;
  items: CartItemType[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  address: string;
  payment_intent_id: string;
}

export interface PaymentSummaryProps {
  totalItems: number;
  subtotal: number;
  style?: string;
}
