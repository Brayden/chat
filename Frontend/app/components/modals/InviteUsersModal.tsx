import { useState } from 'react';
import { useChatContext } from '~/providers/ChatProvider';
import type { Channel } from '~/types/chat';

type InviteUsersModalProps = {
  onClose: () => void;
  channel: Channel;
}

export const InviteUsersModal = ({ onClose, channel }: InviteUsersModalProps) => {
  const { users } = useChatContext();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out users who are already in the channel
  const invitableUsers = users.filter(user => !channel.member_ids?.includes(user.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`https://group-chat.brayden-b8b.workers.dev/channels/${channel.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('session') || '',
        },
        body: JSON.stringify({
          userIds: selectedUsers
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to invite users');
      }

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to invite users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-4 bg-neutral-100 dark:bg-neutral-900">
      <h2 className="text-xl font-semibold mb-4">Invite users to {channel.name}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select users to invite
          </label>
          <div className="max-h-40 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-md">
            {invitableUsers.length === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-500">
                No users available to invite
              </div>
            ) : (
              invitableUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      setSelectedUsers(prev =>
                        e.target.checked
                          ? [...prev, user.id]
                          : prev.filter(id => id !== user.id)
                      );
                    }}
                    className="rounded border-neutral-300 dark:border-neutral-700 mr-2"
                  />
                  {user.first_name} {user.last_name}
                </label>
              ))
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || selectedUsers.length === 0}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Inviting...' : 'Invite Users'}
          </button>
        </div>
      </form>
    </div>
  );
}; 