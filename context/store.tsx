"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { supabase } from "@/utils/supabase/client";

interface UserData {
  email: any;
}

interface ContextProps {
  user: UserData | null;
  setUser: Dispatch<SetStateAction<UserData | null>>;
}

const GlobalContext = createContext<ContextProps>({
  user: null,
  setUser: () => null,
});

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  // const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const  data  = await supabase.auth.getUser();
        if (!data.data?.user?.email) {
            console.log("No logged-in user found");
            return;
          }

          const {data : user, error} = await supabase
          .from('users')
          .select('*')
          .eq('email', data.data?.user?.email)
          .single();

          if (error) {
            console.log(error);
            return;
          }
        //   console.log(user);
          setUser(user);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, []);
  return (
    <>
      <GlobalContext.Provider value={{ user, setUser }}>
        {children}
      </GlobalContext.Provider>
    </>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
