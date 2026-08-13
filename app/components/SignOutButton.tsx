"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "@mui/material";
import { signOut } from "next-auth/react";
import { setGlobalBusy } from "./GlobalBusyIndicator";

export function SignOutButton() {
  const logout = async () => {
    if (!window.confirm("ログアウトします。よろしいですか？")) return;
    setGlobalBusy(true);
    try {
      await signOut({ redirect: false });
      window.location.assign("/?skipOpening=1#top");
    } catch {
      setGlobalBusy(false);
    }
  };

  return <Button color="inherit" startIcon={<LogoutIcon />} onClick={() => void logout()}>ログアウト</Button>;
}
