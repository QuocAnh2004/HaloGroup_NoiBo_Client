// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { authFetch } from "@/api/config";
// import type { ChatMessage, AuthenticatedUser } from "@/types";
// import SockJS from "sockjs-client";
// import { Client, Stomp } from "@stomp/stompjs";

// type ChatUser = {
//   userId: string;
//   user: string;
//   avatar: string;
//   name?: string;
// };

// type UiMessage = {
//   message_id: number;
//   text: string;
//   img?: string;
//   created_at?: string;
//   sender_id?: string;
//   receiver_id?: string;
// };

// type ChatContextValue = {
//   chatUsers: ChatUser[];
//   activeUserId: string | null;
//   setActiveUserId: (id: string) => void;

//   messages: UiMessage[];
//   isLoading: boolean;
//   error: string | null;

//   refreshConversation: () => Promise<void>;
//   sendMessage: (content: string) => Promise<void>;
// };

// const ChatContext = createContext<ChatContextValue | null>(null);
// /** LẤY myId TỪ hola_user */
// function getMyId(): string | null {
//   try {
//     const savedUser = localStorage.getItem("hola_user");
//     if (!savedUser) return null;
//     const user: AuthenticatedUser = JSON.parse(savedUser);
//     return String(user.id);
//   } catch {
//     return null;
//   }
// }

// function mapDbToUiMessages(dbMessages: ChatMessage[]): UiMessage[] {
//   if (!Array.isArray(dbMessages)) return [];

//   return dbMessages.map((m) => ({
//     message_id: m.message_id,
//     text: m.content,
//     created_at: m.created_at ? String(m.created_at) : undefined,
//     sender_id: String((m as any).sender_id?.id ?? (m as any).sender_id ?? ""),
//     receiver_id: String(
//       (m as any).receiver_id?.id ?? (m as any).receiver_id ?? "",
//     ),
//   }));
// }

// export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
//   const [isLoadingUsers, setIsLoadingUsers] = useState(false);
//   const [usersError, setUsersError] = useState<string | null>(null);

//   const [activeUserId, setActiveUserId] = useState<string | null>(null);

//   const activeUser = useMemo(
//     () => chatUsers.find((u) => u.userId === activeUserId),
//     [chatUsers, activeUserId],
//   );

//   const [messages, setMessages] = useState<UiMessage[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // ✅ Giữ 1 WS client duy nhất
//   const stompRef = useRef<Client | null>(null);

//   // ✅ Lưu subscription để unsubscribe khi đổi cuộc chat
//   const publicSubRef = useRef<any>(null);
//   const notifySubRef = useRef<any>(null);
// const inboxSubRef = useRef<any>(null);

//   // ✅ Tránh callback WS dùng activeUserId cũ
//   const activeUserIdRef = useRef<string | null>(null);
//   useEffect(() => {
//     activeUserIdRef.current = activeUserId;
//   }, [activeUserId]);

//   // ✅ Load danh sách user đã chat + set activeUserId lần đầu
//   useEffect(() => {
//     const fetchChatUsers = async () => {
//       setIsLoadingUsers(true);
//       setUsersError(null);

//       try {
//         const chatIds: { userId: string }[] = await authFetch(
//           "/messages/chat-users",
//         );
//         const ids = chatIds.map((u) => String(u.userId));

//         if (ids.length === 0) {
//           setChatUsers([]);
//           setActiveUserId(null);
//           return;
//         }

//         const users: any[] = await authFetch("/messages/users/by-ids", {
//           method: "POST",
//           body: JSON.stringify({ ids }),
//         });

//         const mapped: ChatUser[] = users.map((u) => ({
//           userId: String(u.userId),
//           user: u.name,
//           name: u.name,
//           avatar: u.avatar || "/chat_page/assets/images/users/user-default.png",
//         }));

//         setChatUsers(mapped);

//         // ✅ set active user lần đầu nếu chưa có
//         setActiveUserId((prev) => prev ?? mapped[0]?.userId ?? null);
//       } catch (e: any) {
//         console.error("❌ Load chat users failed:", e);
//         setUsersError(e?.message || "Không tải được danh sách chat");
//         setChatUsers([]);
//         setActiveUserId(null);
//       } finally {
//         setIsLoadingUsers(false);
//       }
//     };

//     fetchChatUsers();
//   }, []);

//   const refreshConversation = async () => {
//     if (!activeUserId) return;

//     const myId = getMyId();
//     if (!myId) {
//       setError("Chưa đăng nhập (không tìm thấy hola_user)");
//       setMessages([]);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const dbMessages: ChatMessage[] = await authFetch(
//         `/messages/conversation/${activeUserId}`,
//       );

//       // ✅ không truyền myId vào avatar nữa
//       setMessages(mapDbToUiMessages(dbMessages));
//     } catch (e: any) {
//       setError(e?.message || "Không tải được tin nhắn");
//       setMessages([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const myId = getMyId();
//     if (!myId) return;

//     const wsUrl = "http://localhost:3001/ws"; // nhớ đúng port BE
//     // const wsUrl = "ws://localhost:3001/ws";  // ✅ Đúng
//     // const wsUrl = new SockJS("http://localhost:3001/ws");
//     console.log("wsUrl url123 =", wsUrl, typeof wsUrl);

//     const client = new Client({
//       webSocketFactory: () => new SockJS(wsUrl),
//       reconnectDelay: 5000, // ✅ auto reconnect 5s
//       debug: () => {}, // tắt log
//     });

//     client.onWebSocketError = (e) => {
//       console.error("❌ WS error:", e);
//     };
//     client.onWebSocketClose = (e) => {
//       console.warn("⚠️ WS closed:", e);
//     };

//     stompRef.current = client;
//     client.onConnect = () => {
//       console.log("✅ STOMP connected");

//       // ✅ (1) Notify topic: /topic/notify/{myId}
//       try {
//         notifySubRef.current?.unsubscribe?.();
//       } catch {}
//       notifySubRef.current = client.subscribe(
//         `/topic/notify/${myId}`,
//         (frame) => {
//           // Có thể dùng để refresh danh sách chat nếu muốn
//           // const notify = JSON.parse(frame.body);
//           // console.log("🔔 notify:", notify);
//         },
//       );

//       // ✅ (2) Inbox queue: /user/{myId}/queue/messages
//       try {
//         inboxSubRef.current?.unsubscribe?.();
//       } catch {}
//       inboxSubRef.current = client.subscribe(
//         `/user/${myId}/queue/messages`,
//         (frame) => {
//           const msg = JSON.parse(frame.body);

//           // ✅ normalize id (tránh [object Object])
//           const myIdStr = String(myId);
//           const sid = String(msg?.sender_id?.id ?? msg?.sender_id ?? "");
//           const rid = String(msg?.receiver_id?.id ?? msg?.receiver_id ?? "");

//           // other user của cuộc chat
//           const otherUserId = sid === myIdStr ? rid : sid;

//           // ✅ chỉ append nếu đang mở đúng cuộc chat
//           if (
//             !activeUserIdRef.current ||
//             String(activeUserIdRef.current) !== otherUserId
//           )
//             return;

//           setMessages((prev) => {
//             // ✅ chống trùng
//             if (
//               msg?.message_id &&
//               prev.some((m) => m.message_id === msg.message_id)
//             )
//               return prev;

//             return [
//               ...prev,
//               {
//                 message_id: Number(msg.message_id),
//                 text: String(msg.content ?? ""),
//                 created_at: msg.created_at ? String(msg.created_at) : undefined,
//                 sender_id: sid,
//                 receiver_id: rid,
//               },
//             ];
//           });
//         },
//       );
//     };

//     client.onStompError = (frame) => {
//       console.error("STOMP error:", frame.headers["message"], frame.body);
//     };

//     client.activate();

//     return () => {
//       try {
//         publicSubRef.current?.unsubscribe?.();
//         notifySubRef.current?.unsubscribe?.();
//           inboxSubRef.current?.unsubscribe?.();

//       } catch {}
//       client.deactivate();
//       stompRef.current = null;
//     };
//   }, [activeUserId]);

//   // ✅ Khi đổi active user -> subscribe đúng topic public để nhận realtime từ server:
//   // /topic/public/{idA-idB}
//   useEffect(() => {
//     const client = stompRef.current;
//     const myId = getMyId();

//     if (!client || !client.connected) return;
//     if (!myId) return;

//     // Unsubscribe topic public cũ
//     try {
//       publicSubRef.current?.unsubscribe?.();
//     } catch {}
//     publicSubRef.current = null;

//     if (!activeUserId) return;

//     const pairId = [String(myId), String(activeUserId)].sort().join("-");
//     const topic = `/topic/public/${pairId}`;
//     console.log("✅ subscribe:", topic);

//     publicSubRef.current = client.subscribe(topic, (frame) => {
//       const msg = JSON.parse(frame.body);

//       const myIdStr = String(myId);
//       const sid = String(msg?.sender_id?.id ?? msg?.sender_id ?? "");
//       const rid = String(msg?.receiver_id?.id ?? msg?.receiver_id ?? "");
//       const otherUserId = sid === myIdStr ? rid : sid;

//       if (
//         !activeUserIdRef.current ||
//         String(activeUserIdRef.current) !== otherUserId
//       )
//         return;

//       setMessages((prev) => {
//         if (
//           msg?.message_id &&
//           prev.some((m) => m.message_id === msg.message_id)
//         )
//           return prev;

//         return [
//           ...prev,
//           {
//             message_id: Number(msg.message_id),
//             text: String(msg.content ?? ""),
//             created_at: msg.created_at ? String(msg.created_at) : undefined,
//             sender_id: sid,
//             receiver_id: rid,
//           },
//         ];
//       });
//     });

//     return () => {
//       try {
//         publicSubRef.current?.unsubscribe?.();
//       } catch {}
//       publicSubRef.current = null;
//     };
//   }, [activeUserId]);

//   // ✅ Khi đổi active user -> load conversation
//   useEffect(() => {
//     refreshConversation();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeUserId]);

//   const sendMessage = async (content: string) => {
//     if (!activeUserId) return;

//     const myId = getMyId();
//     if (!myId) {
//       setError("Chưa đăng nhập (không tìm thấy hola_user)");
//       return;
//     }

//     const text = String(content ?? "").trim();
//     if (!text) return;

//     setError(null);

//     try {
//       // ✅ lấy message vừa tạo từ BE
//       const created: any = await authFetch("/messages", {
//         method: "POST",
//         body: JSON.stringify({
//           receiver_id: activeUserId,
//           content: text,
//         }),
//       });
//       console.log("created:", created);

//       // ✅ Optimistic append: hiển thị ngay lập tức
//       if (created?.message_id) {
//         const sid = String(
//           created?.sender_id?.id ?? created?.sender_id ?? myId,
//         );
//         const rid = String(
//           created?.receiver_id?.id ?? created?.receiver_id ?? activeUserId,
//         );

//         setMessages((prev) => {
//           if (prev.some((m) => m.message_id === created.message_id))
//             return prev;
//           return [
//             ...prev,
//             {
//               message_id: Number(created.message_id),
//               text: String(created.content ?? text),
//               created_at: created.created_at
//                 ? String(created.created_at)
//                 : undefined,
//               sender_id: sid,
//               receiver_id: rid,
//             },
//           ];
//         });
//       }

//       // ✅ WS vẫn sẽ bắn về (bên subscribe nhớ dedupe theo message_id)
//     } catch (e: any) {
//       setError(e?.message || "Gửi tin nhắn thất bại");
//     }
//   };
//   return (
//     <ChatContext.Provider
//       value={{
//         chatUsers,
//         activeUserId,
//         setActiveUserId,
//         messages,
//         isLoading,
//         error,
//         refreshConversation,
//         sendMessage,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export function useChat() {
//   const ctx = useContext(ChatContext);
//   if (!ctx) throw new Error("useChat must be used inside ChatProvider");
//   return ctx;
// }

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
import SockJS from "sockjs-client";
import { Client, CompatClient, Stomp } from "@stomp/stompjs";

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
  const stompRef = useRef<Client | null>(null);

  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const activeUser = useMemo(
    () => chatUsers.find((u) => u.userId === activeUserId),
    [chatUsers, activeUserId],
  );

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 1 WS client duy nhất, tồn tại suốt session đăng nhập
  // const stompRef = useRef<Client | null>(null);
  const stompClient = useRef<CompatClient | null>(null); // Khai báo đúng kiểu

  const isConnectedRef = useRef(false);

  // Subscription refs — chỉ thay đổi khi đổi activeUserId
  const publicSubRef = useRef<any>(null);
  const notifySubRef = useRef<any>(null);
  const inboxSubRef = useRef<any>(null);

  // Luôn giữ activeUserId mới nhất cho WS callbacks (tránh stale closure)
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
  useEffect(() => {
    activeUserIdRef.current = activeUserId;

    const myId = getMyId();
    const client = stompRef.current;
    if (!myId || !client || !client.connected) return;

    switchPublicChannel(client, myId, activeUserId);
  }, [activeUserId]);

  useEffect(
    () => {
      const myId = getMyId();
      if (!myId) return;

      const client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:3001/ws"),
        reconnectDelay: 5000,
        debug: (s) => console.log("[STOMP]", s),
      });

      stompRef.current = client;

      client.onWebSocketClose = (e) => {
        console.warn("⚠️ WS closed:", e);
        isConnectedRef.current = false;
      };
      client.onWebSocketError = (e) => console.error("❌ WS error:", e);

      client.onConnect = () => {
        console.log("✅ STOMP connected");
        isConnectedRef.current = true;

        // notify (fixed)
        try {
          notifySubRef.current?.unsubscribe?.();
        } catch {}
        notifySubRef.current = client.subscribe(
          `/topic/notify/${myId}`,
          () => {},
        );

        // inbox (fixed)
        try {
          inboxSubRef.current?.unsubscribe?.();
        } catch {}
        inboxSubRef.current = client.subscribe(
          `/user/${myId}/queue/messages`,
          (frame) => {
            const msg = JSON.parse(frame.body);

            const myIdStr = String(myId);
            const sid = String(msg?.sender_id?.id ?? msg?.sender_id ?? "");
            const rid = String(msg?.receiver_id?.id ?? msg?.receiver_id ?? "");
            const otherUserId = sid === myIdStr ? rid : sid;

            // chỉ append nếu đúng cuộc chat đang mở
            if (
              !activeUserIdRef.current ||
              String(activeUserIdRef.current) !== otherUserId
            )
              return;

            setMessages((prev) => {
              if (
                msg?.message_id &&
                prev.some((m) => m.message_id === msg.message_id)
              )
                return prev;
              return [
                ...prev,
                {
                  message_id: Number(msg.message_id),
                  text: String(msg.content ?? ""),
                  created_at: msg.created_at
                    ? String(msg.created_at)
                    : undefined,
                  sender_id: sid,
                  receiver_id: rid,
                },
              ];
            });
          },
        );

        // subscribe public theo activeUser hiện tại (lấy từ ref để không stale)
        switchPublicChannel(client, myId, activeUserIdRef.current);
      };

      client.onStompError = (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);
      };

      client.activate();

      return () => {
        try {
          publicSubRef.current?.unsubscribe?.();
          notifySubRef.current?.unsubscribe?.();
          inboxSubRef.current?.unsubscribe?.();
        } catch {}
        client.deactivate(); // ✅ không setTimeout
        stompRef.current = null;
        isConnectedRef.current = false;
        console.log("🔌 STOMP disconnected (cleanup)");
      };
    },
    [
      /* chỉ phụ thuộc myId nếu bạn có state myId */
    ],
  );

  function switchPublicChannel(
    client: Client,
    myId: string,
    targetUserId: string | null,
  ) {
    try {
      publicSubRef.current?.unsubscribe?.();
    } catch {}
    publicSubRef.current = null;

    if (!targetUserId || !client.connected) return;

    const pairId = [String(myId), String(targetUserId)].sort().join("-");
    const topic = `/topic/public/${pairId}`;
    console.log("🔄 switch channel →", topic);

    publicSubRef.current = client.subscribe(topic, (frame) => {
      const msg = JSON.parse(frame.body);

      const myIdStr = String(myId);
      const sid = String(msg?.sender_id?.id ?? msg?.sender_id ?? "");
      const rid = String(msg?.receiver_id?.id ?? msg?.receiver_id ?? "");
      const otherUserId = sid === myIdStr ? rid : sid;

      if (
        !activeUserIdRef.current ||
        String(activeUserIdRef.current) !== otherUserId
      )
        return;

      setMessages((prev) => {
        if (
          msg?.message_id &&
          prev.some((m) => m.message_id === msg.message_id)
        )
          return prev;
        return [
          ...prev,
          {
            message_id: Number(msg.message_id),
            text: String(msg.content ?? ""),
            created_at: msg.created_at ? String(msg.created_at) : undefined,
            sender_id: sid,
            receiver_id: rid,
          },
        ];
      });
    });
  }
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
  // const sendMessage = async (content: string) => {
  //   if (!activeUserId) return;

  //   const myId = getMyId();
  //   if (!myId) {
  //     setError("Chưa đăng nhập (không tìm thấy hola_user)");
  //     return;
  //   }

  //   const text = String(content ?? "").trim();
  //   if (!text) return;

  //   setError(null);

  //   try {
  //     const created: any = await authFetch("/messages", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         receiver_id: activeUserId,
  //         content: text,
  //       }),
  //     });

  //     // Optimistic append
  //     if (created?.message_id) {
  //       const sid = String(
  //         created?.sender_id?.id ?? created?.sender_id ?? myId,
  //       );
  //       const rid = String(
  //         created?.receiver_id?.id ?? created?.receiver_id ?? activeUserId,
  //       );

  //       setMessages((prev) => {
  //         if (prev.some((m) => m.message_id === created.message_id))
  //           return prev;
  //         return [
  //           ...prev,
  //           {
  //             message_id: Number(created.message_id),
  //             text: String(created.content ?? text),
  //             created_at: created.created_at
  //               ? String(created.created_at)
  //               : undefined,
  //             sender_id: sid,
  //             receiver_id: rid,
  //           },
  //         ];
  //       });
  //     }
  //   } catch (e: any) {
  //     setError(e?.message || "Gửi tin nhắn thất bại");
  //   }
  // };
  // ─── Gửi tin nhắn ─────────────────────────────────────────────────────────
// Luồng mới:
// 1) POST /messages để lưu DB và lấy message_id
// 2) publish qua STOMP để server broadcast realtime (topic + inbox)
const sendMessage = async (content: string) => {
  if (!activeUserId) return;

  const myId = getMyId();
  if (!myId) {
    setError("Chưa đăng nhập (không tìm thấy hola_user)");
    return;
  }

  const text = String(content ?? "").trim();
  if (!text) return;

  setError(null);

  try {
    // (1) Lưu DB trước để có message_id (đỡ bị trùng khi WS echo về)
    const created: any = await authFetch("/messages", {
      method: "POST",
      body: JSON.stringify({
        receiver_id: activeUserId,
        content: text,
      }),
    });

    const messageId = Number(created?.message_id);
    const sid = String(created?.sender_id?.id ?? created?.sender_id ?? myId);
    const rid = String(
      created?.receiver_id?.id ?? created?.receiver_id ?? activeUserId,
    );

    // Optimistic append (vì đã có message_id => WS echo về sẽ dedupe theo message_id)
    if (!Number.isNaN(messageId)) {
      setMessages((prev) => {
        if (prev.some((m) => m.message_id === messageId)) return prev;
        return [
          ...prev,
          {
            message_id: messageId,
            text: String(created?.content ?? text),
            created_at: created?.created_at ? String(created.created_at) : undefined,
            sender_id: sid,
            receiver_id: rid,
          },
        ];
      });
    }

    // (2) Gửi realtime qua WS
    const client = stompRef.current;
    if (client && client.connected) {
      const pairId = [String(myId), String(activeUserId)].sort().join("-");
      const destination = `/app/chat.sendMessage/${pairId}`;

      const payload = {
        message_id: messageId,
        sender_id: sid,
        receiver_id: rid,
        content: String(created?.content ?? text),
        created_at: created?.created_at ? String(created.created_at) : undefined,
      };

      client.publish({
        destination,
        body: JSON.stringify(payload),
      });
    } else {
      // WS chưa sẵn sàng -> vẫn lưu DB OK, chỉ thiếu realtime
      console.warn("⚠️ WS chưa connected, không publish realtime");
    }
  } catch (e: any) {
    setError(e?.message || "Gửi tin nhắn thất bại");
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
