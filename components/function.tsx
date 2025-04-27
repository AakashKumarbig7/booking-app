import { useState, useEffect, use } from "react";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

interface State {
  user: any;
  company: any;
  storeName: string | null;
  timeFormat: string | null;
  timeZone: string | null;
  
 
}

export const functions = () => {
  const [state, setState] = useState<State>({
    user: null,
    company: null,
    storeName: null,
    timeFormat: "12 hours",
    timeZone: "Australia/Melbourne",

    
    
  });

  const saveStateToSessionStorage = (newState: State) => {
    sessionStorage.setItem("storeState", JSON.stringify(newState));
  };

  const fetchDetails = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user?.email) {

        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("store_admin", user.email)
          .single();
          console.log(companyData)

        const newState: State = {
          user,
          company: companyData ?? null,
          storeName: companyData?.name ?? null,
          timeFormat: companyData?.time_format ?? "12 hours",
          timeZone: companyData?.timezone ?? "Australia/Melbourne",
         
          

        };

        setState(newState);
        saveStateToSessionStorage(newState);
        // console.log(user)
      }
    } catch (error) {
      setState((prevState) => ({ ...prevState, loading: false })); 
    }
  };

  useEffect(() => {
    fetchDetails(); 
   supabase
      .channel("custom-all-channel-users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          fetchDetails(); 
        }
      )
      .subscribe();


    supabase
      .channel("custom-all-channel-companies")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "companies" },
        (payload) => {
          fetchDetails(); 
        }
      )
      .subscribe();
  }, []);

  return state;
};