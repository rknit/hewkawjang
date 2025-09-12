import { View, Text, Image } from "react-native";

export default function ProfileScreen() {
	return (
		<View>
			<Text>Profile Tab</Text>
			<Image source={require("./user_default_profile.png")} />
		</View>
	);
}
