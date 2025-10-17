import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  Animated,
  Platform,
  PanResponder,
  PanResponderInstance,
  PanResponderGestureState,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import NotificationPopup from '@/components/notificationPopup';
import {
  NotificationData,
  NotificationOptions,
} from '@/types/notification.type';

interface Notification {
  id: string;
  data: NotificationData;
  duration: number;
  open: boolean;
}

interface NotificationContextType {
  show(options: NotificationOptions): string;
  hide(id: string): void;
  hideAll(): void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

// Notification Item Component
function NotificationItem({
  id,
  data,
  duration,
  open,
  onDestroy,
}: Notification & { onDestroy: () => void }) {
  const [animation] = useState(new Animated.Value(0));
  const panResponderRef = useRef<PanResponderInstance | null>(null);
  const panResponderAnimRef = useRef<Animated.ValueXY | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dims = Dimensions.get('window');
  const onDestroyRef = useRef(onDestroy);

  // Keep onDestroy ref updated
  useEffect(() => {
    onDestroyRef.current = onDestroy;
  }, [onDestroy]);

  const handleClose = useCallback(() => {
    Animated.timing(animation, {
      toValue: 2,
      useNativeDriver: Platform.OS !== 'web',
      duration: 250,
    }).start(() => onDestroyRef.current());
  }, [animation]);

  // Show animation - only run once on mount
  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      duration: 250,
    }).start();
  }, [animation]);

  // Auto-dismiss timer - only run once on mount with initial duration
  useEffect(() => {
    if (duration !== 0 && typeof duration === 'number') {
      closeTimeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [duration, handleClose]);

  // Handle manual close
  useEffect(() => {
    if (!open) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      handleClose();
    }
  }, [open, handleClose]);

  const getPanResponderAnim = () => {
    if (!panResponderAnimRef.current) {
      panResponderAnimRef.current = new Animated.ValueXY({ x: 0, y: 0 });
    }
    return panResponderAnimRef.current;
  };

  const panReleaseToLeft = (gestureState: PanResponderGestureState) => {
    Animated.timing(getPanResponderAnim(), {
      toValue: { x: (-dims.width / 10) * 9, y: gestureState.dy },
      useNativeDriver: Platform.OS !== 'web',
      duration: 250,
    }).start(() => onDestroy());
  };

  const panReleaseToRight = (gestureState: PanResponderGestureState) => {
    Animated.timing(getPanResponderAnim(), {
      toValue: { x: (dims.width / 10) * 9, y: gestureState.dy },
      useNativeDriver: Platform.OS !== 'web',
      duration: 250,
    }).start(() => onDestroy());
  };

  const getPanResponder = () => {
    if (panResponderRef.current) return panResponderRef.current;

    const swipeThreshold = Platform.OS === 'android' ? 10 : 0;
    panResponderRef.current = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > swipeThreshold ||
        Math.abs(gestureState.dy) > swipeThreshold,
      onPanResponderMove: (_, gestureState) => {
        getPanResponderAnim()?.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          panReleaseToRight(gestureState);
        } else if (gestureState.dx < -50) {
          panReleaseToLeft(gestureState);
        } else {
          Animated.spring(getPanResponderAnim(), {
            toValue: { x: 0, y: 0 },
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        }
      },
    });
    return panResponderRef.current;
  };

  const animationStyle: any = {
    opacity: animation.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 1, 0],
    }),
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [-100, 0, 100],
        }),
      },
      getPanResponderAnim().getTranslateTransform()[0],
    ],
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      {...getPanResponder().panHandlers}
      style={animationStyle}
    >
      <NotificationPopup
        title={data.title}
        message={data.message}
        datetime={data.datetime}
        imageUrl={data.imageUrl}
      />
    </Animated.View>
  );
}

// Notification Provider Component
export function NotificationProvider({
  children,
  offsetY = 10,
}: {
  children: React.ReactNode;
  offsetY?: number;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const show = useCallback((options: NotificationOptions): string => {
    const id = options?.id || Math.random().toString();

    requestAnimationFrame(() => {
      setNotifications((prev) => [
        {
          id,
          data: options.data,
          duration: options.duration ?? 5000,
          open: true,
        },
        ...prev.filter((n) => n.open),
      ]);
    });

    return id;
  }, []);

  const hide = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, open: false } : n)),
    );
  }, []);

  const hideAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, open: false })));
  }, []);

  const contextValue = React.useMemo(
    () => ({ show, hide, hideAll }),
    [show, hide, hideAll],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
        style={[styles.container, { top: offsetY }]}
        pointerEvents="box-none"
      >
        <SafeAreaView pointerEvents="box-none">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onDestroy={() => {
                setNotifications((prev) =>
                  prev.filter((n) => n.id !== notification.id),
                );
              }}
            />
          ))}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </NotificationContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    left: 0,
    right: 0,
    zIndex: 999999,
    elevation: 999999,
    ...(Platform.OS === 'web' ? { userSelect: 'none' as any } : null),
  },
});
