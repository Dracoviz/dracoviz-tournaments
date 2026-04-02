import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import React, { useEffect, useState } from "react";
import {
  Button, Tabs, Tab,
  Switch, FormControlLabel, TextField, Autocomplete,
} from "@mui/material";
import GridContainer from "/components/Grid/GridContainer.js";
import GridItem from "/components/Grid/GridItem.js";
import CustomInput from "/components/CustomInput/CustomInput.js";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "next-i18next";
import CircularProgress from "@mui/material/CircularProgress";

function countryCodeToFlagEmoji(countryCode) {
  if (countryCode == null || countryCode === '') return '';
  const code = countryCode === 'uk' ? 'gb' : countryCode;
  return Array.from(code.toUpperCase())
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('');
}

function formatFriendCode(value) {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

const PRONOUN_OPTIONS = [
  { value: 'he/him', key: 'pronoun_he_him' },
  { value: 'she/her', key: 'pronoun_she_her' },
  { value: 'they/them', key: 'pronoun_they_them' },
  { value: 'he/they', key: 'pronoun_he_they' },
  { value: 'she/they', key: 'pronoun_she_they' },
  { value: 'any pronouns', key: 'pronoun_any' },
  { value: 'ask me', key: 'pronoun_ask_me' },
];

const COUNTRY_LIST = [
  { code: 'ad', name: 'Andorra' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'af', name: 'Afghanistan' },
  { code: 'ag', name: 'Antigua and Barbuda' },
  { code: 'ai', name: 'Anguilla' },
  { code: 'al', name: 'Albania' },
  { code: 'am', name: 'Armenia' },
  { code: 'ao', name: 'Angola' },
  { code: 'ar', name: 'Argentina' },
  { code: 'as', name: 'American Samoa' },
  { code: 'at', name: 'Austria' },
  { code: 'au', name: 'Australia' },
  { code: 'aw', name: 'Aruba' },
  { code: 'ax', name: '\u00c5land Islands' },
  { code: 'az', name: 'Azerbaijan' },
  { code: 'ba', name: 'Bosnia and Herzegovina' },
  { code: 'bb', name: 'Barbados' },
  { code: 'bd', name: 'Bangladesh' },
  { code: 'be', name: 'Belgium' },
  { code: 'bf', name: 'Burkina Faso' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'bh', name: 'Bahrain' },
  { code: 'bi', name: 'Burundi' },
  { code: 'bj', name: 'Benin' },
  { code: 'bl', name: 'Saint Barth\u00e9lemy' },
  { code: 'bm', name: 'Bermuda' },
  { code: 'bn', name: 'Brunei' },
  { code: 'bo', name: 'Bolivia' },
  { code: 'bq', name: 'Caribbean Netherlands' },
  { code: 'br', name: 'Brazil' },
  { code: 'bs', name: 'Bahamas' },
  { code: 'bt', name: 'Bhutan' },
  { code: 'bw', name: 'Botswana' },
  { code: 'by', name: 'Belarus' },
  { code: 'bz', name: 'Belize' },
  { code: 'ca', name: 'Canada' },
  { code: 'cc', name: 'Cocos (Keeling) Islands' },
  { code: 'cd', name: 'Congo (DRC)' },
  { code: 'cf', name: 'Central African Republic' },
  { code: 'cg', name: 'Congo (Republic)' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'ci', name: "C\u00f4te d'Ivoire" },
  { code: 'ck', name: 'Cook Islands' },
  { code: 'cl', name: 'Chile' },
  { code: 'cm', name: 'Cameroon' },
  { code: 'cn', name: 'China' },
  { code: 'co', name: 'Colombia' },
  { code: 'cr', name: 'Costa Rica' },
  { code: 'cu', name: 'Cuba' },
  { code: 'cv', name: 'Cape Verde' },
  { code: 'cw', name: 'Cura\u00e7ao' },
  { code: 'cx', name: 'Christmas Island' },
  { code: 'cy', name: 'Cyprus' },
  { code: 'cz', name: 'Czech Republic' },
  { code: 'de', name: 'Germany' },
  { code: 'dj', name: 'Djibouti' },
  { code: 'dk', name: 'Denmark' },
  { code: 'dm', name: 'Dominica' },
  { code: 'do', name: 'Dominican Republic' },
  { code: 'dz', name: 'Algeria' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'ee', name: 'Estonia' },
  { code: 'eg', name: 'Egypt' },
  { code: 'eh', name: 'Western Sahara' },
  { code: 'er', name: 'Eritrea' },
  { code: 'es', name: 'Spain' },
  { code: 'et', name: 'Ethiopia' },
  { code: 'fi', name: 'Finland' },
  { code: 'fj', name: 'Fiji' },
  { code: 'fk', name: 'Falkland Islands' },
  { code: 'fm', name: 'Micronesia' },
  { code: 'fo', name: 'Faroe Islands' },
  { code: 'fr', name: 'France' },
  { code: 'ga', name: 'Gabon' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'gd', name: 'Grenada' },
  { code: 'ge', name: 'Georgia' },
  { code: 'gf', name: 'French Guiana' },
  { code: 'gg', name: 'Guernsey' },
  { code: 'gh', name: 'Ghana' },
  { code: 'gi', name: 'Gibraltar' },
  { code: 'gl', name: 'Greenland' },
  { code: 'gm', name: 'Gambia' },
  { code: 'gn', name: 'Guinea' },
  { code: 'gp', name: 'Guadeloupe' },
  { code: 'gq', name: 'Equatorial Guinea' },
  { code: 'gr', name: 'Greece' },
  { code: 'gt', name: 'Guatemala' },
  { code: 'gu', name: 'Guam' },
  { code: 'gw', name: 'Guinea-Bissau' },
  { code: 'gy', name: 'Guyana' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'hn', name: 'Honduras' },
  { code: 'hr', name: 'Croatia' },
  { code: 'ht', name: 'Haiti' },
  { code: 'hu', name: 'Hungary' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' },
  { code: 'im', name: 'Isle of Man' },
  { code: 'in', name: 'India' },
  { code: 'iq', name: 'Iraq' },
  { code: 'ir', name: 'Iran' },
  { code: 'is', name: 'Iceland' },
  { code: 'it', name: 'Italy' },
  { code: 'je', name: 'Jersey' },
  { code: 'jm', name: 'Jamaica' },
  { code: 'jo', name: 'Jordan' },
  { code: 'jp', name: 'Japan' },
  { code: 'ke', name: 'Kenya' },
  { code: 'kg', name: 'Kyrgyzstan' },
  { code: 'kh', name: 'Cambodia' },
  { code: 'ki', name: 'Kiribati' },
  { code: 'km', name: 'Comoros' },
  { code: 'kn', name: 'Saint Kitts and Nevis' },
  { code: 'kp', name: 'North Korea' },
  { code: 'kr', name: 'South Korea' },
  { code: 'kw', name: 'Kuwait' },
  { code: 'ky', name: 'Cayman Islands' },
  { code: 'kz', name: 'Kazakhstan' },
  { code: 'la', name: 'Laos' },
  { code: 'lb', name: 'Lebanon' },
  { code: 'lc', name: 'Saint Lucia' },
  { code: 'li', name: 'Liechtenstein' },
  { code: 'lk', name: 'Sri Lanka' },
  { code: 'lr', name: 'Liberia' },
  { code: 'ls', name: 'Lesotho' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'lu', name: 'Luxembourg' },
  { code: 'lv', name: 'Latvia' },
  { code: 'ly', name: 'Libya' },
  { code: 'ma', name: 'Morocco' },
  { code: 'mc', name: 'Monaco' },
  { code: 'md', name: 'Moldova' },
  { code: 'me', name: 'Montenegro' },
  { code: 'mf', name: 'Saint Martin' },
  { code: 'mg', name: 'Madagascar' },
  { code: 'mh', name: 'Marshall Islands' },
  { code: 'mk', name: 'North Macedonia' },
  { code: 'ml', name: 'Mali' },
  { code: 'mm', name: 'Myanmar' },
  { code: 'mn', name: 'Mongolia' },
  { code: 'mo', name: 'Macao' },
  { code: 'mp', name: 'Northern Mariana Islands' },
  { code: 'mq', name: 'Martinique' },
  { code: 'mr', name: 'Mauritania' },
  { code: 'ms', name: 'Montserrat' },
  { code: 'mt', name: 'Malta' },
  { code: 'mu', name: 'Mauritius' },
  { code: 'mv', name: 'Maldives' },
  { code: 'mw', name: 'Malawi' },
  { code: 'mx', name: 'Mexico' },
  { code: 'my', name: 'Malaysia' },
  { code: 'mz', name: 'Mozambique' },
  { code: 'na', name: 'Namibia' },
  { code: 'nc', name: 'New Caledonia' },
  { code: 'ne', name: 'Niger' },
  { code: 'nf', name: 'Norfolk Island' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'ni', name: 'Nicaragua' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'no', name: 'Norway' },
  { code: 'np', name: 'Nepal' },
  { code: 'nr', name: 'Nauru' },
  { code: 'nu', name: 'Niue' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'om', name: 'Oman' },
  { code: 'pa', name: 'Panama' },
  { code: 'pe', name: 'Peru' },
  { code: 'pf', name: 'French Polynesia' },
  { code: 'pg', name: 'Papua New Guinea' },
  { code: 'ph', name: 'Philippines' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'pl', name: 'Poland' },
  { code: 'pm', name: 'Saint Pierre and Miquelon' },
  { code: 'pn', name: 'Pitcairn Islands' },
  { code: 'pr', name: 'Puerto Rico' },
  { code: 'ps', name: 'Palestine' },
  { code: 'pt', name: 'Portugal' },
  { code: 'pw', name: 'Palau' },
  { code: 'py', name: 'Paraguay' },
  { code: 'qa', name: 'Qatar' },
  { code: 're', name: 'R\u00e9union' },
  { code: 'ro', name: 'Romania' },
  { code: 'rs', name: 'Serbia' },
  { code: 'ru', name: 'Russia' },
  { code: 'rw', name: 'Rwanda' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'sb', name: 'Solomon Islands' },
  { code: 'sc', name: 'Seychelles' },
  { code: 'sd', name: 'Sudan' },
  { code: 'se', name: 'Sweden' },
  { code: 'sg', name: 'Singapore' },
  { code: 'sh', name: 'Saint Helena' },
  { code: 'si', name: 'Slovenia' },
  { code: 'sj', name: 'Svalbard and Jan Mayen' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'sl', name: 'Sierra Leone' },
  { code: 'sm', name: 'San Marino' },
  { code: 'sn', name: 'Senegal' },
  { code: 'so', name: 'Somalia' },
  { code: 'sr', name: 'Suriname' },
  { code: 'ss', name: 'South Sudan' },
  { code: 'st', name: 'S\u00e3o Tom\u00e9 and Pr\u00edncipe' },
  { code: 'sv', name: 'El Salvador' },
  { code: 'sx', name: 'Sint Maarten' },
  { code: 'sy', name: 'Syria' },
  { code: 'sz', name: 'Eswatini' },
  { code: 'tc', name: 'Turks and Caicos Islands' },
  { code: 'td', name: 'Chad' },
  { code: 'tg', name: 'Togo' },
  { code: 'th', name: 'Thailand' },
  { code: 'tj', name: 'Tajikistan' },
  { code: 'tk', name: 'Tokelau' },
  { code: 'tl', name: 'Timor-Leste' },
  { code: 'tm', name: 'Turkmenistan' },
  { code: 'tn', name: 'Tunisia' },
  { code: 'to', name: 'Tonga' },
  { code: 'tr', name: 'Turkey' },
  { code: 'tt', name: 'Trinidad and Tobago' },
  { code: 'tv', name: 'Tuvalu' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'tz', name: 'Tanzania' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'ug', name: 'Uganda' },
  { code: 'us', name: 'United States' },
  { code: 'uy', name: 'Uruguay' },
  { code: 'uz', name: 'Uzbekistan' },
  { code: 'va', name: 'Vatican City' },
  { code: 'vc', name: 'Saint Vincent and the Grenadines' },
  { code: 've', name: 'Venezuela' },
  { code: 'vg', name: 'British Virgin Islands' },
  { code: 'vi', name: 'U.S. Virgin Islands' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'vu', name: 'Vanuatu' },
  { code: 'wf', name: 'Wallis and Futuna' },
  { code: 'ws', name: 'Samoa' },
  { code: 'ye', name: 'Yemen' },
  { code: 'yt', name: 'Mayotte' },
  { code: 'za', name: 'South Africa' },
  { code: 'zm', name: 'Zambia' },
  { code: 'zw', name: 'Zimbabwe' },
];

const countryItems = COUNTRY_LIST.map((c) => ({
  code: c.code,
  label: `${countryCodeToFlagEmoji(c.code)} ${c.name}`,
}));

function ProfileEditModal(props) {
  const { t } = useTranslation();
  const { open, onClose, onSave, player, Transition } = props;
  const {
    register, handleSubmit, watch, control, trigger, reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      name: player?.name,
      friendCode: formatFriendCode(player?.friendCode ?? ''),
      description: player?.description,
      discord: player?.discord,
      telegram: player?.telegram,
      avatar: player?.avatarKey,
      country0: player?.countries?.[0] ?? '',
      country1: player?.countries?.[1] ?? '',
      favoritePokemon: player?.favoritePokemon ?? '',
      pronouns: player?.pronouns ?? '',
      shareContactInfo: player?.shareContactInfo ?? false,
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [showSecondCountry, setShowSecondCountry] = useState(
    (player?.countries?.[1] ?? '') !== ''
  );

  const pronounItems = PRONOUN_OPTIONS.map((p) => ({
    value: p.value,
    label: t(p.key),
  }));

  const onSubmit = async (data) => {
    setIsLoading(true);
    const { country0, country1, friendCode, ...rest } = data;
    const countries = [country0, country1]
      .filter((c) => c != null && c !== '');
    await onSave?.({
      ...rest,
      friendCode: friendCode?.replace(/\s/g, ''),
      countries,
    });
    setIsLoading(false);
  }
  useEffect(() => {
    if (player == null) return;
    reset({
      name: player.name,
      friendCode: formatFriendCode(player.friendCode ?? ''),
      description: player.description,
      discord: player.discord,
      telegram: player.telegram,
      avatar: player.avatarKey,
      country0: player.countries?.[0] ?? '',
      country1: player.countries?.[1] ?? '',
      favoritePokemon: player.favoritePokemon ?? '',
      pronouns: player.pronouns ?? '',
      shareContactInfo: player.shareContactInfo ?? false,
    });
    setShowSecondCountry((player.countries?.[1] ?? '') !== '');
  }, [player])
  const avatarItems = player?.avatars == null
    ? []
    : Object.keys(player.avatars).map((key) => ({
      id: key,
      label: player.avatars[key]?.name,
    }));
  const theAvatar = watch(`avatar`);
  const watchedFavPokemon = watch('favoritePokemon');

  const pokemonList = player?.pokemonList ?? [];
  const pokemonItems = pokemonList.map((p) => ({
    id: p.speciesId,
    label: p.speciesName,
    sid: p.sid,
  }));

  const selectedPokemonSid = pokemonList
    .find((p) => p.speciesId === watchedFavPokemon)?.sid;

  const trainerFields = ['name', 'friendCode', 'discord', 'telegram'];
  const aboutFields = [
    'avatar', 'pronouns', 'description',
    'favoritePokemon', 'country0', 'country1',
  ];
  const hasTrainerErrors = trainerFields.some((f) => errors[f]);
  const hasAboutErrors = aboutFields.some((f) => errors[f]);

  return(
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={onClose}
      aria-labelledby="profile-modal-slide-title"
      aria-describedby="profile-modal-slide-description"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle id="profile-modal-slide-title">
          {t("edit_profile")}
        </DialogTitle>
        {
          isLoading ? (
            <CircularProgress />
          ) : (
            <DialogContent id="profile-modal-slide-description">
              <Tabs
                value={tab}
                onChange={async (_e, v) => { await trigger(); setTab(v); }}
                variant="fullWidth"
                sx={{ marginBottom: 2 }}
              >
                <Tab label={
                  <span>
                    {t("profile_tab_trainer")}
                    {hasTrainerErrors && (
                      <span style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#f44336",
                        marginLeft: 6,
                        verticalAlign: "middle",
                      }} />
                    )}
                  </span>
                } />
                <Tab label={
                  <span>
                    {t("profile_tab_about")}
                    {hasAboutErrors && (
                      <span style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#f44336",
                        marginLeft: 6,
                        verticalAlign: "middle",
                      }} />
                    )}
                  </span>
                } />
              </Tabs>

              {tab === 0 && (
                <GridContainer>
                  <GridItem xs={12}>
                    <CustomInput
                      labelText={t("trainer_name")}
                      id="name"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        ...register("name", { required: true }),
                        defaultValue: player?.name
                      }}
                      error={errors.trainerName}
                    />
                    <small style={{ color: "#999", paddingBottom: 12, display: "block" }}>
                      {t("name_and_code_must_match")}
                    </small>
                  </GridItem>
                  <GridItem xs={12}>
                    <Controller
                      control={control}
                      name="friendCode"
                      rules={{
                        validate: (v) => {
                          if (!v || v.trim() === '') return true;
                          const digits = v.replace(/\s/g, '');
                          return /^\d{12}$/.test(digits)
                            || t("api_invalid_friend_code");
                        },
                      }}
                      render={({
                        field: { onChange, onBlur, value },
                      }) => (
                        <CustomInput
                          labelText={t("friend_code")}
                          id="friendCode"
                          labelProps={{
                            shrink: !!(value && value.length > 0),
                          }}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps={{
                            value: value ?? '',
                            onChange: (e) => {
                              onChange(
                                formatFriendCode(e.target.value)
                              );
                            },
                            onBlur,
                            inputMode: "numeric",
                          }}
                          error={!!errors.friendCode}
                        />
                      )}
                    />
                    {errors.friendCode && (
                      <small style={{ color: "#f44336" }}>
                        {errors.friendCode.message}
                      </small>
                    )}
                  </GridItem>
                  <GridItem xs={12} sm={6}>
                    <CustomInput
                      labelText="Discord"
                      id="discord"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        ...(({ ref, ...rest }) => ({
                          ...rest,
                          inputRef: ref,
                        }))(register("discord", {
                          maxLength: 100,
                          validate: (v) => {
                            if (!v || v.trim() === '') return true;
                            return /^[a-z0-9_.]{2,32}$/.test(v)
                              || t("invalid_discord");
                          },
                        })),
                        defaultValue: player?.discord
                      }}
                      error={!!errors.discord}
                    />
                    {errors.discord && (
                      <small style={{ color: "#f44336" }}>
                        {errors.discord.message}
                      </small>
                    )}
                  </GridItem>
                  <GridItem xs={12} sm={6}>
                    <CustomInput
                      labelText="Telegram"
                      id="telegram"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        ...(({ ref, ...rest }) => ({
                          ...rest,
                          inputRef: ref,
                        }))(register("telegram", {
                          maxLength: 100,
                          validate: (v) => {
                            if (!v || v.trim() === '') return true;
                            return /^@?[a-zA-Z0-9_]{5,32}$/.test(v)
                              || t("invalid_telegram");
                          },
                        })),
                        defaultValue: player?.telegram
                      }}
                      error={!!errors.telegram}
                    />
                    {errors.telegram && (
                      <small style={{ color: "#f44336" }}>
                        {errors.telegram.message}
                      </small>
                    )}
                  </GridItem>
                  <GridItem xs={12}>
                    <Controller
                      name="shareContactInfo"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          }
                          label={t("share_contact_on_profile")}
                        />
                      )}
                    />
                  </GridItem>
                </GridContainer>
              )}

              {tab === 1 && (
                <GridContainer>
                  <GridItem xs={12}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                    }}>
                      <div style={{ flex: 1, marginRight: 20 }}>
                        <Controller
                          control={control}
                          name="avatar"
                          rules={{ required: true }}
                          render={({
                            field: { onChange, value },
                          }) => (
                            <Autocomplete
                              onChange={(_event, item) => {
                                onChange(item?.id ?? "");
                              }}
                              value={
                                avatarItems.find(
                                  (a) => a.id === value
                                ) ?? null
                              }
                              options={avatarItems}
                              isOptionEqualToValue={(
                                option,
                                val,
                              ) => {
                                return option?.id === val?.id;
                              }}
                              getOptionLabel={(item) => {
                                return item?.label ?? "";
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={t("avatar")}
                                  variant="standard"
                                />
                              )}
                            />
                          )}
                        />
                      </div>
                      <img
                        src={player?.avatars?.[theAvatar]?.src}
                        alt={player?.avatars?.[theAvatar]?.name}
                        width={100}
                        height={80}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </GridItem>
                  <GridItem xs={12}>
                    <Controller
                      control={control}
                      name="pronouns"
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          onChange={(_event, item) => {
                            onChange(item?.value ?? "");
                          }}
                          value={
                            pronounItems.find(
                              (p) => p.value === value
                            ) ?? null
                          }
                          options={pronounItems}
                          isOptionEqualToValue={(option, val) => {
                            return option?.value === val?.value;
                          }}
                          getOptionLabel={(item) => {
                            return item?.label ?? "";
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t("pronouns")}
                              variant="standard"
                            />
                          )}
                        />
                      )}
                    />
                  </GridItem>
                  <GridItem xs={12} style={{ paddingTop: 12 }}>
                    <CustomInput
                      labelText={t("trainer_bio")}
                      id="description"
                      formControlProps={{
                        fullWidth: true
                      }}
                      inputProps={{
                        ...register(
                          "description",
                          { maxLength: 500 }
                        ),
                        defaultValue: player?.description
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 4,
                    }}>
                      <div style={{ flex: 1 }}>
                        <Controller
                          control={control}
                          name="favoritePokemon"
                          render={({
                            field: { onChange, value },
                          }) => (
                            <Autocomplete
                              onChange={(_event, item) => {
                                onChange(item?.id ?? "");
                              }}
                              value={value}
                              options={pokemonItems}
                              isOptionEqualToValue={(option, val) => {
                                return (
                                  (option?.id ?? option) === val
                                );
                              }}
                              getOptionLabel={(item) => {
                                return item.label
                                  ?? pokemonItems.find(
                                    (p) => p.id === item
                                  )?.label
                                  ?? "";
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={t("favorite_pokemon")}
                                  variant="standard"
                                />
                              )}
                            />
                          )}
                        />
                      </div>
                      {selectedPokemonSid != null && (
                        <img
                          src={`https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${selectedPokemonSid}.png/public`}
                          alt="Favorite Pokemon"
                          width={60}
                          height={60}
                          style={{
                            objectFit: "contain",
                            marginLeft: 12,
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </GridItem>
                  <GridItem xs={showSecondCountry ? 6 : 12}>
                    <div style={{ marginTop: 12 }}>
                      <Controller
                        control={control}
                        name="country0"
                        render={({
                          field: { onChange, value },
                        }) => (
                          <Autocomplete
                            onChange={(_event, item) => {
                              onChange(item?.code ?? "");
                            }}
                            value={
                              countryItems.find(
                                (c) => c.code === value
                              ) ?? null
                            }
                            options={countryItems}
                            isOptionEqualToValue={(option, val) => {
                              return option?.code === val?.code;
                            }}
                            getOptionLabel={(item) => {
                              return item?.label ?? "";
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={t("country")}
                                variant="standard"
                              />
                            )}
                          />
                        )}
                      />
                    </div>
                  </GridItem>
                  {showSecondCountry && (
                    <GridItem xs={6}>
                      <div style={{ marginTop: 12 }}>
                        <Controller
                          control={control}
                          name="country1"
                          render={({
                            field: { onChange, value },
                          }) => (
                            <Autocomplete
                              onChange={(_event, item) => {
                                onChange(item?.code ?? "");
                              }}
                              value={
                                countryItems.find(
                                  (c) => c.code === value
                                ) ?? null
                              }
                              options={countryItems}
                              isOptionEqualToValue={(
                                option,
                                val,
                              ) => {
                                return option?.code === val?.code;
                              }}
                              getOptionLabel={(item) => {
                                return item?.label ?? "";
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={`${t("country")} 2`}
                                  variant="standard"
                                />
                              )}
                            />
                          )}
                        />
                      </div>
                    </GridItem>
                  )}
                  {!showSecondCountry && (
                    <GridItem xs={12}>
                      <Button
                        size="small"
                        onClick={() => setShowSecondCountry(true)}
                        sx={{ marginTop: 1, textTransform: "none" }}
                      >
                        + {t("add_another_flag")}
                      </Button>
                    </GridItem>
                  )}
                </GridContainer>
              )}
            </DialogContent>
          )
        }
        <DialogActions>
          <Button
            type="submit"
            color="primary"
            disabled={!isDirty || !isValid || isLoading}
          >
            {t("save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProfileEditModal;
