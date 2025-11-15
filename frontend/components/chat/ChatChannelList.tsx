import { View, Text, Image, TouchableOpacity } from "react-native";
import { AdminChatChannel, AdminChatChannelSchema } from "@/types/chat.type";

interface ChatChannelListProps{
    chatList: AdminChatChannel[];
    chatAdminId: number|null;
    setChatAdminId: (chatAdminId: number) => void;
}

export default function ChatChannelList({chatList, chatAdminId, setChatAdminId}: ChatChannelListProps){
    return (
        <View>
            {chatList.map((chat) => (
                <TouchableOpacity 
                    key={chat.chatId} 
                    className={`h-18 flex-row gap-4 w-full p-2 hover:bg-slate-200 ${chat.chatId === chatAdminId ? 'bg-slate-200' : ''}`}
                    onPress={()=>setChatAdminId(chat.chatId)} 
                >
                    <View className="flex flex-row justify-center items-center ">
                        {chat.profileUrl ? (
                            <Image
                                source={{ uri: chat.profileUrl }}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <View  className="w-8 h-8 bg-gray-400 rounded-full"/>
                        )}
                    </View>
                    <View className="flex flex-col justify-center">
                        <Text 
                            className="w-[100px]"
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                        >
                            {chat.displayName}
                        </Text>
                        <Text>last message</Text>
                    </View>
                    <View className="ml-auto">
                        <Text>time</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    )
}