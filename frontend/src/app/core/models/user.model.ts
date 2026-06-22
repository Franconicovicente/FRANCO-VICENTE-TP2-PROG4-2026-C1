export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  createdAt?: string;
}
 