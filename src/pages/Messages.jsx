import { useEffect, useRef, useState } from "react";
import "./Messages.css";
import { conversationsService } from "../services/api";

function ConversationItem({ convo, isActive, onClick }) {
  const initials = convo.title
    ? convo.title.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  return (
    <div className={`convItem ${isActive ? "convItem--active" : ""}`} onClick={() => onClick(convo)}>
      <div className="convItem__avatar">
        <span>{initials}</span>
      </div>
      <div className="convItem__body">
        <div className="convItem__top">
          <span className="convItem__name">{convo.title || "Conversation"}</span>
          <span className="convItem__time">{convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
        </div>
        <div className="convItem__bottom">
          <span className="convItem__preview">{convo.participants?.length ? `${convo.participants.length} participants` : "No messages yet"}</span>
          {convo.unreadCount > 0 && <span className="convItem__badge">{convo.unreadCount}</span>}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message, myId }) {
  const isMe = message.senderId === myId;
  return (
    <div className={`bubble__wrapper ${isMe ? "bubble__wrapper--me" : ""}`}>
      {!isMe && <span style={{ fontSize: "0.75rem", color: "#aaa", marginBottom: "2px" }}>{message.senderName}</span>}
      <div className={`bubble ${isMe ? "bubble--me" : "bubble--them"}`}>
        <p>{message.content}</p>
      </div>
      <span className="bubble__time">{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
    </div>
  );
}

export default function Messages() {
  const [convos, setConvos] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const myId = localStorage.getItem("userId");
  const bottomRef = useRef(null);

  useEffect(() => {
    conversationsService.list()
      .then((data) => {
        const list = Array.isArray(data?.conversations) ? data.conversations : (Array.isArray(data) ? data : []);
        setConvos(list);
        if (list.length > 0) setActiveConvo(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingConvos(false));
  }, []);

  useEffect(() => {
    if (!activeConvo) return;
    setLoadingMessages(true);
    conversationsService.getMessages(activeConvo.id)
      .then((data) => {
        const list = Array.isArray(data?.messages) ? data.messages : (Array.isArray(data) ? data : []);
        setMessages(list);
        // Mark as read
        conversationsService.markRead(activeConvo.id).catch(() => {});
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [activeConvo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = inputValue.trim();
    if (!text || !activeConvo || sending) return;
    setSending(true);
    try {
      const newMsg = await conversationsService.sendMessage(activeConvo.id, text);
      setMessages((prev) => [...prev, newMsg]);
      setInputValue("");
    } catch (err) {
      alert(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const filteredConvos = convos.filter((c) =>
    (c.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="msgPage">
      <aside className="msgSidebar">
        <div className="msgSidebar__logo">
          <img src="/logo.png" alt="NextHire" />
        </div>
        <h2 className="msgSidebar__heading">Messages</h2>
        <div className="msgSidebar__search">
          <i className="fa-solid fa-magnifying-glass" />
          <input type="text" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="msgSidebar__list">
          {loadingConvos && <p style={{ color: "#aaa", padding: "1rem" }}>Loading...</p>}
          {!loadingConvos && filteredConvos.length === 0 && <p style={{ color: "#aaa", padding: "1rem" }}>No conversations yet.</p>}
          {filteredConvos.map((convo) => (
            <ConversationItem key={convo.id} convo={convo} isActive={activeConvo?.id === convo.id} onClick={setActiveConvo} />
          ))}
        </div>
      </aside>

      <main className="msgChat">
        {!activeConvo ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#aaa" }}>
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <div className="msgChat__header">
              <div className="msgChat__headerLeft">
                <div className="msgChat__headerAvatar">
                  <span>{(activeConvo.title || "?").slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="msgChat__headerName">{activeConvo.title || "Conversation"}</h3>
                  <span className="msgChat__headerStatus">{activeConvo.participants?.length || 0} participants</span>
                </div>
              </div>
              <div className="msgChat__headerActions">
                <button className="msgChat__iconBtn" aria-label="More options"><i className="fa-solid fa-ellipsis-vertical" /></button>
              </div>
            </div>

            <div className="msgChat__body">
              {loadingMessages && <p style={{ color: "#aaa", textAlign: "center", padding: "2rem" }}>Loading messages...</p>}
              {!loadingMessages && messages.length === 0 && (
                <p style={{ color: "#aaa", textAlign: "center", padding: "2rem" }}>No messages yet. Say hello!</p>
              )}
              {messages.map((msg) => <ChatBubble key={msg.id} message={msg} myId={myId} />)}
              <div ref={bottomRef} />
            </div>

            <div className="msgChat__footer">
              <button className="msgChat__iconBtn" aria-label="Attach file"><i className="fa-solid fa-paperclip" /></button>
              <input className="msgChat__input" type="text" placeholder="Type a message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
              <button className="msgChat__iconBtn" aria-label="Emoji"><i className="fa-regular fa-face-smile" /></button>
              <button className="msgChat__sendBtn" onClick={handleSend} aria-label="Send message" disabled={sending}>
                <i className="fa-solid fa-paper-plane" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
