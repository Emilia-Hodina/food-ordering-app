import { Image, Modal, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { SuccessModalProps } from "@/type";

const SuccessModal = ({
  visible,
  title,
  message,
  buttonTitle,
  onPress,
}: SuccessModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    statusBarTranslucent
    onRequestClose={onPress}
  >
    <View className="flex-1 justify-end bg-black/50">
      <View className="bg-white rounded-t-3xl px-5 pt-3 pb-10 items-center gap-y-4">
        <View className="w-10 h-1 rounded-full bg-black/10" />

        <Image
          source={images.success}
          className="size-36"
          resizeMode="contain"
        />

        <View className="items-center gap-y-1">
          <Text className="h3-bold text-dark-100 text-center">{title}</Text>
          <Text className="body-regular text-gray-200 text-center">
            {message}
          </Text>
        </View>

        <CustomButton title={buttonTitle} onPress={onPress} style="mt-2" />
      </View>
    </View>
  </Modal>
);

export default SuccessModal;
