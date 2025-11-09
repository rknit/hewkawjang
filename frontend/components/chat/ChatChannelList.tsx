import { View, Text } from "react-native";

interface ChatChannelCard{
    id: number;
    userId: number;
    userName: string;
}

interface ChatChannelListProps{
    chatList: ChatChannelCard[];
}

export default function ChatChannelList({chatList}: ChatChannelListProps){
    return (
        <View>
            {chatList.map((chat) => (
                <View key={chat.id} className="h-[70px] flex flex-row gap-4 w-full p-2 hover:bg-slate-300">
                    <View className="flex flex-row justify-center items-center ">
                        <View className="w-8 h-8 bg-gray-400 rounded-full" />
                    </View>
                    <View className="flex flex-col justify-center">
                        <Text>{chat.userName}</Text>
                        <Text>last message</Text>
                    </View>
                    <View className="ml-auto">
                        <Text>time</Text>
                    </View>
                </View>
            ))}
        </View>
    )
}