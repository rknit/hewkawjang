import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { fetchReportedMessages, handleMessageReport } from '@/apis/admin.api';
import { normalizeError } from '@/utils/api-error';

interface MessageReport {
  id: number;
  reportType: string;
  isSolved: boolean;
  createdAt: string;
  messageText: string;
  messageImageUrl?: string;
  reporterImage: string;
}

export default function MessagesAdminPage() {
  const [reportedMessages, setReportedMessages] = useState<MessageReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadReportedMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const messages = await fetchReportedMessages(false, 1, 10);
      const transformedMessages = messages.map((msg: any) => ({
        id: msg.id,
        reportType: msg.reportType,
        isSolved: msg.isSolved,
        createdAt: msg.createdAt,
        messageText: msg.messageText || 'No message text available',
        messageImageUrl: msg.messageImageUrl,
        reporterImage:
          msg.reporterImage ||
          'https://uhrpfnyjcvpwoaioviih.supabase.co/storage/v1/object/public/profile-images/default/default_profile.png',
      }));
      setReportedMessages(transformedMessages);
    } catch (error) {
      setError('Failed to fetch reported messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportedMessages();
  }, []);

  const handleRejectMessage = async (id: number) => {
    try {
      await handleMessageReport(id, false);
      alert(`Message report ${id} rejected`);
      loadReportedMessages();
    } catch (error) {
      normalizeError(error);
      alert('Failed to reject the message report');
    }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      await handleMessageReport(id, true);
      alert(`Message ${id} deleted`);
      loadReportedMessages();
    } catch (error) {
      normalizeError(error);
      alert('Failed to delete the message');
    }
  };

  const renderMessageItem = ({ item }: { item: MessageReport }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.reporterImage }}
          style={styles.profileImage}
        />
        {/* Reporter name removed */}
      </View>
      <View style={styles.cardTopRight}>
        <Text style={styles.reportDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.messageText}>{item.messageText}</Text>
        {item.messageImageUrl && (
          <Image
            source={{ uri: item.messageImageUrl }}
            style={styles.messageImage}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <TouchableOpacity
            onPress={() => handleDeleteMessage(item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.button}>
          <TouchableOpacity
            onPress={() => handleRejectMessage(item.id)}
            style={styles.rejectButton}
          >
            <Text style={[styles.buttonText, styles.rejectText]}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reported Messages</Text>
      <FlatList
        data={reportedMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    marginRight: 30,
    marginLeft: 30,
    paddingBottom: 70,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  cardHeaderText: {
    justifyContent: 'center',
  },
  reporterName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  reportDate: {
    fontSize: 12,
    color: '#888',
  },
  cardBody: {
    marginBottom: 12,
    marginLeft: 70,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  messageImage: {
    width: 120,
    height: 120,
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  button: {
    marginBottom: 10,
    width: 120,
  },
  deleteButton: {
    backgroundColor: '#E05910',
    color: 'white',
    borderRadius: 5,
    padding: 10,
  },
  rejectButton: {
    backgroundColor: 'white',
    color: '#E05910',
    textDecorationLine: 'underline',
    padding: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffffff',
  },
  rejectText: {
    color: '#5f5f5f',
    textDecorationLine: 'underline',
  },
});
