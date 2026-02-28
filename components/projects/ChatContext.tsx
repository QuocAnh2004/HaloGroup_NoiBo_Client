// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { authFetch } from "@/api/config"; // 👈 DÙNG LẠI CONFIG CỦA BẠN
// import type { ChatMessage, AuthenticatedUser } from "@/types"; // dùng type sẵn có
// import SockJS from "sockjs-client";
// import { Stomp } from "@stomp/stompjs";

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
//     sendMessage: (content: string) => Promise<void>;   // 👈 thêm

// };

// const ChatContext = createContext<ChatContextValue | null>(null);

// /** LẤY myId TỪ hola_user */
// function getMyId(): string | null {
//   try {
//     const savedUser = localStorage.getItem("hola_user");
//     if (!savedUser) return null;
//     const user: AuthenticatedUser = JSON.parse(savedUser);
//     return user.id;
//   } catch {
//     return null;
//   }
// }

// function mapDbToUiMessages(
//   dbMessages: ChatMessage[],
//   otherAvatar?: string,): UiMessage[] {
//   if (!Array.isArray(dbMessages)) return []; // Tránh lỗi nếu dbMessages là null/undefined

//   return dbMessages.map((m) => ({
//     message_id: m.message_id,
//     text: m.content,
//     img: otherAvatar,
//     created_at: m.created_at ? String(m.created_at) : undefined,
//     sender_id: String(m.sender_id?.id || m.sender_id || ""),
//     receiver_id: String(m.receiver_id?.id || m.receiver_id || ""),
//   }));
// }
// export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {

// const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
// const [isLoadingUsers, setIsLoadingUsers] = useState(false);
// const [usersError, setUsersError] = useState<string | null>(null);

// // useEffect(() => {
// //   const fetchChatUsers = async () => {
// //     setIsLoadingUsers(true);
// //     setUsersError(null);

// //     try {
// //       // ✅ authFetch trả về JSON luôn
// //       const data: { userId: string }[] = await authFetch("/messages/chat-users");

// //       const mappedUsers: ChatUser[] = data.map((u) => ({
// //         userId: String(u.userId),
// //         user: `User ${u.userId}`, // sau này join bảng users thì thay bằng full_name
// //         avatar: "",
// //         name: `User ${u.userId}`,
// //       }));

// //       setChatUsers(mappedUsers);
// //     } catch (e: any) {
// //       console.error("❌ Load chat users failed:", e);
// //       setUsersError(e?.message || "Không tải được danh sách chat");
// //       setChatUsers([]);
// //     } finally {
// //       setIsLoadingUsers(false);
// //     }
// //   };

// //   fetchChatUsers();
// // }, []);

// useEffect(() => {
//   const fetchChatUsers = async () => {
//     setIsLoadingUsers(true);
//     setUsersError(null);

//     try {
//       // 1️⃣ Lấy danh sách userId đã chat
//       const chatIds: { userId: string }[] =
//         await authFetch("/messages/chat-users");

//       const ids = chatIds.map((u) => u.userId);

//       if (ids.length === 0) {
//         setChatUsers([]);
//         return;
//       }

//       // 2️⃣ Lấy thông tin user theo id
//       const users: any[] = await authFetch("/messages/users/by-ids", {
//         method: "POST",
//         body: JSON.stringify({ ids }),
//       });
//       console.log("Fetched chat users:", users);

//       // 3️⃣ Map ra ChatUser
//       const mapped: ChatUser[] = users.map((u) => ({
//         userId: String(u.userId),
//         user: u.name,
//         name: u.name,
//         avatar: u.avatar || "/chat_page/assets/images/users/user-default.png",
//       }));

//       setChatUsers(mapped);
//       if (mapped.length > 0) {
//   // setActiveUser(mapped[0]);       // nếu bạn lưu cả object
//   setActiveUserId(mapped[0].userId); // nếu bạn lưu theo id
// }

//     } catch (e: any) {
//       console.error("❌ Load chat users failed:", e);
//       setUsersError(e?.message || "Không tải được danh sách chat");
//       setChatUsers([]);
//     } finally {
//       setIsLoadingUsers(false);
//     }
//   };

//   fetchChatUsers();
// }, []);

//   const [activeUserId, setActiveUserId] = useState<string | null>(
//     chatUsers[0]?.userId ?? null,
//   );
//   const activeUser = useMemo(
//     () => chatUsers.find((u) => u.userId === activeUserId),
//     [chatUsers, activeUserId],
//   );

//   const [messages, setMessages] = useState<UiMessage[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

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
//       // ✅ DÙNG authFetch – tự gắn token
//       const dbMessages: ChatMessage[] = await authFetch(
//         `/messages/conversation/${activeUserId}`,
//       );

//       setMessages(mapDbToUiMessages(dbMessages, myId));
//     } catch (e: any) {
//       setError(e.message || "Không tải được tin nhắn");
//       setMessages([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // const sendMessage = async (content: string) => {
//   //   if (!activeUserId) return;

//   //   const myId = getMyId();
//   //   if (!myId) {
//   //     setError("Chưa đăng nhập (không tìm thấy hola_user)");
//   //     return;
//   //   }

//   //   try {
//   //     await authFetch("/messages/send", {
//   //       method: "POST",
//   //       body: JSON.stringify({
//   //         receiver_id: activeUserId,
//   //         content,
//   //       }),
//   //     });

//   //     await refreshConversation();
//   //   } catch (e: any) {
//   //     setError(e.message || "Không gửi được tin nhắn");
//   //   }
//   // };
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
//     // ✅ gọi BE
//     const created: any = await authFetch("/messages", {
//       method: "POST",
//       body: JSON.stringify({
//         receiver_id: activeUserId,
//         content: text,
//       }),
//     });

//     // ✅ Nếu BE trả về message row thì append luôn
//     if (created?.message_id) {
//       const ui: UiMessage = {
//         message_id: created.message_id,
//         text: created.content,
//         created_at: created.created_at ? String(created.created_at) : undefined,
//         sender_id: String(created.sender_id),
//         receiver_id: String(created.receiver_id),
//       };

//       setMessages((prev) => [...prev, ui]);
//     } else {
//       // fallback: reload
//       await refreshConversation();
//     }
//   } catch (e: any) {
//     setError(e?.message || "Gửi tin nhắn thất bại");
//   }
// };
//   useEffect(() => {
//     refreshConversation();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeUserId]);

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
//         sendMessage, // 👈 Add this line to fix the error
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
  useState,
} from "react";
import { authFetch } from "@/api/config";
import type { ChatMessage, AuthenticatedUser } from "@/types";
import SockJS from "sockjs-client";
import { Client, Stomp } from "@stomp/stompjs";

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

/** LẤY myId TỪ hola_user */
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

  const activeUser = useMemo(
    () => chatUsers.find((u) => u.userId === activeUserId),
    [chatUsers, activeUserId],
  );

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Load danh sách user đã chat + set activeUserId lần đầu
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

        // ✅ set active user lần đầu nếu chưa có
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

      // ✅ không truyền myId vào avatar nữa
      setMessages(mapDbToUiMessages(dbMessages));
    } catch (e: any) {
      setError(e?.message || "Không tải được tin nhắn");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Realtime: connect WS + subscribe inbox theo myId
  // useEffect(() => {
  //   const myId = getMyId();
  //   if (!myId) return;

  //   // ⚠️ sửa URL ws cho đúng nếu BASE_URL của bạn có /api
  //   // Nếu BASE_URL là "http://localhost:3001/api" -> ws là "http://localhost:3001/ws"
  //   // Nếu BASE_URL là "http://localhost:3001" -> ws là "http://localhost:3001/ws"
  //   const wsBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/api\/?$/, "");
  //   // const wsUrl = `${wsBase}/ws`;
  //   const wsUrl = "http://localhost:3001/ws";

  //   const socket = new SockJS(wsUrl);
  //   const stompClient = Stomp.over(socket);
  //   stompClient.debug = () => {};

  //   let isConnected = false;

  //   stompClient.connect({}, () => {
  //     isConnected = true;

  //     const subscription = stompClient.subscribe(
  //       `/user/${myId}/queue/messages`,
  //       (frame) => {
  //         try {
  //           const msg = JSON.parse(frame.body);

  //           const ui: UiMessage = {
  //             message_id: msg.message_id,
  //             text: msg.content,
  //             created_at: msg.created_at ? String(msg.created_at) : undefined,
  //             sender_id: String(msg.sender_id),
  //             receiver_id: String(msg.receiver_id),
  //           };

  //           // ✅ xác định người chat cùng mình để filter theo activeUserId
  //           const otherUserId =
  //             String(msg.sender_id) === String(myId)
  //               ? String(msg.receiver_id)
  //               : String(msg.sender_id);

  //           // Không thuộc cuộc chat đang mở → bỏ qua (hoặc làm unread)
  //           if (!activeUserId || otherUserId !== String(activeUserId)) return;

  //           setMessages((prev) => {
  //             if (ui.message_id && prev.some((m) => m.message_id === ui.message_id)) {
  //               return prev;
  //             }
  //             return [...prev, ui];
  //           });
  //         } catch (e) {
  //           console.error("❌ WS parse error", e);
  //         }
  //       },
  //     );

  //     (stompClient as any).__sub = subscription;
  //   });

  //   return () => {
  //     try {
  //       const sub = (stompClient as any).__sub;
  //       if (sub?.unsubscribe) sub.unsubscribe();
  //       if (isConnected) stompClient.disconnect(() => {});
  //     } catch {}
  //   };
  // }, [activeUserId]);

  useEffect(() => {
    const myId = getMyId();
    if (!myId) return;

    const wsUrl = "http://localhost:3001/ws"; // nhớ đúng port BE
    // const wsUrl = "ws://localhost:3001/ws";  // ✅ Đúng
// const wsUrl = new SockJS("http://localhost:3001/ws");
    console.log("wsUrl url =", wsUrl, typeof wsUrl);


    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000, // ✅ auto reconnect 5s
      debug: () => {}, // tắt log
    });

    client.onConnect = () => {
      client.subscribe(`/user/${myId}/queue/messages`, (frame) => {
        client.onConnect = () => {
          // ✅ LƯU Ý: nhiều broker dùng /user/queue/... (không cần myId trong path)
          // Nếu bạn đang dùng /user/${myId}/queue/messages mà không thấy nhận gì -> đổi sang /user/queue/messages
          client.subscribe(`/user/queue/messages`, (frame) => {
            const msg = JSON.parse(frame.body);

            // ✅ normalize id (tránh [object Object])
            const myIdStr = String(myId);
            const sid = String(msg?.sender_id?.id ?? msg?.sender_id ?? "");
            const rid = String(msg?.receiver_id?.id ?? msg?.receiver_id ?? "");

            // other user của cuộc chat
            const otherUserId = sid === myIdStr ? rid : sid;

            // ✅ chỉ append nếu đang mở đúng cuộc chat
            if (!activeUserId || String(activeUserId) !== otherUserId) return;

            setMessages((prev) => {
              // ✅ chống trùng khi vừa optimistic append hoặc vừa refresh
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
          });
        };

        const msg = JSON.parse(frame.body);
        // handle msg...
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"], frame.body);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [activeUserId]);

  // ✅ Khi đổi active user -> load conversation
  useEffect(() => {
    refreshConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId]);

  // ✅ Gửi message: chỉ REST, không append local để tránh duplicate
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
  //     await authFetch("/messages", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         receiver_id: activeUserId,
  //         content: text,
  //       }),

  //     });

  //     // ✅ WS sẽ tự bắn tin nhắn về và setMessages
  //   } catch (e: any) {
  //     setError(e?.message || "Gửi tin nhắn thất bại");
  //   }
  // };
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
      // ✅ lấy message vừa tạo từ BE
      const created: any = await authFetch("/messages", {
        method: "POST",
        body: JSON.stringify({
          receiver_id: activeUserId,
          content: text,
        }),
      });
      console.log("created:", created);

      // ✅ Optimistic append: hiển thị ngay lập tức
      if (created?.message_id) {
        const sid = String(
          created?.sender_id?.id ?? created?.sender_id ?? myId,
        );
        const rid = String(
          created?.receiver_id?.id ?? created?.receiver_id ?? activeUserId,
        );

        setMessages((prev) => {
          if (prev.some((m) => m.message_id === created.message_id))
            return prev;
          return [
            ...prev,
            {
              message_id: Number(created.message_id),
              text: String(created.content ?? text),
              created_at: created.created_at
                ? String(created.created_at)
                : undefined,
              sender_id: sid,
              receiver_id: rid,
            },
          ];
        });
      }

      // ✅ WS vẫn sẽ bắn về (bên subscribe nhớ dedupe theo message_id)
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
