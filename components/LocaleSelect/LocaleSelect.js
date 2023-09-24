import React from "react";
import { useRouter } from "next/router";
import { Select, MenuItem } from "@mui/material";
import { setCookie } from 'cookies-next';

export default function LocaleSelect() {
    const { locale, push, pathname, query } = useRouter();
    const onLangChange = (e) => {
      const newLocale = e.target.value;
      setCookie('NEXT_LOCALE', newLocale);
      push({
          pathname,
          query
        }, {
          pathname,
          query
        }, { locale: newLocale }
      );
    }
    return (
        <Select value={locale} onChange={onLangChange} variant="standard">
            <MenuItem value="en">🇺🇸 EN</MenuItem>
            <MenuItem value="es">🇪🇸 ES</MenuItem>
        </Select>
    )
}
