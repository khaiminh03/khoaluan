export interface UserType {
    _id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    role: "customer" | "supplier" | "admin";
  }
  
  export interface AppContextType {
    user: UserType | null;
    setUser: (user: UserType | null) => void;
    isSeller: boolean;
    setIsSeller: (isSeller: boolean) => void;
    navigate: (path: string) => void;
  }
  