import { useParams, useNavigate } from 'react-router-dom';
import { Hash, Lock, ArrowDown, DotsThree } from "@phosphor-icons/react";
import { useChatContext } from "~/providers/ChatProvider";
import { useWebSocket } from "~/providers/WebSocketProvider";
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Message, User } from '~/types/chat';
import { useModal } from '~/providers/ModalProvider';
import { InviteUsersModal } from '~/components/modals/InviteUsersModal';
import { ChatInput } from '~/components/ChatInput';

export default function Channel() {
    const { id } = useParams();
    const { channels, users, loadChannelMessages, hasMoreMessages, onlineUsers } = useChatContext();
    const { addMessageListener, removeMessageListener, isConnected, reconnect } = useWebSocket();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { openModal, closeModal } = useModal();
    const navigate = useNavigate();

    // Create a map of user IDs to user data for efficient lookups
    const userMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
    }, [users]);

    // Helper function to get user initials
    const getUserInitials = (userId: string) => {
        const user = userMap[userId];
        if (user) {
            return (user.first_name[0] + user.last_name[0]).toUpperCase();
        }
        return userId.slice(0, 2).toUpperCase();
    };

    // Add this function near the top of the component, after the imports
    const getColorFromName = (name: string) => {
        // Generate a hash from the name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Convert hash to HSL color
        // Using HSL ensures good contrast with white text
        const h = Math.abs(hash % 360);
        return `hsl(${h}, 70%, 50%)`; // Saturation 70% and Lightness 50% for vibrant but readable colors
    };

    // Add this function after getColorFromName
    const getContrastColor = (hsl: string) => {
        // Extract the lightness value from the HSL string
        const lightness = parseInt(hsl.split(',')[2].replace('%)', ''));
        // Use black text for light backgrounds (lightness > 65), white for dark
        return lightness > 65 ? '#000000' : '#ffffff';
    };

    // Find the current channel
    const currentChannel = channels.find(channel => channel.id.toString() === id);

    // Update checkIfNearBottom to also set the button visibility
    const checkIfNearBottom = () => {
        const container = messageContainerRef.current;
        if (!container) return;
        
        const threshold = 100;
        const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        isNearBottomRef.current = isNear;
        setShowScrollButton(!isNear);
    };

    // Add scroll to bottom function
    const scrollToBottom = () => {
        messageContainerRef.current?.scrollTo({
            top: messageContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    };

    // Add this function to handle scroll
    const handleScroll = useCallback(() => {
        const container = messageContainerRef.current;
        if (!container) return;

        if (container.scrollTop <= 50 && hasMoreMessages && !isLoadingMessages && localMessages.length > 0 && currentChannel) {
            const scrollHeight = container.scrollHeight;
            
            const earliestMessage = localMessages.reduce((earliest, current) => 
                current.created_at < earliest.created_at ? current : earliest
            );
            
            fetch(`https://group-chat.brayden-b8b.workers.dev/channel/messages?before=${earliestMessage.id}`, {
                headers: {
                    'X-Session-Id': localStorage.getItem('session') || '',
                    'X-Channel-Id': currentChannel.id
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setLocalMessages(prev => 
                        [...prev, ...data.messages].sort((a, b) => a.created_at - b.created_at)
                    );
                    requestAnimationFrame(() => {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop = newScrollHeight - scrollHeight;
                    });
                }
            })
            .catch(error => console.error('Error loading more messages:', error));
        }

        checkIfNearBottom();
    }, [hasMoreMessages, isLoadingMessages, localMessages, currentChannel?.id]);

    // Update the messages effect to handle auto-scrolling
    useEffect(() => {
        if (id) {
            addMessageListener(id, (message) => {
                setLocalMessages(prev => [...prev, message]);
                // If user was already near bottom, scroll to bottom after message is added
                if (isNearBottomRef.current) {
                    // Use RAF to ensure DOM has updated
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
                const response = await fetch('https://group-chat.brayden-b8b.workers.dev/channel/messages', {
                    headers: {
                        'X-Session-Id': localStorage.getItem('session') || '',
                        'X-Channel-Id': currentChannel.id
                    }
                });

                const data = await response.json();
                if (data.success) {
                    // Reverse the messages array to show oldest first
                    setLocalMessages(data.messages.reverse());
                    // Immediately scroll to bottom without animation
                    setTimeout(() => {
                        messageContainerRef.current?.scrollTo({
                            top: messageContainerRef.current.scrollHeight,
                            behavior: 'instant' // Use 'instant' instead of 'smooth'
                        });
                    }, 10);
                } else {
                    console.error('Failed to fetch messages');
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [currentChannel?.id]);

    // Handle window focus and connection status
    useEffect(() => {
        const handleFocus = async () => {
            if (!isConnected()) {
                // Reconnect if needed
                reconnect();
                
                // Reload messages after a short delay to allow connection to establish
                // setTimeout(async () => {
                //     if (id) {
                //         try {
                //             // const response = await fetch(`/channels/messages`);
                //             const response = await fetch('https://group-chat.brayden-b8b.workers.dev/channel/messages', {
                //                 method: 'POST',
                //                 headers: {
                //                     'Content-Type': 'application/json',
                //                     'X-Channel-Id': id,
                //                     'X-Session-Id': localStorage.getItem('session') || '',
                //                 },
                //                 body: JSON.stringify({ content: message })
                //             });
                //             const data = await response.json();
                //             setLocalMessages(data);
                //         } catch (error) {
                //             console.error('Error reloading messages:', error);
                //         }
                //     }
                // }, 1000);
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [id, isConnected, reconnect]);

    // Add click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update the handleInviteUsers function
    const handleInviteUsers = () => {
        if (!currentChannel) return;
        openModal(<InviteUsersModal onClose={closeModal} channel={currentChannel} />);
        setShowDropdown(false);
    };

    const handleLeaveChannel = async () => {
        try {
            const response = await fetch(`https://group-chat.brayden-b8b.workers.dev/channels/${currentChannel?.id}/leave`, {
                method: 'POST',
                headers: {
                    'X-Session-Id': localStorage.getItem('session') || '',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to leave channel');
            }
            
            // Navigate to the root route after successfully leaving
            navigate('/channel/0');
            setShowDropdown(false);
        } catch (error) {
            console.error('Error leaving channel:', error);
        }
    };

    if (!currentChannel) {
        return <div className="p-4">Channel not found</div>;
    }

    const handleSubmit = async (e: React.FormEvent, assets: string[]) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch('https://group-chat.brayden-b8b.workers.dev/channel/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Channel-Id': currentChannel.id,
                    'X-Session-Id': localStorage.getItem('session') || '',
                },
                body: JSON.stringify({ 
                    content: message,
                    assets: assets 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // If the message was sent successfully, add it to the local messages
            if (data.success && data.message) {
                // setLocalMessages(prev => [...prev, data.message]);
                // Scroll to bottom if we're already near it
                if (isNearBottomRef.current) {
                    requestAnimationFrame(() => {
                        messageContainerRef.current?.scrollTo({
                            top: messageContainerRef.current.scrollHeight,
                            behavior: 'smooth'
                        });
                    });
                }
            }

            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Channel Header */}
            <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex-1">
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                        {currentChannel.is_private ? (
                            <Lock className="w-5 h-5 text-gray-500" />
                        ) : (
                            <Hash className="w-5 h-5 text-gray-500" />
                        )}
                        {currentChannel.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {currentChannel.description || "No description available"}
                    </p>
                </div>
                <div className="flex -space-x-2">
                    {users
                        .filter(user => currentChannel.member_ids.includes(user.id))
                        .map(user => (
                            <div 
                                key={user.id} 
                                className="relative"
                                title={`${user.first_name} ${user.last_name}`}
                            >
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-blue-500 text-white"
                                    style={{ 
                                        backgroundColor: getColorFromName(`${user.first_name} ${user.last_name}`),
                                        color: getContrastColor(getColorFromName(`${user.first_name} ${user.last_name}`))
                                    }}
                                >
                                    {getUserInitials(user.id)}
                                </div>
                                <div 
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                        ${onlineUsers.some(u => u.id === user.id) ? 'bg-green-500' : 'bg-gray-400'}`}
                                />
                            </div>
                        ))}
                </div>
                
                {/* Add the more button and dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                    >
                        <DotsThree weight="bold" className="w-6 h-6" />
                    </button>
                    
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg z-10 py-1">
                            <button
                                onClick={handleInviteUsers}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                                Invite Users
                            </button>
                            <button
                                onClick={handleLeaveChannel}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                                Leave Channel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Message List - Update the structure here */}
            <div className="flex-1 min-h-0 relative"> {/* Add relative positioning */}
                <div 
                    ref={messageContainerRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto p-4"
                >
                    {isLoadingMessages ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {localMessages.map((msg) => {
                                const user = userMap[msg.user_id];
                                const displayName = user 
                                    ? `${user.first_name} ${user.last_name}`
                                    : msg.user_id.split('-')[0];
                                const assets = JSON.parse(msg.assets) as string[];

                                return (
                                    <div key={msg.id} className="flex items-start group">
                                        {/* Avatar */}
                                        <div 
                                            className="w-9 h-9 rounded flex-shrink-0 flex items-center justify-center font-medium"
                                            style={{ 
                                                backgroundColor: getColorFromName(displayName),
                                                color: getContrastColor(getColorFromName(displayName))
                                            }}
                                        >
                                            {getUserInitials(msg.user_id)}
                                        </div>
                                        
                                        {/* Message content */}
                                        <div className="ml-2 min-w-0 flex-1">
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {displayName}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {formatDate(msg.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-gray-900 dark:text-gray-100">
                                                {msg.content}
                                            </p>
                                            {assets.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {assets.map((url, index) => (
                                                        <img 
                                                            key={index}
                                                            src={url}
                                                            alt="Uploaded content"
                                                            className="max-w-[300px] max-h-[300px] rounded-lg"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Add the scroll button */}
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <ArrowDown weight="bold" className="w-4 h-4" />
                        Scroll to latest
                    </button>
                )}
            </div>

            {/* Message Input */}
            <ChatInput 
                message={message}
                onChange={setMessage}
                onSubmit={handleSubmit}
                isSending={isSending}
                channelId={currentChannel.id}
                sessionId={localStorage.getItem('session') || ''}
            />
            {/* <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-300 dark:border-neutral-800">
                <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 rounded-lg p-2">
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Message #${currentChannel.name}`}
                        className="w-full resize-none bg-transparent focus:outline-none"
                        rows={3}
                        disabled={isSending}
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={isSending || !message.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send'
                            )}
                        </button>
                    </div>
                </div>
            </form> */}
        </div>
    );
} 