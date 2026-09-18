import React from 'react';

/**
 * Focus handler: selects entire value if '0' so the first key typed replaces it.
 */
export const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  if (e.target.value === '0') {
    e.target.select();
  }
};

/**
 * KeyDown handler: if value is '0' and a digit key is pressed,
 * select the '0' so the keypress replaces it cleanly.
 */
export const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.currentTarget.value === '0' && /^[0-9]$/.test(e.key)) {
    e.currentTarget.select();
  }
};

/**
 * Clean leading zeros (e.g., '00213' -> '213', '05' -> '5', '0' -> '0', '' -> '').
 */
export const cleanNumberString = (val: string): string => {
  return val.replace(/^0+(?=\d)/, '');
};

/**
 * Standard number input change handler for React state.
 */
export const handleNumberChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (val: number | '') => void
) => {
  const clean = cleanNumberString(e.target.value);
  e.target.value = clean;
  setter(clean === '' ? '' : Number(clean));
};
