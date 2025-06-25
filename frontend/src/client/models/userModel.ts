type Roles = "superuser" | "loggeduser" | "mentor"

export type UserPublic =  {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string;
  role: Roles
}