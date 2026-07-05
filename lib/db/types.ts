export type ConversationStatus = "auto_answered" | "escalated" | "resolved";
export type BroadcastStatus = "sent" | "failed";

// NOTE: these are `type` aliases, not `interface`s, on purpose — TypeScript
// only treats plain object-literal types as satisfying the Supabase client's
// `Record<string, unknown>` (GenericTable) constraint, so an `interface` here
// would make every `.from(...)` call resolve to `never`.
export type Faq = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  line_user_id: string;
  line_message_id: string | null;
  message_text: string;
  answer_text: string | null;
  status: ConversationStatus;
  resolved_at: string | null;
  created_at: string;
};

export type Broadcast = {
  id: string;
  message_text: string;
  status: BroadcastStatus;
  error_message: string | null;
  created_at: string;
};

export type AppSettings = {
  id: number;
  line_channel_secret: string | null;
  line_channel_access_token: string | null;
  anthropic_api_key: string | null;
  owner_line_user_id: string | null;
  owner_line_user_id_confirmed: boolean;
  setup_code: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      faqs: {
        Row: Faq;
        Insert: Partial<Omit<Faq, "id" | "created_at" | "updated_at">> &
          Pick<Faq, "question" | "answer">;
        Update: Partial<Omit<Faq, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      conversations: {
        Row: Conversation;
        Insert: Partial<Omit<Conversation, "id" | "created_at">> &
          Pick<Conversation, "line_user_id" | "message_text">;
        Update: Partial<Omit<Conversation, "id" | "created_at">>;
        Relationships: [];
      };
      broadcasts: {
        Row: Broadcast;
        Insert: Partial<Omit<Broadcast, "id" | "created_at">> &
          Pick<Broadcast, "message_text">;
        Update: Partial<Omit<Broadcast, "id" | "created_at">>;
        Relationships: [];
      };
      app_settings: {
        Row: AppSettings;
        Insert: Partial<AppSettings>;
        Update: Partial<AppSettings>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
