import { useTranslation } from 'next-i18next';
import Card from '../Card/Card';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';

const logo = "https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/a87ed45a-d857-47a8-ef13-241b0aa88900/public";
const startTime = new Date("June 29, 2024 20:00:00 GMT-07:00").toLocaleString();

function Announcement(props) {
  const { t } = useTranslation();
  const router = useRouter();

  const goToPage = () => {
    router.push("/tournament/5635a423acb2")
  }

  return (
    <Card>
      <div style={{ padding: "0 10px" }}>
        <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
          <img src={logo} alt="" height={100} width={100} style={{ objectFit: "contain", marginRight: 10 }} />
          <div>
            <h1 style={{ fontSize: "2em" }}>{t("apac_title")}</h1>
            <p>
              <div style={{ marginBottom: 5 }}>
              <b>{t("apac_description1", { startTime })}</b>
              </div>
              {t("apac_description2")}
              <br />
              {t("apac_description3")}
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            backgroundColor: "#121212",
            padding: "0 10px",
            borderRadius: 5,
            marginBottom: 10,
            flexWrap: "wrap",
            alignItems: "center"
          }}>
          <Button
            style={{ margin: "5px 0 5px 20px", minWidth: 200 }}
            onClick={goToPage}
          >
            {t("visit_page")}
          </Button>
          <Button
            style={{ margin: "5px 0 5px 20px", minWidth: 200, marginRight: 20 }}
            href='https://challonge.com/anicorisgone'
            target="_blank"
            rel="noreferrer"
          >
            {t("tournament_see_bracket_button")}
          </Button>
          <Button
            style={{ margin: "5px 0", }}
            variant="contained"
            href='https://twitch.tv/dracoviz'
            target="_blank"
            rel="noreferrer"
          >
            {t("tournament_see_stream_button")}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default Announcement;
