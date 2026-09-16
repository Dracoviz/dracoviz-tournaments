import React from "react";
import { useRouter } from "next/router";
import { Select, MenuItem } from "@mui/material";
import { setCookie } from 'cookies-next';
import { track } from "../../utils/analytics";
import { EVENT, PARAM } from "../../utils/analyticsEvents";

export default function LocaleSelect() {
    const { locale, push, pathname, query } = useRouter();
    const onLangChange = (e) => {
      const newLocale = e.target.value;
      track(EVENT.LOCALE_CHANGED, { [PARAM.LOCALE]: newLocale });
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
            <MenuItem value="en">🇺🇸 English</MenuItem>
            <MenuItem value="es">🇪🇸 Spanish</MenuItem>
            <MenuItem value="it">🇮🇹 Italian</MenuItem>
            <MenuItem value="pt">🇧🇷 Portuguese (Brasil)</MenuItem>
            <MenuItem value="jp">🇯🇵 Japanese</MenuItem>
            <MenuItem value="kr">🇰🇷 Korean</MenuItem>
            <MenuItem value="th">🇹🇭 Thai</MenuItem>
        </Select>
    )
}
