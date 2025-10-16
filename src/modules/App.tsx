import React from 'react';
import { HistoricalDates } from './HistoricalDates/HistoricalDates';

export default function App() {
  return (
    <main className="container">
      <HistoricalDates />
      {/* Можно добоавить копию компонента и все будет работать */}
      {/* <HistoricalDates /> */}
    </main>
  );
}
