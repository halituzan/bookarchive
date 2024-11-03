export interface UserProps {
  firstName?: string;
  lastName?: string;
  userName?: string;
  birthDate?: Date | null;
  gender?: number | null;
}

export interface userProfile extends UserProps {
  followType: number;
  followersCount: number;
  followingCount: number;
}
