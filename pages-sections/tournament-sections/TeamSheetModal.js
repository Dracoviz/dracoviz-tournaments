import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import React, { useState, useRef } from "react";
import { Button, InputLabel, Select, MenuItem, Checkbox } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useReactToPrint } from 'react-to-print';

const color = "#edebeb";
const border = `solid ${color} 0.5px`;
const emptyCellStyle = {
  backgroundColor: color,
  width: "14.28%",
}
const cellStyle = {
  border,
  fontFamily: "Jost",
  fontSize: "0.8rem",
  padding: "0.2rem 0.4rem",
}
const headStyle = {
  ...cellStyle,
  width: "14.28%",
}

class ComponentToPrint extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  getTeams() {
    const { data } = this.props;
    const { players } = data;
    const values = [];
    players.forEach((p) => {
      const { pokemon } = p;
      if (pokemon == null || pokemon.length <= 0) {
        return true;
      }
      const value = {
        speciesName: [],
        cp: [],
        hp: [],
        chargedMove1: [],
        chargedMove2: [],
        fastMove: [],
        bestBuddy: [],
        purified: [],
      }
      pokemon.forEach((pok) => {
        value.speciesName.push(pok.speciesName ?? "");
        value.cp.push(pok.cp ?? "");
        // value.hp.push(pok.hp ?? "");
        // value.chargedMove1.push(pok.chargedMoves[0] ?? "");
        // value.chargedMove2.push(pok.chargedMoves[1] ?? "");
        // value.fastMove.push(pok.fastMove ?? "");
        value.bestBuddy.push(pok.bestBuddy ?? false);
        value.purified.push(pok.purified ?? false);
      })
      values.push(value)
    });
    return values;
  }
  render() {
    const { singlePage, t } = this.props;
    const teams = [...this.getTeams(), ...this.getTeams()];
    return (
      <div>
        {
          teams.map((team, i) => (
            <div style={{
              pageBreakAfter: (singlePage || (i+1)%5 === 0) ? "always" : "auto",
              padding: "2rem",
              width: "100vw",
            }}>
              <table style={{ borderSpacing: 0, width: "100%", }}>
                <tr>
                  <th style={emptyCellStyle}></th>
                  <th style={headStyle}>{t("pokemon_team_sheet", { index: 1 })}</th>
                  <th style={headStyle}>{t("pokemon_team_sheet", { index: 2 })}</th>
                  <th style={headStyle}>{t("pokemon_team_sheet", { index: 3 })}</th>
                  <th style={headStyle}>{t("pokemon_team_sheet", { index: 4 })}</th>
                  <th style={headStyle}>{t("pokemon_team_sheet", { index: 5 })}</th>
                  <th style={headStyle}>{t("pokemon_team_sheet", { index: 6 })}</th>
                </tr>
                <tr>
                  <td style={cellStyle}><b>{t("name")}</b></td>
                  {
                    team.speciesName.map(item => (
                      <td style={cellStyle}>{item}</td>
                    ))
                  }
                </tr>
                <tr>
                  <td style={cellStyle}><b>{t("cp")}</b></td>
                  {
                    team.cp.map((item, j) => (
                      <td style={cellStyle}>{item}{team.bestBuddy[j] === true ? ` (${t("best_buddy")})` : ''}</td>
                    ))
                  }
                </tr>
                <tr>
                  <td style={cellStyle}><b>{t("purified")}</b></td>
                  {
                    team.purified.map((item) => (
                      <td style={cellStyle}>{item === true ? t("yes") : t("no")}</td>
                    ))
                  }
                </tr>
              </table>
            </div>
          ))
        }
      </div>
    );
  }
}

function TeamSheetModal(props) {
  const { t } = useTranslation();
  const { open, data, Transition, onClose } = props;
  const componentRef = useRef();
  const [singlePage, setSinglePage] = useState(true); 
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handleSetSinglePage = () => {
    setSinglePage(prev => !prev);
  }
  return(
    <Dialog
      maxWidth="lg"
      open={open}
      TransitionComponent={Transition}
      onClose={onClose}
      aria-labelledby="team-sheet-modal-slide-title"
      aria-describedby="team-sheet-modal-slide-description"
    >
      <DialogTitle
        id="team-sheet-modal-slide-title"
      >
        {t("create_team_sheets")}
      </DialogTitle>
      <DialogContent
        id="team-sheet-modal-slide-description"
      >
        <p>
          {t("single_print_label")}
          <Checkbox
            checked={singlePage}
            onChange={handleSetSinglePage}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </p>
        <div style={{
          border: "solid 1px gray",
          overflowY: "scroll",
          maxHeight: 200,
        }}>
          <ComponentToPrint ref={componentRef} data={data} singlePage={singlePage} t={t} />
        </div>
        <DialogActions>
          <Button
            type="button"
            color="primary"
            onClick={handlePrint}
          >
            {t("print")}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default TeamSheetModal;
