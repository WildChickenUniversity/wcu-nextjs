import React from 'react';

const CurrentDate = () => {
  const today = new Date();
  const dateFormat = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = today.toLocaleDateString('en-US');

  return <span>{dateString}</span>;
};

export default CurrentDate;
