
export type Dict = {
  [key: string]: any
}

// Discord User
export type UserEntry = {
  id: string
  name: string
  avatar_url: string
}

// Discord Member
export type MemberEntry = {
  guild_id: string
  guild?: object
  user_id: string
  user: UserEntry

  display_name: string
  joined_at: string
  top_role: any
  top_role_id: string
};

export interface MemberListType {
  [key: string]: MemberEntry
};

export type QuoteListType = Array<QuoteEntryType>;

// Quote Entry Data
export type QuoteEntryType = {
  guild_id: string
  channel_id: string
  user_id: string
  guild?: string
  member: MemberEntry
  user: UserEntry

  message_id: string
  message: string
  timestamp: string
  attachments: string[]
}


export type CommandEntry = {
  id: string
  guild_id: string

  trigger: string
  response: string
  description: string

  // variables used by responses/reactions
  name?: string
  use_regex?: boolean
  multi_response?: boolean

  cooldown: boolean
  cooldown_rate: number
  cooldown_per: number
  cooldown_bucket: number
  cooldown_multiplier: number

  user_filter: string[]
}


