import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, useRouteError, Meta, Links, ScrollRestoration, Scripts, Outlet, isRouteErrorResponse } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { createElement, useState, useRef, createContext, useContext, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { X, Lock, Chats, Sun, Moon, SignOut, Plus, Upload, Hash, DotsThree, ArrowDown } from "@phosphor-icons/react";
import { useNavigate, useLocation, Link, Outlet as Outlet$1, useParams as useParams$1 } from "react-router-dom";
async function handleRequest(request, responseStatusCode, responseHeaders, routerContext, _loadContext) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");
  const body = await renderToReadableStream(
    /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
    {
      onError(error) {
        responseStatusCode = 500;
        if (shellRendered) {
          console.error(error);
        }
      }
    }
  );
  shellRendered = true;
  if (userAgent && isbot(userAgent) || routerContext.isSpaMode) {
    await body.allReady;
  }
  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function withErrorBoundaryProps(ErrorBoundary3) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      error: useRouteError()
    };
    return createElement(ErrorBoundary3, props);
  };
}
const Loader = ({ className, size = 24 }) => /* @__PURE__ */ jsxs(
  "svg",
  {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    className,
    style: { height: size ?? void 0, width: size ?? void 0 },
    children: [
      /* @__PURE__ */ jsxs(
        "circle",
        {
          cx: "12",
          cy: "12",
          r: "9.5",
          fill: "none",
          strokeWidth: "2",
          strokeLinecap: "round",
          children: [
            /* @__PURE__ */ jsx(
              "animateTransform",
              {
                attributeName: "transform",
                type: "rotate",
                from: "0 12 12",
                to: "360 12 12",
                dur: "2s",
                repeatCount: "indefinite"
              }
            ),
            /* @__PURE__ */ jsx(
              "animate",
              {
                attributeName: "stroke-dasharray",
                values: "0 150;42 150;42 150",
                keyTimes: "0;0.5;1",
                dur: "1.5s",
                repeatCount: "indefinite"
              }
            ),
            /* @__PURE__ */ jsx(
              "animate",
              {
                attributeName: "stroke-dashoffset",
                values: "0;-16;-59",
                keyTimes: "0;0.5;1",
                dur: "1.5s",
                repeatCount: "indefinite"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "circle",
        {
          cx: "12",
          cy: "12",
          r: "9.5",
          fill: "none",
          opacity: 0.1,
          strokeWidth: "2",
          strokeLinecap: "round"
        }
      )
    ]
  }
);
const Slot = ({
  as,
  children,
  ...props
}) => {
  const Component = as;
  return /* @__PURE__ */ jsx(Component, { ...props, children });
};
const TooltipContext = createContext(null);
const TooltipProvider = ({
  children
}) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const showTimeout = useRef(null);
  const graceTimeout = useRef(null);
  const isWithinGracePeriod = useRef(false);
  const isTooltipShown = useRef(false);
  const showTooltip = (id, isFocused) => {
    if (showTimeout.current) clearTimeout(showTimeout.current);
    if (graceTimeout.current) clearTimeout(graceTimeout.current);
    isTooltipShown.current = false;
    if (isFocused) {
      setActiveTooltip(id);
      isTooltipShown.current = true;
    } else if (isWithinGracePeriod.current) {
      setActiveTooltip(id);
      isTooltipShown.current = true;
    } else {
      showTimeout.current = window.setTimeout(() => {
        setActiveTooltip(id);
        isTooltipShown.current = true;
      }, 600);
    }
  };
  const hideTooltip = () => {
    if (showTimeout.current) clearTimeout(showTimeout.current);
    setActiveTooltip(null);
    if (isTooltipShown.current) {
      isWithinGracePeriod.current = true;
      graceTimeout.current = window.setTimeout(() => {
        isWithinGracePeriod.current = false;
      }, 100);
    }
  };
  return /* @__PURE__ */ jsx(
    TooltipContext.Provider,
    {
      value: { activeTooltip, showTooltip, hideTooltip },
      children
    }
  );
};
const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context)
    throw new Error("useTooltip must be used within TooltipProvider");
  return context;
};
const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};
const Tooltip = ({ children, className, content, id }) => {
  const { activeTooltip, showTooltip, hideTooltip } = useTooltip();
  const [positionX, setPositionX] = useState(
    "center"
  );
  const [positionY, setPositionY] = useState("top");
  const [isHoverAvailable, setIsHoverAvailable] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const tooltipRef = useRef(null);
  useEffect(() => {
    setIsHoverAvailable(window.matchMedia("(hover: hover)").matches);
  }, []);
  const tooltipIdentifier = id ? id + content : content;
  const tooltipId = `tooltip-${id || content.replace(/\s+/g, "-")}`;
  const isVisible = activeTooltip === tooltipIdentifier;
  const detectCollision = () => {
    const ref = tooltipRef.current;
    if (ref) {
      const tooltipRect = ref.getBoundingClientRect();
      const { top, left, bottom, right } = tooltipRect;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      if (top <= 0) setPositionY("bottom");
      if (left <= 0) setPositionX("left");
      if (bottom >= viewportHeight) setPositionY("top");
      if (right >= viewportWidth) setPositionX("right");
    }
  };
  useLayoutEffect(() => {
    if (!isVisible) {
      setPositionX("center");
      setPositionY("top");
    } else {
      detectCollision();
    }
  }, [isVisible]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "aria-describedby": isVisible ? tooltipId : void 0,
      className: cn("relative inline-block", className),
      onMouseEnter: () => isHoverAvailable && showTooltip(tooltipIdentifier, false),
      onMouseLeave: () => hideTooltip(),
      onPointerDown: (e) => {
        if (e.pointerType === "mouse") {
          setIsPointer(true);
        }
      },
      onPointerUp: () => setIsPointer(false),
      onFocus: () => {
        if (isHoverAvailable) {
          isPointer ? showTooltip(tooltipIdentifier, false) : showTooltip(tooltipIdentifier, true);
        } else {
          hideTooltip();
        }
      },
      onBlur: () => hideTooltip(),
      children: [
        children,
        isVisible && /* @__PURE__ */ jsx(
          "span",
          {
            "aria-hidden": !isVisible,
            className: cn(
              "bg-ob-base-1000 text-ob-inverted absolute w-max rounded-md px-2 py-1 text-sm shadow before:absolute before:top-0 before:left-0 before:size-full before:scale-[1.5] before:bg-transparent",
              {
                "left-0 translate-x-0": positionX === "left",
                "right-0 translate-x-0": positionX === "right",
                "left-1/2 -translate-x-1/2": positionX === "center",
                "-bottom-7": positionY === "bottom",
                "-top-7": positionY === "top"
              }
            ),
            id: tooltipId,
            ref: tooltipRef,
            role: "tooltip",
            children: content
          }
        )
      ]
    }
  );
};
const ButtonComponent = ({
  as,
  children,
  className,
  disabled,
  displayContent = "items-last",
  external,
  href,
  loading,
  shape = "base",
  size = "base",
  title,
  toggled,
  variant = "secondary",
  ...props
}) => {
  return /* @__PURE__ */ jsxs(
    Slot,
    {
      as: as ?? "button",
      className: cn(
        "btn add-focus group interactive flex w-max shrink-0 items-center font-medium select-none",
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary",
          "btn-tertiary": variant === "tertiary",
          "btn-ghost": variant === "ghost",
          "btn-destructive": variant === "destructive",
          "add-size-sm gap-1": size === "sm",
          "add-size-md gap-1.5": size === "md",
          "add-size-base gap-2": size === "base",
          square: shape === "square",
          circular: shape === "circular",
          "flex-row-reverse": displayContent === "items-first",
          "add-disable": disabled,
          toggle: toggled
        },
        className
      ),
      disabled,
      href,
      rel: external ? "noopener noreferrer" : void 0,
      target: external ? "_blank" : void 0,
      ...props,
      children: [
        title,
        loading ? /* @__PURE__ */ jsx(
          "span",
          {
            className: cn({
              "w-3": size === "sm",
              "w-3.5": size === "md",
              "w-4": size === "base",
              "ease-bounce transition-[width] duration-300 starting:w-0": !children
            }),
            children: /* @__PURE__ */ jsx(Loader, { size: size === "sm" ? 12 : size === "md" ? 14 : 16 })
          }
        ) : children
      ]
    }
  );
};
const Button = ({ ...props }) => {
  return props.tooltip ? /* @__PURE__ */ jsx(Tooltip, { content: props.tooltip, className: props.className, id: props.id, children: /* @__PURE__ */ jsx(ButtonComponent, { ...props, className: void 0 }) }) : /* @__PURE__ */ jsx(ButtonComponent, { ...props });
};
const Card = ({
  as,
  children,
  className,
  ref,
  tabIndex,
  variant = "secondary"
}) => {
  const Component = as ?? "div";
  return /* @__PURE__ */ jsx(
    Component,
    {
      className: cn(
        "ll-btn w-full rounded-lg p-4",
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary"
        },
        className
      ),
      ref,
      tabIndex,
      children
    }
  );
};
const useClickOutside = (callback) => {
  const ref = useRef(null);
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref, callback]);
  return ref;
};
const Modal = ({
  className,
  children,
  clickOutsideToClose = false,
  isOpen,
  onClose
}) => {
  const modalRef = clickOutsideToClose ? useClickOutside(onClose) : useRef(null);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll(
      'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (firstElement) firstElement.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed top-0 left-0 z-50 flex h-screen w-full items-center justify-center bg-transparent p-6", children: [
    /* @__PURE__ */ jsx("div", { className: "fade fixed top-0 left-0 h-full w-full bg-black/5 backdrop-blur-[2px]" }),
    /* @__PURE__ */ jsxs(
      Card,
      {
        className: cn("reveal reveal-sm relative z-50 max-w-md", className),
        ref: modalRef,
        tabIndex: -1,
        children: [
          children,
          /* @__PURE__ */ jsx(
            Button,
            {
              "aria-label": "Close Modal",
              shape: "square",
              className: "absolute top-2 right-2",
              onClick: onClose,
              variant: "ghost",
              children: /* @__PURE__ */ jsx(X, { size: 16 })
            }
          )
        ]
      }
    )
  ] });
};
const ModalContext = createContext(void 0);
const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);
  const openModal = (content2) => {
    setContent(content2);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setContent(null);
  };
  return /* @__PURE__ */ jsxs(ModalContext.Provider, { value: { isOpen, content, openModal, closeModal }, children: [
    children,
    isOpen && /* @__PURE__ */ jsx(Modal, { isOpen, onClose: closeModal, children: content })
  ] });
};
const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
const userProfile = () => {
  return {
    isSignedIn: false,
    username: "Kier Eagan",
    avatar: "/images/avatar.jpg",
    email: "kier@lumon.org",
    credits: 190
  };
};
const UserContext = createContext(void 0);
const UserProvider = ({ children }) => {
  const initialProfile = userProfile();
  const [userProfileData, setUserProfileData] = useState(initialProfile);
  const setUserProfile = (profile) => {
    setUserProfileData(profile);
  };
  return /* @__PURE__ */ jsx(UserContext.Provider, { value: { ...userProfileData, setUserProfile }, children });
};
const WebSocketContext = createContext(void 0);
const WebSocketProvider = ({ children }) => {
  const [messageListeners] = useState({});
  const [globalMessageListeners] = useState([]);
  const [ws, setWs] = useState(null);
  const isConnected = () => {
    return Boolean(ws && ws.readyState === WebSocket.OPEN);
  };
  const connect = () => {
    if (isConnected()) {
      console.log("WebSocket already connected, skipping reconnection");
      return;
    }
    if (ws) {
      ws.close();
    }
    const userId = localStorage.getItem("userId") || "";
    const sessionId = localStorage.getItem("session") || "";
    const newWs = new WebSocket(`wss://group-chat.brayden-b8b.workers.dev/ws?sessionId=${encodeURIComponent(sessionId)}`);
    newWs.onopen = () => {
      if (messageListeners["USER_STATUS"]) {
        messageListeners["USER_STATUS"].forEach(
          (callback) => callback({ type: "USER_CONNECTED", userId })
        );
      }
    };
    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
      if (data.type === "NEW_MESSAGE" && data.message) {
        notifyNewMessage(data.message.channel_id, data.message);
        globalMessageListeners.forEach((callback) => callback(data));
      }
      if (data.type === "USER_CONNECTED" || data.type === "USER_DISCONNECTED") {
        if (messageListeners["USER_STATUS"]) {
          messageListeners["USER_STATUS"].forEach((callback) => callback(data));
        }
      }
    };
    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    newWs.onclose = () => {
      console.log("WebSocket connection closed");
    };
    setWs(newWs);
  };
  useEffect(() => {
    if (!ws) {
      connect();
    }
    const handleFocus = () => {
      if (!isConnected()) {
        console.log("Reconnecting WebSocket on window focus...");
        connect();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);
  const reconnect = () => {
    console.log("Manually reconnecting WebSocket...");
    connect();
  };
  const addMessageListener = (channelId, callback) => {
    if (channelId === "NEW_MESSAGE") {
      globalMessageListeners.push(callback);
    } else {
      if (!messageListeners[channelId]) {
        messageListeners[channelId] = [];
      }
      messageListeners[channelId].push(callback);
    }
  };
  const removeMessageListener = (channelId) => {
    if (channelId === "NEW_MESSAGE") {
      globalMessageListeners.length = 0;
    } else {
      delete messageListeners[channelId];
    }
  };
  const notifyNewMessage = (channelId, message) => {
    if (messageListeners[channelId]) {
      messageListeners[channelId].forEach((callback) => callback(message));
    }
  };
  const updateUserStatus = (userId, status) => {
    if (isConnected()) {
      ws.send(JSON.stringify({
        type: status === "online" ? "USER_CONNECTED" : "USER_DISCONNECTED",
        userId
      }));
    }
  };
  return /* @__PURE__ */ jsx(WebSocketContext.Provider, { value: {
    addMessageListener,
    removeMessageListener,
    notifyNewMessage,
    updateUserStatus,
    isConnected,
    reconnect
  }, children });
};
const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
const ChatContext = createContext(void 0);
const ChatProvider = ({ children }) => {
  const { updateUserStatus: wsUpdateUserStatus } = useWebSocket();
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch("https://group-chat.brayden-b8b.workers.dev/channels", {
          headers: {
            "X-Session-Id": localStorage.getItem("session") || ""
          }
        });
        const data = await response.json();
        if (data.success) {
          setChannels(data.channels);
        } else {
          console.error("Failed to fetch channels");
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoadingChannels(false);
      }
    };
    fetchChannels();
  }, []);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersResponse = await fetch("https://group-chat.brayden-b8b.workers.dev/users", {
          headers: {
            "X-Session-Id": localStorage.getItem("session") || ""
          }
        });
        const usersData = await usersResponse.json();
        if (!usersData.success) {
          console.error("Failed to fetch users");
          return;
        }
        const onlineResponse = await fetch("https://group-chat.brayden-b8b.workers.dev/users/online", {
          headers: {
            "X-Session-Id": localStorage.getItem("session") || ""
          }
        });
        const onlineData = await onlineResponse.json();
        if (!onlineData.success) {
          console.error("Failed to fetch online users");
          return;
        }
        const onlineUserIds = new Set(onlineData.onlineUsers.map((user) => user.id));
        const usersWithStatus = usersData.users.map((user) => ({
          ...user,
          status: onlineUserIds.has(user.id) ? "online" : "offline"
        }));
        setUsers(usersWithStatus);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);
  const onlineUsers = users.filter((user) => user.status === "online");
  const offlineUsers = users.filter((user) => user.status === "offline");
  const addChannel = (channel2) => {
    setChannels((prev) => [...prev, channel2]);
  };
  const removeChannel = (channelId) => {
    setChannels((prev) => prev.filter((channel2) => channel2.id !== channelId));
  };
  const updateUserStatus = (userId, status) => {
    setUsers(
      (prev) => prev.map(
        (user) => user.id === userId ? { ...user, status } : user
      )
    );
    wsUpdateUserStatus(userId, status);
  };
  const loadChannelMessages = async (channelId, before) => {
    try {
      setIsLoadingMessages(true);
      const url = new URL(`https://group-chat.brayden-b8b.workers.dev/channels/${channelId}/messages`);
      if (before) {
        url.searchParams.append("before", before);
      }
      const response = await fetch(url.toString(), {
        headers: {
          "X-Session-Id": localStorage.getItem("session") || "",
          "X-Channel-Id": channelId
        }
      });
      const data = await response.json();
      setMessages((prev) => before ? [...prev, ...data.messages] : data.messages);
      setHasMoreMessages(data.hasMore);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  return /* @__PURE__ */ jsx(
    ChatContext.Provider,
    {
      value: {
        channels,
        users,
        onlineUsers,
        offlineUsers,
        addChannel,
        removeChannel,
        updateUserStatus,
        isLoadingChannels,
        messages,
        loadChannelMessages,
        hasMoreMessages,
        isLoadingMessages
      },
      children
    }
  );
};
const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "bg-neutral-50 text-base text-neutral-900 antialiased transition-colors selection:bg-blue-700 selection:text-white dark:bg-neutral-950 dark:text-neutral-100",
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = withComponentProps(function App() {
  return /* @__PURE__ */ jsx(UserProvider, {
    children: /* @__PURE__ */ jsx(TooltipProvider, {
      children: /* @__PURE__ */ jsx(WebSocketProvider, {
        children: /* @__PURE__ */ jsx(ChatProvider, {
          children: /* @__PURE__ */ jsx(ModalProvider, {
            children: /* @__PURE__ */ jsx(Outlet, {})
          })
        })
      })
    })
  });
});
const ErrorBoundary = withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const login = withComponentProps(function Login() {
  useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("https://group-chat.brayden-b8b.workers.dev/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || "Invalid credentials");
        return;
      }
      localStorage.setItem("session", data.session.id);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/channel/0";
    } catch (error2) {
      setError("Failed to sign in");
      console.error("Authentication error:", error2);
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center",
    children: /* @__PURE__ */ jsxs("div", {
      className: "w-full max-w-md rounded-lg bg-white text-black p-8 shadow-md",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-center text-3xl font-bold tracking-tight",
          children: "Sign in to Chat"
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-center text-sm text-gray-600",
          children: "Please enter your credentials"
        })]
      }), /* @__PURE__ */ jsxs("form", {
        onSubmit: handleSubmit,
        className: "mt-8 space-y-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "space-y-4 rounded-md shadow-sm",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "email",
              className: "block text-sm font-medium text-gray-700",
              children: "Email Address"
            }), /* @__PURE__ */ jsx("input", {
              id: "email",
              name: "email",
              type: "email",
              value: credentials.email,
              onChange: handleChange,
              required: true,
              className: "relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              placeholder: "Enter your email"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "password",
              className: "block text-sm font-medium text-gray-700",
              children: "Password"
            }), /* @__PURE__ */ jsx("input", {
              id: "password",
              name: "password",
              type: "password",
              value: credentials.password,
              onChange: handleChange,
              required: true,
              className: "relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              placeholder: "Enter your password"
            })]
          })]
        }), error && /* @__PURE__ */ jsx("div", {
          className: "text-red-500 text-sm text-center",
          children: error
        }), /* @__PURE__ */ jsx("div", {
          children: /* @__PURE__ */ jsx("button", {
            type: "submit",
            disabled: isLoading,
            className: "group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50",
            children: isLoading ? "Signing in..." : "Sign in"
          })
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-4 text-center text-sm text-gray-600",
        children: /* @__PURE__ */ jsxs("p", {
          children: ["Don't have an account?", " ", /* @__PURE__ */ jsx("a", {
            href: "/register",
            className: "font-medium text-indigo-600 hover:text-indigo-500",
            children: "Sign up"
          })]
        })
      })]
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login
}, Symbol.toStringTag, { value: "Module" }));
const register = withComponentProps(function Register() {
  useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    avatar: null
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("https://group-chat.brayden-b8b.workers.dev/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || "Registration failed");
        return;
      }
      localStorage.setItem("session", data.session.id);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/channel/0";
    } catch (error2) {
      setError("Failed to register");
      console.error("Registration error:", error2);
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center",
    children: /* @__PURE__ */ jsxs("div", {
      className: "w-full max-w-md rounded-lg bg-white text-black p-8 shadow-md",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-center text-3xl font-bold tracking-tight",
          children: "Create your account"
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-center text-sm text-gray-600",
          children: "Join our chat community"
        })]
      }), /* @__PURE__ */ jsxs("form", {
        onSubmit: handleSubmit,
        className: "mt-8 space-y-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "space-y-4 rounded-md shadow-sm",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "email",
              className: "block text-sm font-medium text-gray-700",
              children: "Email Address"
            }), /* @__PURE__ */ jsx("input", {
              id: "email",
              name: "email",
              type: "email",
              value: credentials.email,
              onChange: handleChange,
              required: true,
              className: "relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              placeholder: "Enter your email"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "firstName",
              className: "block text-sm font-medium text-gray-700",
              children: "First Name"
            }), /* @__PURE__ */ jsx("input", {
              id: "firstName",
              name: "firstName",
              type: "text",
              value: credentials.firstName,
              onChange: handleChange,
              required: true,
              className: "relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              placeholder: "Enter your first name"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "lastName",
              className: "block text-sm font-medium text-gray-700",
              children: "Last Name"
            }), /* @__PURE__ */ jsx("input", {
              id: "lastName",
              name: "lastName",
              type: "text",
              value: credentials.lastName,
              onChange: handleChange,
              required: true,
              className: "relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              placeholder: "Enter your last name"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "password",
              className: "block text-sm font-medium text-gray-700",
              children: "Password"
            }), /* @__PURE__ */ jsx("input", {
              id: "password",
              name: "password",
              type: "password",
              value: credentials.password,
              onChange: handleChange,
              required: true,
              className: "relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              placeholder: "Create a password"
            })]
          })]
        }), error && /* @__PURE__ */ jsx("div", {
          className: "text-red-500 text-sm text-center",
          children: error
        }), /* @__PURE__ */ jsx("div", {
          children: /* @__PURE__ */ jsx("button", {
            type: "submit",
            disabled: isLoading,
            className: "group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50",
            children: isLoading ? "Creating account..." : "Create account"
          })
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-4 text-center text-sm text-gray-600",
        children: /* @__PURE__ */ jsxs("p", {
          children: ["Already have an account?", " ", /* @__PURE__ */ jsx("a", {
            href: "/auth/login",
            className: "font-medium text-indigo-600 hover:text-indigo-500",
            children: "Sign in"
          })]
        })
      })]
    })
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: register
}, Symbol.toStringTag, { value: "Module" }));
const CreateChannelModal = ({ onClose }) => {
  const { users, addChannel } = useChatContext();
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([
    localStorage.getItem("userId") || ""
    // Include current user by default
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("https://group-chat.brayden-b8b.workers.dev/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": localStorage.getItem("session") || ""
        },
        body: JSON.stringify({
          name: channelName,
          description,
          is_private: isPrivate,
          member_ids: selectedUsers
        })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create channel");
      }
      addChannel(data.channel);
      onClose();
    } catch (error2) {
      setError(error2 instanceof Error ? error2.message : "Failed to create channel");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-lg p-4 bg-neutral-100 dark:bg-neutral-900", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Create a new channel" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Channel name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: channelName,
            onChange: (e) => setChannelName(e.target.value),
            className: "w-full p-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800",
            placeholder: "e.g. project-discussion",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Description (optional)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: description,
            onChange: (e) => setDescription(e.target.value),
            className: "w-full p-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800",
            placeholder: "What's this channel about?"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            id: "private",
            checked: isPrivate,
            onChange: (e) => setIsPrivate(e.target.checked),
            className: "rounded border-neutral-300 dark:border-neutral-700"
          }
        ),
        /* @__PURE__ */ jsxs("label", { htmlFor: "private", className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(Lock, { size: 16 }),
          "Private channel"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Add members" }),
        /* @__PURE__ */ jsx("div", { className: "max-h-40 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-md", children: users.map((user) => /* @__PURE__ */ jsxs(
          "label",
          {
            className: "flex items-center px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: selectedUsers.includes(user.id),
                  onChange: (e) => {
                    setSelectedUsers(
                      (prev) => e.target.checked ? [...prev, user.id] : prev.filter((id) => id !== user.id)
                    );
                  },
                  className: "rounded border-neutral-300 dark:border-neutral-700 mr-2"
                }
              ),
              user.first_name,
              " ",
              user.last_name
            ]
          },
          user.id
        )) })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-sm", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading || !channelName.trim(),
            className: "px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed",
            children: isLoading ? "Creating..." : "Create Channel"
          }
        )
      ] })
    ] })
  ] });
};
const AuthLayout = withComponentProps(function AuthLayout2() {
  const location = useLocation();
  const {
    channels,
    onlineUsers,
    offlineUsers,
    isLoadingChannels,
    users,
    updateUserStatus
  } = useChatContext();
  const {
    addMessageListener,
    removeMessageListener
  } = useWebSocket();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
    return "light";
  });
  const navigate = useNavigate();
  const {
    openModal,
    closeModal
  } = useModal();
  const [unreadChannels, setUnreadChannels] = useState(/* @__PURE__ */ new Set());
  const userInitials = useMemo(() => {
    if (typeof window === "undefined") return "";
    const userId = localStorage.getItem("userId");
    const currentUser = users.find((user) => user.id === userId);
    if (currentUser) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    return "B";
  }, [users]);
  useEffect(() => {
    const handleUserStatus = (message) => {
      if (message.type === "USER_CONNECTED" || message.type === "USER_DISCONNECTED") {
        updateUserStatus(message.userId, message.type === "USER_CONNECTED" ? "online" : "offline");
      }
    };
    const handleNewMessage = (message) => {
      console.log("New message received:", message);
      if (message.type === "NEW_MESSAGE") {
        const currentChannelId = location.pathname.split("/").pop();
        if (message.channelId !== currentChannelId) {
          setUnreadChannels((prev) => {
            const next = new Set(prev);
            next.add(message.channelId);
            return next;
          });
        }
      }
    };
    addMessageListener("NEW_MESSAGE", handleNewMessage);
    addMessageListener("USER_STATUS", handleUserStatus);
    return () => {
      removeMessageListener("NEW_MESSAGE");
      removeMessageListener("USER_STATUS");
    };
  }, [addMessageListener, removeMessageListener, updateUserStatus, location.pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);
  useEffect(() => {
    const channelId = location.pathname.split("/").pop();
    if (channelId) {
      setUnreadChannels((prev) => {
        const next = new Set(prev);
        next.delete(channelId);
        return next;
      });
    }
  }, [location.pathname]);
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    setShowThemeDropdown(false);
  };
  const handleSignOut = async () => {
    try {
      const sessionId = localStorage.getItem("session");
      await fetch("https://group-chat.brayden-b8b.workers.dev/logout", {
        method: "POST",
        headers: {
          "X-Session-Id": sessionId || ""
        }
      });
      localStorage.removeItem("session");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setShowThemeDropdown(false);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col h-screen",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex w-full justify-between border-b border-neutral-200 bg-neutral-50 py-1 pr-2 pl-6 transition-colors dark:border-neutral-800 dark:bg-neutral-950",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-1 gap-2 items-center",
        children: [/* @__PURE__ */ jsx(Chats, {
          size: 16,
          weight: "fill"
        }), /* @__PURE__ */ jsxs("div", {
          children: ["Group", /* @__PURE__ */ jsx("strong", {
            children: "Chat"
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "flex flex-row-reverse flex-1 items-center gap-3",
        children: /* @__PURE__ */ jsxs("div", {
          className: "relative",
          children: [/* @__PURE__ */ jsx("button", {
            onClick: () => setShowThemeDropdown(!showThemeDropdown),
            className: "size-8 font-medium cursor-pointer bg-white dark:bg-neutral-900 hover:bg-neutral-200 hover:dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-all rounded flex items-center justify-center",
            children: userInitials
          }), showThemeDropdown && /* @__PURE__ */ jsx("div", {
            className: "absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50",
            children: /* @__PURE__ */ jsxs("div", {
              className: "py-1",
              children: [/* @__PURE__ */ jsxs("button", {
                onClick: () => toggleTheme("light"),
                className: "flex items-center px-4 py-2 text-sm w-full hover:bg-neutral-100 dark:hover:bg-neutral-700",
                children: [/* @__PURE__ */ jsx(Sun, {
                  size: 16,
                  className: "mr-2"
                }), "Light"]
              }), /* @__PURE__ */ jsxs("button", {
                onClick: () => toggleTheme("dark"),
                className: "flex items-center px-4 py-2 text-sm w-full hover:bg-neutral-100 dark:hover:bg-neutral-700",
                children: [/* @__PURE__ */ jsx(Moon, {
                  size: 16,
                  className: "mr-2"
                }), "Dark"]
              }), /* @__PURE__ */ jsx("div", {
                className: "h-px bg-neutral-200 dark:bg-neutral-700 my-1"
              }), /* @__PURE__ */ jsxs("button", {
                onClick: handleSignOut,
                className: "flex items-center px-4 py-2 text-sm w-full text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-700",
                children: [/* @__PURE__ */ jsx(SignOut, {
                  size: 16,
                  className: "mr-2"
                }), "Sign out"]
              })]
            })
          })]
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-1 overflow-hidden",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "w-56 px-3 pt-6 border-r border-neutral-200 transition-colors dark:border-neutral-800",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "px-2 mb-2 flex justify-between items-center",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase",
            children: "Channels"
          }), /* @__PURE__ */ jsx(Plus, {
            size: 16,
            className: "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer",
            onClick: () => {
              openModal(/* @__PURE__ */ jsx(CreateChannelModal, {
                onClose: closeModal
              }));
            }
          })]
        }), isLoadingChannels ? /* @__PURE__ */ jsx("div", {
          className: "px-2 py-1.5 text-sm text-neutral-500",
          children: "Loading channels..."
        }) : channels.map((channel2) => /* @__PURE__ */ jsx(Link, {
          to: `/channel/${channel2.id}`,
          className: "flex items-center px-2 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded cursor-pointer",
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex items-center flex-1",
            children: [channel2.is_private ? /* @__PURE__ */ jsx(Lock, {
              size: 14,
              className: "mr-2"
            }) : /* @__PURE__ */ jsx("span", {
              className: "mr-2",
              children: "#"
            }), /* @__PURE__ */ jsx("span", {
              className: unreadChannels.has(channel2.id) ? "font-bold" : "",
              children: channel2.name
            })]
          })
        }, channel2.id)), /* @__PURE__ */ jsxs("div", {
          className: "px-2 mt-6 mb-2 flex justify-between items-center",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase",
            children: "Users"
          }), /* @__PURE__ */ jsx(Plus, {
            size: 16,
            className: "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
          })]
        }), onlineUsers.map((user) => /* @__PURE__ */ jsxs("div", {
          className: "flex items-center px-2 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded cursor-pointer",
          children: [/* @__PURE__ */ jsx("span", {
            className: "mr-2 size-2 rounded-full bg-green-500"
          }), user.first_name, " ", user.last_name]
        }, user.id)), offlineUsers.map((user) => /* @__PURE__ */ jsxs("div", {
          className: "flex items-center px-2 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded cursor-pointer opacity-60",
          children: [/* @__PURE__ */ jsx("span", {
            className: "mr-2 size-2 rounded-full bg-neutral-400"
          }), user.first_name, " ", user.last_name]
        }, user.id))]
      }), /* @__PURE__ */ jsx("div", {
        className: "flex-1 overflow-y-auto",
        children: /* @__PURE__ */ jsx(Outlet$1, {})
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AuthLayout
}, Symbol.toStringTag, { value: "Module" }));
const overview = withComponentProps(function Overview() {
  return /* @__PURE__ */ jsx("div", {
    className: "p-8 px-12",
    children: /* @__PURE__ */ jsxs("div", {
      className: "w-full flex gap-10",
      children: [/* @__PURE__ */ jsx("div", {
        className: "w-2/3",
        children: "Left"
      }), /* @__PURE__ */ jsx("div", {
        className: "w-1/3",
        children: "Right"
      })]
    })
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: overview
}, Symbol.toStringTag, { value: "Module" }));
const InviteUsersModal = ({ onClose, channel: channel2 }) => {
  const { users } = useChatContext();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const invitableUsers = users.filter((user) => {
    var _a;
    return !((_a = channel2.member_ids) == null ? void 0 : _a.includes(user.id));
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`https://group-chat.brayden-b8b.workers.dev/channels/${channel2.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": localStorage.getItem("session") || ""
        },
        body: JSON.stringify({
          userIds: selectedUsers
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to invite users");
      }
      onClose();
    } catch (error2) {
      setError(error2 instanceof Error ? error2.message : "Failed to invite users");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-lg p-4 bg-neutral-100 dark:bg-neutral-900", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold mb-4", children: [
      "Invite users to ",
      channel2.name
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Select users to invite" }),
        /* @__PURE__ */ jsx("div", { className: "max-h-40 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-md", children: invitableUsers.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-sm text-neutral-500", children: "No users available to invite" }) : invitableUsers.map((user) => /* @__PURE__ */ jsxs(
          "label",
          {
            className: "flex items-center px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: selectedUsers.includes(user.id),
                  onChange: (e) => {
                    setSelectedUsers(
                      (prev) => e.target.checked ? [...prev, user.id] : prev.filter((id) => id !== user.id)
                    );
                  },
                  className: "rounded border-neutral-300 dark:border-neutral-700 mr-2"
                }
              ),
              user.first_name,
              " ",
              user.last_name
            ]
          },
          user.id
        )) })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-sm", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading || selectedUsers.length === 0,
            className: "px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed",
            children: isLoading ? "Inviting..." : "Invite Users"
          }
        )
      ] })
    ] })
  ] });
};
function ChatInput({
  message,
  onChange,
  onSubmit,
  isSending = false,
  channelId,
  sessionId
}) {
  const [pendingAssets, setPendingAssets] = useState([]);
  const fileInputRef = useRef(null);
  const handleFileSelect = async (files) => {
    const uploads = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("https://group-chat.brayden-b8b.workers.dev/channel/upload", {
        method: "POST",
        headers: {
          "X-Channel-Id": channelId,
          "X-Session-Id": sessionId
        },
        body: formData
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error("Upload failed");
      }
      return {
        url: data.url,
        filename: file.name,
        contentType: file.type,
        size: file.size
      };
    });
    try {
      const assets = await Promise.all(uploads);
      setPendingAssets([...pendingAssets, ...assets]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      onDrop: handleDrop,
      onDragOver: (e) => e.preventDefault(),
      className: "relative",
      children: /* @__PURE__ */ jsx("form", { onSubmit: (e) => {
        e.preventDefault();
        onSubmit(e, pendingAssets.map((asset) => asset.url));
        setPendingAssets([]);
      }, className: "p-4 border-t border-neutral-300 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("div", { className: "border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 rounded-lg p-2", children: [
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: message,
            onChange: (e) => onChange(e.target.value),
            placeholder: "Message #channel-name",
            className: "w-full resize-none bg-transparent focus:outline-none",
            rows: 3,
            disabled: isSending
          }
        ),
        pendingAssets.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 mt-2", children: pendingAssets.map((asset) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center gap-1 px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800",
            children: [
              /* @__PURE__ */ jsx("span", { children: asset.filename }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setPendingAssets(
                    pendingAssets.filter((a) => a.url !== asset.url)
                  ),
                  className: "hover:text-neutral-500",
                  children: "×"
                }
              )
            ]
          },
          asset.url
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end items-center gap-2 mt-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                var _a;
                return (_a = fileInputRef.current) == null ? void 0 : _a.click();
              },
              className: "p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded",
              children: /* @__PURE__ */ jsx(Upload, { size: 16 })
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              multiple: true,
              className: "hidden",
              onChange: (e) => handleFileSelect(e.target.files)
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isSending || !message.trim(),
              className: "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
              children: isSending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
                "Sending..."
              ] }) : "Send"
            }
          )
        ] })
      ] }) })
    }
  );
}
const channel = withComponentProps(function Channel() {
  const {
    id
  } = useParams$1();
  const {
    channels,
    users,
    loadChannelMessages,
    hasMoreMessages,
    onlineUsers
  } = useChatContext();
  const {
    addMessageListener,
    removeMessageListener,
    isConnected,
    reconnect
  } = useWebSocket();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messageContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const {
    openModal,
    closeModal
  } = useModal();
  const navigate = useNavigate();
  const userMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }, [users]);
  const getUserInitials = (userId) => {
    const user = userMap[userId];
    if (user) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    }
    return userId.slice(0, 2).toUpperCase();
  };
  const getColorFromName = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 50%)`;
  };
  const getContrastColor = (hsl) => {
    const lightness = parseInt(hsl.split(",")[2].replace("%)", ""));
    return lightness > 65 ? "#000000" : "#ffffff";
  };
  const currentChannel = channels.find((channel2) => channel2.id.toString() === id);
  const checkIfNearBottom = () => {
    const container = messageContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    isNearBottomRef.current = isNear;
    setShowScrollButton(!isNear);
  };
  const scrollToBottom = () => {
    var _a;
    (_a = messageContainerRef.current) == null ? void 0 : _a.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
  };
  const handleScroll = useCallback(() => {
    const container = messageContainerRef.current;
    if (!container) return;
    if (container.scrollTop <= 50 && hasMoreMessages && !isLoadingMessages && localMessages.length > 0 && currentChannel) {
      const scrollHeight = container.scrollHeight;
      const earliestMessage = localMessages.reduce((earliest, current) => current.created_at < earliest.created_at ? current : earliest);
      fetch(`https://group-chat.brayden-b8b.workers.dev/channel/messages?before=${earliestMessage.id}`, {
        headers: {
          "X-Session-Id": localStorage.getItem("session") || "",
          "X-Channel-Id": currentChannel.id
        }
      }).then((response) => response.json()).then((data) => {
        if (data.success) {
          setLocalMessages((prev) => [...prev, ...data.messages].sort((a, b) => a.created_at - b.created_at));
          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - scrollHeight;
          });
        }
      }).catch((error) => console.error("Error loading more messages:", error));
    }
    checkIfNearBottom();
  }, [hasMoreMessages, isLoadingMessages, localMessages, currentChannel == null ? void 0 : currentChannel.id]);
  useEffect(() => {
    if (id) {
      addMessageListener(id, (message2) => {
        setLocalMessages((prev) => [...prev, message2]);
        if (isNearBottomRef.current) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const container = messageContainerRef.current;
              if (container) {
                container.scrollTop = container.scrollHeight;
              }
            });
          });
        }
      });
      return () => {
        removeMessageListener(id);
      };
    }
  }, [id]);
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChannel) return;
      setIsLoadingMessages(true);
      try {
        const response = await fetch("https://group-chat.brayden-b8b.workers.dev/channel/messages", {
          headers: {
            "X-Session-Id": localStorage.getItem("session") || "",
            "X-Channel-Id": currentChannel.id
          }
        });
        const data = await response.json();
        if (data.success) {
          setLocalMessages(data.messages.reverse());
          setTimeout(() => {
            var _a;
            (_a = messageContainerRef.current) == null ? void 0 : _a.scrollTo({
              top: messageContainerRef.current.scrollHeight,
              behavior: "instant"
              // Use 'instant' instead of 'smooth'
            });
          }, 10);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [currentChannel == null ? void 0 : currentChannel.id]);
  useEffect(() => {
    const handleFocus = async () => {
      if (!isConnected()) {
        reconnect();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [id, isConnected, reconnect]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleInviteUsers = () => {
    if (!currentChannel) return;
    openModal(/* @__PURE__ */ jsx(InviteUsersModal, {
      onClose: closeModal,
      channel: currentChannel
    }));
    setShowDropdown(false);
  };
  const handleLeaveChannel = async () => {
    try {
      const response = await fetch(`https://group-chat.brayden-b8b.workers.dev/channels/${currentChannel == null ? void 0 : currentChannel.id}/leave`, {
        method: "POST",
        headers: {
          "X-Session-Id": localStorage.getItem("session") || ""
        }
      });
      if (!response.ok) {
        throw new Error("Failed to leave channel");
      }
      navigate("/channel/0");
      setShowDropdown(false);
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  };
  if (!currentChannel) {
    return /* @__PURE__ */ jsx("div", {
      className: "p-4",
      children: "Channel not found"
    });
  }
  const handleSubmit = async (e, assets) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      const response = await fetch("https://group-chat.brayden-b8b.workers.dev/channel/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Channel-Id": currentChannel.id,
          "X-Session-Id": localStorage.getItem("session") || ""
        },
        body: JSON.stringify({
          content: message,
          assets
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      if (data.success && data.message) {
        if (isNearBottomRef.current) {
          requestAnimationFrame(() => {
            var _a;
            (_a = messageContainerRef.current) == null ? void 0 : _a.scrollTo({
              top: messageContainerRef.current.scrollHeight,
              behavior: "smooth"
            });
          });
        }
      }
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1e3).toLocaleString();
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col h-full",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex-1",
        children: [/* @__PURE__ */ jsxs("h1", {
          className: "text-lg font-semibold flex items-center gap-2",
          children: [currentChannel.is_private ? /* @__PURE__ */ jsx(Lock, {
            className: "w-5 h-5 text-gray-500"
          }) : /* @__PURE__ */ jsx(Hash, {
            className: "w-5 h-5 text-gray-500"
          }), currentChannel.name]
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-gray-500",
          children: currentChannel.description || "No description available"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "flex -space-x-2",
        children: users.filter((user) => currentChannel.member_ids.includes(user.id)).map((user) => /* @__PURE__ */ jsxs("div", {
          className: "relative",
          title: `${user.first_name} ${user.last_name}`,
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-blue-500 text-white",
            style: {
              backgroundColor: getColorFromName(`${user.first_name} ${user.last_name}`),
              color: getContrastColor(getColorFromName(`${user.first_name} ${user.last_name}`))
            },
            children: getUserInitials(user.id)
          }), /* @__PURE__ */ jsx("div", {
            className: `absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                        ${onlineUsers.some((u) => u.id === user.id) ? "bg-green-500" : "bg-gray-400"}`
          })]
        }, user.id))
      }), /* @__PURE__ */ jsxs("div", {
        className: "relative",
        ref: dropdownRef,
        children: [/* @__PURE__ */ jsx("button", {
          onClick: () => setShowDropdown(!showDropdown),
          className: "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full",
          children: /* @__PURE__ */ jsx(DotsThree, {
            weight: "bold",
            className: "w-6 h-6"
          })
        }), showDropdown && /* @__PURE__ */ jsxs("div", {
          className: "absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg z-10 py-1",
          children: [/* @__PURE__ */ jsx("button", {
            onClick: handleInviteUsers,
            className: "w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700",
            children: "Invite Users"
          }), /* @__PURE__ */ jsx("button", {
            onClick: handleLeaveChannel,
            className: "w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-700",
            children: "Leave Channel"
          })]
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex-1 min-h-0 relative",
      children: [" ", /* @__PURE__ */ jsx("div", {
        ref: messageContainerRef,
        onScroll: handleScroll,
        className: "h-full overflow-y-auto p-4",
        children: isLoadingMessages ? /* @__PURE__ */ jsx("div", {
          className: "flex justify-center items-center h-full",
          children: /* @__PURE__ */ jsx("div", {
            className: "w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          })
        }) : /* @__PURE__ */ jsx("div", {
          className: "space-y-4",
          children: localMessages.map((msg) => {
            const user = userMap[msg.user_id];
            const displayName = user ? `${user.first_name} ${user.last_name}` : msg.user_id.split("-")[0];
            const assets = JSON.parse(msg.assets);
            return /* @__PURE__ */ jsxs("div", {
              className: "flex items-start group",
              children: [/* @__PURE__ */ jsx("div", {
                className: "w-9 h-9 rounded flex-shrink-0 flex items-center justify-center font-medium",
                style: {
                  backgroundColor: getColorFromName(displayName),
                  color: getContrastColor(getColorFromName(displayName))
                },
                children: getUserInitials(msg.user_id)
              }), /* @__PURE__ */ jsxs("div", {
                className: "ml-2 min-w-0 flex-1",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "font-medium text-gray-900 dark:text-gray-100",
                    children: displayName
                  }), /* @__PURE__ */ jsx("span", {
                    className: "ml-2 text-xs text-gray-500",
                    children: formatDate(msg.created_at)
                  })]
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-gray-900 dark:text-gray-100",
                  children: msg.content
                }), assets.length > 0 && /* @__PURE__ */ jsx("div", {
                  className: "mt-2 flex flex-wrap gap-2",
                  children: assets.map((url, index) => /* @__PURE__ */ jsx("img", {
                    src: url,
                    alt: "Uploaded content",
                    className: "max-w-[300px] max-h-[300px] rounded-lg"
                  }, index))
                })]
              })]
            }, msg.id);
          })
        })
      }), showScrollButton && /* @__PURE__ */ jsxs("button", {
        onClick: scrollToBottom,
        className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 flex items-center gap-2",
        children: [/* @__PURE__ */ jsx(ArrowDown, {
          weight: "bold",
          className: "w-4 h-4"
        }), "Scroll to latest"]
      })]
    }), /* @__PURE__ */ jsx(ChatInput, {
      message,
      onChange: setMessage,
      onSubmit: handleSubmit,
      isSending,
      channelId: currentChannel.id,
      sessionId: localStorage.getItem("session") || ""
    })]
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: channel
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Brw1evjV.js", "imports": ["/assets/chunk-GNGMS2XR-BqdPGk2M.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/root-BmJSjV96.js", "imports": ["/assets/chunk-GNGMS2XR-BqdPGk2M.js", "/assets/with-props-ap4d8DRX.js", "/assets/ChatProvider-DcM48Aw1.js", "/assets/TooltipProvider-O3xjTkkc.js"], "css": ["/assets/root-Dxbkc3_X.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth/login": { "id": "routes/auth/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/login-C05GF8TF.js", "imports": ["/assets/with-props-ap4d8DRX.js", "/assets/chunk-GNGMS2XR-BqdPGk2M.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth/register": { "id": "routes/auth/register", "parentId": "root", "path": "register", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/register-Ci6b5nxx.js", "imports": ["/assets/with-props-ap4d8DRX.js", "/assets/chunk-GNGMS2XR-BqdPGk2M.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "components/layouts/AuthLayout": { "id": "components/layouts/AuthLayout", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/AuthLayout-D1KmT5LH.js", "imports": ["/assets/with-props-ap4d8DRX.js", "/assets/chunk-GNGMS2XR-BqdPGk2M.js", "/assets/ChatProvider-DcM48Aw1.js", "/assets/Lock-DzxvihWO.js", "/assets/TooltipProvider-O3xjTkkc.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/overview": { "id": "routes/overview", "parentId": "components/layouts/AuthLayout", "path": "overview", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/overview-DQWCqx4E.js", "imports": ["/assets/with-props-ap4d8DRX.js", "/assets/chunk-GNGMS2XR-BqdPGk2M.js", "/assets/TooltipProvider-O3xjTkkc.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/channel": { "id": "routes/channel", "parentId": "components/layouts/AuthLayout", "path": "channel/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/channel-oGv3tBiL.js", "imports": ["/assets/with-props-ap4d8DRX.js", "/assets/chunk-GNGMS2XR-BqdPGk2M.js", "/assets/ChatProvider-DcM48Aw1.js", "/assets/Lock-DzxvihWO.js", "/assets/TooltipProvider-O3xjTkkc.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-ab9259dd.js", "version": "ab9259dd" };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/auth/login": {
    id: "routes/auth/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/auth/register": {
    id: "routes/auth/register",
    parentId: "root",
    path: "register",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "components/layouts/AuthLayout": {
    id: "components/layouts/AuthLayout",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/overview": {
    id: "routes/overview",
    parentId: "components/layouts/AuthLayout",
    path: "overview",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/channel": {
    id: "routes/channel",
    parentId: "components/layouts/AuthLayout",
    path: "channel/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routes,
  ssr
};
