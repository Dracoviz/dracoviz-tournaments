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
  { code: 'ae', name: 'UAE' },
  { code: 'ar', name: 'Argentina' },
  { code: 'at', name: 'Austria' },
  { code: 'au', name: 'Australia' },
  { code: 'be', name: 'Belgium' },
  { code: 'bh', name: 'Bahrain' },
  { code: 'br', name: 'Brazil' },
  { code: 'ca', name: 'Canada' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'cl', name: 'Chile' },
  { code: 'co', name: 'Colombia' },
  { code: 'cz', name: 'Czechia' },
  { code: 'de', name: 'Germany' },
  { code: 'dk', name: 'Denmark' },
  { code: 'es', name: 'Spain' },
  { code: 'fi', name: 'Finland' },
  { code: 'fr', name: 'France' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'gr', name: 'Greece' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'hu', name: 'Hungary' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' },
  { code: 'in', name: 'India' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'kw', name: 'Kuwait' },
  { code: 'lb', name: 'Lebanon' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'lu', name: 'Luxembourg' },
  { code: 'lv', name: 'Latvia' },
  { code: 'mx', name: 'Mexico' },
  { code: 'my', name: 'Malaysia' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'no', name: 'Norway' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'pe', name: 'Peru' },
  { code: 'pl', name: 'Poland' },
  { code: 'pt', name: 'Portugal' },
  { code: 'se', name: 'Sweden' },
  { code: 'sg', name: 'Singapore' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'sv', name: 'El Salvador' },
  { code: 'th', name: 'Thailand' },
  { code: 'us', name: 'United States' },
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
