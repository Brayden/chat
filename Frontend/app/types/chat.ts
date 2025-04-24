export type Channel = {
    id: string
    name: string
    description: string | null
    is_private: boolean
    created_at: number
    member_count: number
    member_ids: string[]
}

export type User = {
    id: string
    email: string
    first_name: string
    last_name: string
    avatar: string | null
    status?: 'online' | 'offline'
}

export interface MessageAsset {
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface Message {
    id: string;
    channel_id: string;
    user_id: string;
    content: string;
    created_at: number;
    assets?: MessageAsset[];
} 