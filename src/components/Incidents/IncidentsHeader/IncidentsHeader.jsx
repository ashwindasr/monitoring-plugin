import * as React from 'react';
import IncidentGanttChart from '../IncidentsChart/IncidentsChart';
import AlertsChart from '../AlertsChart/AlertsChart';

const mockGroups = [
  [
    {
      start: new Date(2024, 8, 19, 10),
      end: new Date(2024, 8, 23, 12),
      color: '#C91C0E',
    },
    {
      start: new Date(2024, 8, 23, 15),
      end: new Date(2024, 8, 24, 19),
      color: '#C91C0E',
    },
  ],
  [
    {
      start: new Date(2024, 8, 19, 10),
      end: new Date(2024, 8, 19, 20),
      color: '#F0AB00',
    },
    {
      start: new Date(2024, 8, 20, 10),
      end: new Date(2024, 8, 20, 20),
      color: '#F0AB00',
    },
    {
      start: new Date(2024, 8, 21, 10),
      end: new Date(2024, 8, 21, 20),
      color: '#F0AB00',
    },
    {
      start: new Date(2024, 8, 22, 10),
      end: new Date(2024, 8, 22, 20),
      color: '#F0AB00',
    },
    {
      start: new Date(2024, 8, 23, 10),
      end: new Date(2024, 8, 23, 20),
      color: '#F0AB00',
    },
  ],
  [
    {
      start: new Date(2024, 8, 20, 10),
      end: new Date(2024, 8, 24, 12),
      color: '#F0AB00',
    },
  ],
  [
    {
      start: new Date(2024, 8, 23, 5),
      end: new Date(2024, 8, 24, 5),
      color: '#F0AB00',
    },
  ],
  [
    {
      start: new Date(2024, 8, 20, 5),
      end: new Date(2024, 8, 21, 5),
      color: '#F0AB00',
    },
  ],
  [
    {
      start: new Date(2024, 8, 22, 5),
      end: new Date(2024, 8, 24, 5),
      color: '#F0AB00',
    },
  ],
];

const mockViewport = {
  start: new Date(2024, 8, 19),
  end: new Date(2024, 8, 25),
};

export const IncidentsHeader = () => {
  return (
    <div
      className="incidents-chart-card-container"
      style={{
        border: '6px solid #F3F3F3',
      }}
    >
      <IncidentGanttChart groups={mockGroups} viewport={mockViewport} />
      <AlertsChart groups={mockGroups} viewport={mockViewport} />
    </div>
  );
};