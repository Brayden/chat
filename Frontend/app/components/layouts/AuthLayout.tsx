import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Moon, Sun, Plus, Lock, SignOut, Chats } from "@phosphor-icons/react";
import { useChatContext } from "~/providers/ChatProvider";
import { useWebSocket } from "~/providers/WebSocketProvider";
import { useModal } from '~/providers/ModalProvider';
import { CreateChannelModal } from '~/components/modals/CreateChannelModal';

export default function AuthLayout() {
    const location = useLocation();
    const { channels, onlineUsers, offlineUsers, isLoadingChannels, users, updateUserStatus } = useChatContext();
    const { addMessageListener, removeMessageListener } = useWebSocket();
    const [showThemeDropdown, setShowThemeDropdown] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            return (savedTheme || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) as 'light' | 'dark';
        }
        return 'light';
    });
    const navigate = useNavigate();
    const { openModal, closeModal } = useModal();
    const [unreadChannels, setUnreadChannels] = useState<Set<string>>(new Set());

    // Get current user's initials
    const userInitials = useMemo(() => {
        if (typeof window === 'undefined') return '';
        
        const userId = localStorage.getItem('userId');
        const currentUser = users.find(user => user.id === userId);
        if (currentUser) {
            return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
        }
        return 'B';
    }, [users]);

    // Listen for user status changes
    useEffect(() => {
        const handleUserStatus = (message: any) => {
            if (message.type === 'USER_CONNECTED' || message.type === 'USER_DISCONNECTED') {
                updateUserStatus(
                    message.userId, 
                    message.type === 'USER_CONNECTED' ? 'online' : 'offline'
                );
            }
        };

        const handleNewMessage = (message: any) => {
            console.log('New message received:', message);
            if (message.type === 'NEW_MESSAGE') {
                const currentChannelId = location.pathname.split('/').pop();
                // If message is for a different channel than the current one, mark it as unread
                if (message.channelId !== currentChannelId) {
                    setUnreadChannels(prev => {
                        const next = new Set(prev);
                        next.add(message.channelId);
                        return next;
                    });
                }
            }
        };

        addMessageListener('NEW_MESSAGE', handleNewMessage);
        addMessageListener('USER_STATUS', handleUserStatus);

        return () => {
            removeMessageListener('NEW_MESSAGE');
            removeMessageListener('USER_STATUS');
        };
    }, [addMessageListener, removeMessageListener, updateUserStatus, location.pathname]);

    // Apply theme on initial render and theme changes
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    // Add after the previous useEffect
    useEffect(() => {
        const channelId = location.pathname.split('/').pop();
        if (channelId) {
            setUnreadChannels(prev => {
                const next = new Set(prev);
                next.delete(channelId);
                return next;
            });
        }
    }, [location.pathname]);

    const toggleTheme = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        setShowThemeDropdown(false);
    };

    const handleSignOut = async () => {
        try {
            const sessionId = localStorage.getItem('session');
            await fetch('https://group-chat.brayden-b8b.workers.dev/logout', {
                method: 'POST',
                headers: {
                    'X-Session-Id': sessionId || ''
                }
            });
            
            // Clear local storage
            localStorage.removeItem('session');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            
            // Redirect to login
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
        setShowThemeDropdown(false);
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex w-full justify-between border-b border-neutral-200 bg-neutral-50 py-1 pr-2 pl-6 transition-colors dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex flex-1 gap-2 items-center">
                    <Chats size={16} weight="fill" />
                    <div>Group<strong>Chat</strong></div>
                </div>

                <div className="flex flex-row-reverse flex-1 items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                            className="size-8 font-medium cursor-pointer bg-white dark:bg-neutral-900 hover:bg-neutral-200 hover:dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-all rounded flex items-center justify-center"
                        >
                            {userInitials}
                        </button>
                        
                        {showThemeDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
                                <div className="py-1">
                                    <button
                                        onClick={() => toggleTheme('light')}
                                        className="flex items-center px-4 py-2 text-sm w-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                    >
                                        <Sun size={16} className="mr-2" />
                                        Light
                                    </button>
                                    <button
                                        onClick={() => toggleTheme('dark')}
                                        className="flex items-center px-4 py-2 text-sm w-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                    >
                                        <Moon size={16} className="mr-2" />
                                        Dark
                                    </button>
                                    <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center px-4 py-2 text-sm w-full text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                    >
                                        <SignOut size={16} className="mr-2" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-56 px-3 pt-6 border-r border-neutral-200 transition-colors dark:border-neutral-800">
                    {/* Channels Section */}
                    <div className="px-2 mb-2 flex justify-between items-center">
                        <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                            Channels
                        </h2>
                        <Plus 
                            size={16} 
                            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
                            onClick={() => {
                                openModal(<CreateChannelModal onClose={closeModal} />);
                            }}
                        />
                    </div>
                    {isLoadingChannels ? (
                        <div className="px-2 py-1.5 text-sm text-neutral-500">Loading channels...</div>
                    ) : (
                        channels.map((channel) => (
                            <Link
                                key={channel.id}
                                to={`/channel/${channel.id}`}
                                className="flex items-center px-2 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded cursor-pointer"
                            >
                                <div className="flex items-center flex-1">
                                    {channel.is_private ? (
                                        <Lock size={14} className="mr-2" />
                                    ) : (
                                        <span className="mr-2">#</span>
                                    )}
                                    <span className={unreadChannels.has(channel.id) ? 'font-bold' : ''}>
                                        {channel.name}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}

                    {/* Users Section */}
                    <div className="px-2 mt-6 mb-2 flex justify-between items-center">
                        <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                            Users
                        </h2>
                        <Plus 
                            size={16} 
                            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer" 
                        />
                    </div>
                    {/* Online Users */}
                    {onlineUsers.map((user) => (
                        <div 
                            key={user.id}
                            className="flex items-center px-2 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded cursor-pointer"
                        >
                            <span className="mr-2 size-2 rounded-full bg-green-500"></span>
                            {user.first_name} {user.last_name}
                        </div>
                    ))}
                    {/* Offline Users */}
                    {offlineUsers.map((user) => (
                        <div 
                            key={user.id}
                            className="flex items-center px-2 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded cursor-pointer opacity-60"
                        >
                            <span className="mr-2 size-2 rounded-full bg-neutral-400"></span>
                            {user.first_name} {user.last_name}
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
} 