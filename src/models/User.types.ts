export interface User {
  id: string;
  email: string;
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}
