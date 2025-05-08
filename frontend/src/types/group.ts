import { Portfolio } from "./portfolio";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    id: string;
    display_name: string | null;
    email: string | null;
  } | null;
}

export interface GroupPortfolio {
  id: string;
  group_id: string;
  portfolio_id: string;
  shared_by: string;
  shared_at: string;
  portfolios: Portfolio;
  profiles: {
    id: string;
    display_name: string | null;
    email: string | null;
  } | null;
}

export interface GroupComment {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    display_name: string | null;
    email: string | null;
  } | null;
}
