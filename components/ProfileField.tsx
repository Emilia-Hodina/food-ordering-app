import { Image, Text, View } from "react-native";

import { ProfileFieldProps } from "@/type";

const ProfileField = ({ label, value, icon }: ProfileFieldProps) => (
  <View className="profile-field">
    <View className="profile-field__icon">
      <Image
        source={icon}
        className="size-5"
        resizeMode="contain"
        tintColor="#FE8C00"
      />
    </View>

    <View className="flex-1">
      <Text className="body-regular text-gray-200">{label}</Text>
      <Text className="paragraph-semibold text-dark-100">{value}</Text>
    </View>
  </View>
);

export default ProfileField;
