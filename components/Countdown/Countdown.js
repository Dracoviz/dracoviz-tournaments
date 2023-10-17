import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';

const Countdown = ({ endDate }) => {
  // Calculate the time remaining in milliseconds
  const calculateTimeRemaining = () => {
    const endTime = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.max(endTime - now, 0);
  };

  const { t } = useTranslation();

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  // Update the countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      if (remaining === 0) {
        clearInterval(timer); // Stop the timer when countdown reaches 0
      }
      setTimeRemaining(remaining);
    }, 1000);

    return () => {
      clearInterval(timer); // Clean up the timer when the component unmounts
    };
  }, [endDate]);

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return (
    <div style={{ textAlign: "center", border: "solid 1px gray", paddingTop: 10, marginTop: 30 }}>
      <p>{t("round_time_remaining")}</p>
      <h1 style={{ marginTop: 0, fontSize: "2.5rem" }}>
        <span>{days < 10 ? '0' + days : days}</span>:
        <span>{hours < 10 ? '0' + hours : hours}</span>:
        <span>{minutes < 10 ? '0' + minutes : minutes}</span>:
        <span>{seconds < 10 ? '0' + seconds : seconds}</span>
      </h1>
    </div>
  );
};

export default Countdown;
