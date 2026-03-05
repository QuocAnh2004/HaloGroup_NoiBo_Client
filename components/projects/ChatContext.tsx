import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authFetch } from "@/api/config";
import type { ChatMessage, AuthenticatedUser } from "@/types";
import { io, Socket } from "socket.io-client";

type ChatUser = {
  userId: string;
  user: string;
  avatar: string;
  name?: string;
};

type UiMessage = {
  message_id: number;
  text: string;
  img?: string;
  created_at?: string;
  sender_id?: string;
  receiver_id?: string;
};

type ChatContextValue = {
  chatUsers: ChatUser[];
  activeUserId: string | null;
  setActiveUserId: (id: string) => void;

  messages: UiMessage[];
  isLoading: boolean;
  error: string | null;

  refreshConversation: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function getMyId(): string | null {
  try {
    const savedUser = localStorage.getItem("hola_user");
    if (!savedUser) return null;
    const user: AuthenticatedUser = JSON.parse(savedUser);
    return String(user.id);
  } catch {
    return null;
  }
}

function mapDbToUiMessages(dbMessages: ChatMessage[]): UiMessage[] {
  if (!Array.isArray(dbMessages)) return [];
  return dbMessages.map((m) => ({
    message_id: m.message_id,
    text: m.content,
    created_at: m.created_at ? String(m.created_at) : undefined,
    sender_id: String((m as any).sender_id?.id ?? (m as any).sender_id ?? ""),
    receiver_id: String(
      (m as any).receiver_id?.id ?? (m as any).receiver_id ?? "",
    ),
  }));
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const activeUser = useMemo(
    () => chatUsers.find((u) => u.userId === activeUserId),
    [chatUsers, activeUserId],
  );

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnectedRef = useRef(false);
  const activeUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeUserIdRef.current = activeUserId;
  }, [activeUserId]);

  // ─── Load danh sách user đã chat ───────────────────────────────────────────
  useEffect(() => {
    const fetchChatUsers = async () => {
      setIsLoadingUsers(true);
      setUsersError(null);

      try {
        const chatIds: { userId: string }[] = await authFetch(
          "/messages/chat-users",
        );
        const ids = chatIds.map((u) => String(u.userId));

        if (ids.length === 0) {
          setChatUsers([]);
          setActiveUserId(null);
          return;
        }

        const users: any[] = await authFetch("/messages/users/by-ids", {
          method: "POST",
          body: JSON.stringify({ ids }),
        });

        const mapped: ChatUser[] = users.map((u) => ({
          userId: String(u.userId),
          user: u.name,
          name: u.name,
          avatar: u.avatar || "/chat_page/assets/images/users/user-default.png",
        }));

        setChatUsers(mapped);
        setActiveUserId((prev) => prev ?? mapped[0]?.userId ?? null);
      } catch (e: any) {
        console.error("❌ Load chat users failed:", e);
        setUsersError(e?.message || "Không tải được danh sách chat");
        setChatUsers([]);
        setActiveUserId(null);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchChatUsers();
  }, []);

  // ─── Khởi tạo Socket.io (1 lần duy nhất) ──────────────────────────────────
  useEffect(() => {
    const myId = getMyId();
    if (!myId) return;

    const socket = io("http://localhost:3001", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket.io connected");
      isConnectedRef.current = true;

      socket.emit("join_private", myId);

      if (activeUserIdRef.current) {
        const pairId = [String(myId), String(activeUserIdRef.current)]
          .sort()
          .join("-");
        socket.emit("join_chat", pairId);
      }
    });

    // ✅ FIX: Normalize message — server trả về `payload.text` (đã map từ FE sendMessage)
    // Nhưng cũng cần handle trường hợp server gửi qua sendToPublicByUsers với field `content`
    socket.on("receive_message", (msg: any) => {
      const myIdStr = String(myId);
      const sid = String(msg?.sender_id?.id ?? msg?.sender_id ?? "");
      const rid = String(msg?.receiver_id?.id ?? msg?.receiver_id ?? "");
      const otherUserId = sid === myIdStr ? rid : sid;

      if (
        !activeUserIdRef.current ||
        String(activeUserIdRef.current) !== otherUserId
      ) {
        return;
      }

      setMessages((prev) => {
        // Deduplicate theo message_id
        if (
          msg?.message_id &&
          prev.some((m) => m.message_id === msg.message_id)
        ) {
          return prev;
        }
        return [
          ...prev,
          {
            message_id: Number(msg.message_id),
            // ✅ FIX: đọc cả `text` lẫn `content` để tương thích 2 luồng
            text: String(msg.text ?? msg.content ?? ""),
            created_at: msg.created_at ? String(msg.created_at) : undefined,
            sender_id: sid,
            receiver_id: rid,
          },
        ];
      });
    });

    socket.on("notify", (data: any) => {
      console.log("🔔 New notification:", data);
    });

    socket.on("disconnect", (reason: string) => {
      console.warn("⚠️ Socket disconnected:", reason);
      isConnectedRef.current = false;
    });

    socket.on("connect_error", (err: Error) => {
      console.error("❌ Socket error:", err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
      console.log("🔌 Socket disconnected (cleanup)");
    };
  }, []); // Chạy 1 lần duy nhất khi mount

  // ─── Join room khi đổi activeUserId ───────────────────────────────────────
  useEffect(() => {
    activeUserIdRef.current = activeUserId;
    const myId = getMyId();
    const socket = socketRef.current;

    if (socket?.connected && myId && activeUserId) {
      const pairId = [String(myId), String(activeUserId)].sort().join("-");
      socket.emit("join_chat", pairId);
      console.log("🔄 Switched to room:", pairId);
    }
  }, [activeUserId]);

  // ─── Load conversation khi đổi activeUserId ───────────────────────────────
  const refreshConversation = async () => {
    if (!activeUserId) return;

    const myId = getMyId();
    if (!myId) {
      setError("Chưa đăng nhập (không tìm thấy hola_user)");
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dbMessages: ChatMessage[] = await authFetch(
        `/messages/conversation/${activeUserId}`,
      );
      setMessages(mapDbToUiMessages(dbMessages));
    } catch (e: any) {
      setError(e?.message || "Không tải được tin nhắn");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId]);

  // ─── Gửi tin nhắn ─────────────────────────────────────────────────────────
  const sendMessage = async (content: string) => {
    if (!activeUserId) return;
    const myId = getMyId();
    if (!myId) return;

    const text = content.trim();
    if (!text) return;

    try {
      // Step 1: Lưu Database qua API
      const created: any = await authFetch("/messages", {
        method: "POST",
        body: JSON.stringify({ receiver_id: activeUserId, content: text }),
      });

      const messageId = Number(created?.message_id);
      const sid = String(created?.sender_id?.id ?? created?.sender_id ?? myId);
      const rid = String(
        created?.receiver_id?.id ?? created?.receiver_id ?? activeUserId,
      );

      // ✅ FIX: dùng `text` (không phải `content`) để đồng nhất với UiMessage
      const payload: UiMessage = {
        message_id: messageId,
        text: String(created?.content ?? text),
        created_at: created?.created_at ? String(created.created_at) : undefined,
        sender_id: sid,
        receiver_id: rid,
      };

      // Step 2: Optimistic UI update (append trước khi socket echo về)
      setMessages((prev) => {
        if (prev.some((m) => m.message_id === messageId)) return prev;
        return [...prev, payload];
      });

      // Step 3: Gửi Realtime qua Socket.IO
      // Server sẽ emit "receive_message" cho toàn bộ room (gồm người nhận)
      // FE của sender đã có optimistic → dedupe sẽ bỏ qua bản echo
      if (socketRef.current?.connected) {
        const pairId = [String(myId), String(activeUserId)].sort().join("-");
        socketRef.current.emit("chat_message", { pairId, payload });
      }
    } catch (e: any) {
      console.error("Gửi tin nhắn lỗi:", e);
      setError("Gửi tin nhắn thất bại");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chatUsers,
        activeUserId,
        setActiveUserId,
        messages,
        isLoading,
        error,
        refreshConversation,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}