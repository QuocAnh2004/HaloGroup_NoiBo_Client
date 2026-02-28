// ==============================
import React, { useMemo, useState } from "react";
import {
  Search,
  Phone,
  Video,
  Camera,
  SendHorizonal,
  Circle,
  Paperclip,
} from "lucide-react";
import BackButton from "../shared/BackButton";
import { useChat } from "./ChatContext";
import { getCurrentUser, getInitialUppercase } from "@/utils";

const MessengerPage = () => {
  const currentUser = getCurrentUser();

  const {
    chatUsers,
    activeUserId,
    setActiveUserId,
    messages,
    isLoading,
    error,
    sendMessage,  
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const activeUser = chatUsers.find((u) => u.userId === activeUserId);

  const filteredChatList = useMemo(
    () =>
      chatUsers.filter((c) =>
        c.user.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [chatUsers, searchValue],
  );

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!inputValue.trim()) return;
  //   setInputValue("");
  // };
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputValue.trim()) return;
  if (!activeUserId) return;

  const text = inputValue;
  setInputValue("");

  await sendMessage(text);
};

  return (
    <div className="h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto h-full max-w-screen-2xl px-4 py-4">
        <div className="grid h-full grid-cols-12 gap-4">
          {/* SIDEBAR */}
          <aside className="col-span-4 lg:col-span-3 rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <BackButton onClick={() => window.history.back()} />
                <img
                  src="/chat_page/assets/images/users/user-4.jpg"
                  className="h-12 w-12 rounded-full"
                />
                <div>
                   {/* <div
                    className={`relative w-14 h-14 rounded-[22px] flex items-center justify-center text-white text-lg font-semibold
                    shadow-lg transition-all duration-500
                    ${
                      activeUser
                        ? "bg-indigo-600 shadow-indigo-100"
                        : "bg-slate-300 shadow-slate-100 group-hover:bg-indigo-500"
                    }`}
                  >
                    {getInitialUppercase(activeUser?.name || "")}
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                  </div> */}
                  <p className="font-semibold text-slate-900">
                    {currentUser?.name || "Người dùng"}
                  </p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <Circle size={8} className="fill-emerald-500" /> Online
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Tìm kiếm"
                  className="w-full h-11 rounded-2xl border px-10 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </div>
            </div>

            {/* Chat list */}
            <div className="p-2 overflow-y-auto h-[calc(100%-120px)]">
              {filteredChatList.map((chat) => {
                const isActive = chat.userId === activeUserId;
                // console.log("isActive", chat);
                return (
                  <button
                    key={chat.userId}
                    onClick={() => setActiveUserId(chat.userId)}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-3 mb-1 transition
                      ${isActive ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50"}
                    `}
                  >
                    <div
                      className={`relative w-14 h-14 rounded-[22px] flex items-center justify-center text-white text-lg font-semibold
                    shadow-lg transition-all duration-500 bg-slate-300 shadow-slate-100 group-hover:bg-indigo-500
                   `}
                    >
                      {getInitialUppercase(chat?.name || "")}
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    {/* <div>
                      
                      {getInitialUppercase(chat?.name)}
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                    </div> */}
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900">
                        {chat?.name} ({chat?.userId})
                      </p>
                      {/* <p className="text-xs text-slate-500 truncate">
                        {
                           messages.at(-1)?.text || "Chưa có tin nhắn"
                          }
                      </p> */}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* CHAT */}
          <section className="col-span-8 lg:col-span-9 rounded-3xl border bg-white shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-16 px-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* <div
                  className={`relative w-14 h-14 rounded-[22px] flex items-center justify-center text-white text-lg font-semibold
                                   shadow-lg transition-all duration-500 bg-slate-300 shadow-slate-100 group-hover:bg-indigo-500
                                  `}
                >
                  {getInitialUppercase(activeUser?.name)}
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                </div> */}
                 <div
                    className={`relative w-14 h-14 rounded-[22px] flex items-center justify-center text-white text-lg font-semibold
                    shadow-lg transition-all duration-500
                    ${
                      activeUser
                        ? "bg-indigo-600 shadow-indigo-100"
                        : "bg-slate-300 shadow-slate-100 group-hover:bg-indigo-500"
                    }`}
                  >
                    {getInitialUppercase(activeUser?.name)}
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                  </div>

                <p className="font-semibold">
                  {activeUser?.name} ({activeUser?.userId})
                </p>
              </div>

              <div className="flex gap-2">
                <button className="icon-btn">
                  <Phone size={18} />
                </button>
                <button className="icon-btn">
                  <Video size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/40">
              {isLoading && (
                <div className="text-sm text-slate-500">
                  Đang tải tin nhắn...
                </div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}

              {!isLoading &&
                !error &&
                messages.map((m) => {
                  const isMe = currentUser?.id === m.sender_id;
                  // console.log("UI MESSAGE:", m);
                  // console.log("activeUserId:", activeUserId);
                  // console.log("chatUsers:", chatUsers);
                  return (
                    <div
                      key={m.message_id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}
                    >
                      {/* Avatar chỉ hiện với tin người khác */}
                      {!isMe && (
                        <img
                          src={activeUser?.avatar}
                          className="h-8 w-8 rounded-full"
                          alt=""
                        />
                      )}

                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow
            ${
              isMe
                ? "bg-indigo-600 text-white rounded-br-md"
                : "bg-white border border-slate-200 rounded-bl-md"
            }
          `}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t px-4 py-3 flex items-center gap-2"
            >
              <button type="button" className="icon-btn">
                <Camera size={18} />
              </button>
              <button type="button" className="icon-btn">
                <Paperclip size={18} />
              </button>

              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 h-11 rounded-2xl border px-4 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
              />

              <button type="submit" className="send-btn">
                <SendHorizonal size={18} />
              </button>
            </form>
          </section>
        </div>
      </div>

      <style>{`
        .icon-btn {
          height: 40px;
          width: 40px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          transition: background .2s;
        }
        .icon-btn:hover { background: #f1f5f9; }
        .send-btn {
          height: 44px;
          width: 44px;
          border-radius: 16px;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .send-btn:hover { background: #4338ca; }
      `}</style>
    </div>
  );
};

export default MessengerPage;
