"use client";

import LockIcon from "@mui/icons-material/Lock";
import { Alert, Button, ClickAwayListener, Popper } from "@mui/material";
import { useEffect, useState } from "react";

export function PremiumHistoryButton({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setOpen(false), 5000);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <>
      <Button type="button" variant="outlined" startIcon={<LockIcon />} disabled={disabled} onClick={(event) => { setAnchorEl(event.currentTarget); setOpen(true); }}>
        診断履歴（有料）
      </Button>
      <Popper open={open} anchorEl={anchorEl} placement="top" sx={{ zIndex: 1500 }} modifiers={[{ name: "offset", options: { offset: [0, 10] } }, { name: "preventOverflow", options: { padding: 8 } }]}>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Alert severity="info" variant="filled" onClose={() => setOpen(false)} sx={{ maxWidth: "calc(100vw - 16px)", boxShadow: "0 10px 28px rgba(12,42,94,.28)", whiteSpace: { xs: "normal", sm: "nowrap" } }}>
            有料プランにアップグレードすると閲覧できます
          </Alert>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
