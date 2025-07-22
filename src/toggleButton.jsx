import React, { useState } from "react";
import "./App.css";
import Toggle from "react-toggle";
import "react-toggle/style.css"
import { useColorScheme } from "./useColorScheme.jsx";

export const DarkModeToggle = () => {
  const { isDark, setIsDark } = useColorScheme();
  const [disabled, setDisabled] = useState(false);
  const iconStyle = { color: "var(--color-foreground)", fontSize: 18 };

  const handleChange = ({ target }) => {
    setIsDark(target.checked);
    setDisabled(true);
    setTimeout(() => setDisabled(false), 800);
  };

  return (
    <div className="toggle-container">
      <Toggle
        checked={isDark}
        onChange={handleChange}
        disabled={disabled}
        icons={{
          checked: <span style={iconStyle}></span>,
          unchecked: <span style={iconStyle}></span>
        }}
        aria-label="Dark mode toggle"
      />
    </div>
  );
};

export default DarkModeToggle;