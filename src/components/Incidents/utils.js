/* eslint-disable max-len */
import global_danger_color_100 from '@patternfly/react-tokens/dist/esm/global_danger_color_100';
import global_info_color_100 from '@patternfly/react-tokens/dist/esm/global_info_color_100';
import global_warning_color_100 from '@patternfly/react-tokens/dist/esm/global_warning_color_100';

/**
 * Groups and deduplicates an array of objects based on a specified key type.
 *
 * @param {Array<Object>} objects - The array of objects to group and deduplicate.
 * @param {string} keyType - The key type used for grouping. Can be either:
 *   - `'alertname+namespace'`: Groups by concatenating the `alertname` and `namespace` fields in `metric`.
 *   - `'group_id'`: Groups by the `group_id` field in `metric`.
 *
 * @returns {Array<Object>} An array of grouped and deduplicated objects. Each object contains:
 *   - `metric`: The metric object from one of the original entries in the group.
 *   - `values`: An array of deduplicated values from all objects in the group.
 *
 * @description
 * This function processes an array of objects by grouping them according to a key derived from `keyType`.
 * - If `keyType` is `'alertname+namespace'`, objects are grouped by concatenating the `alertname` and `namespace` fields in the `metric` object.
 * - If `keyType` is `'group_id'`, objects are grouped by the `group_id` field in the `metric` object.
 *
 * For each group, the values from all grouped objects are merged, and duplicates are removed based on the serialized form of each value.
 *
 * The result is an array of objects, each containing the `metric` from one of the grouped objects and the deduplicated `values`.
 */
export function groupAndDeduplicate(objects, keyType) {
  const groupedObjects = new Map();
  for (const obj of objects) {
    let key;
    // Determine the key based on keyType
    if (keyType === 'alertname+namespace') {
      key = obj.metric.alertname + obj.metric.namespace;
    } else if (keyType === 'group_id') {
      key = obj.metric.group_id;
    }

    // If the key already exists in the map, merge the values
    if (groupedObjects.has(key)) {
      const existingObj = groupedObjects.get(key);
      existingObj.values = existingObj.values.concat(obj.values);
    } else {
      // Otherwise, create a new entry
      groupedObjects.set(key, {
        metric: obj.metric,
        values: obj.values.slice(),
      });
    }
  }

  // Remove duplicates in each grouped object
  for (const [key, obj] of groupedObjects.entries()) {
    const deduplicatedValues = [];
    const seen = new Set();

    for (const value of obj.values) {
      const valueString = JSON.stringify(value);
      if (!seen.has(valueString)) {
        seen.add(valueString);
        deduplicatedValues.push(value);
      }
    }
    obj.values = deduplicatedValues;
  }

  return Array.from(groupedObjects.values());
}

export function processAlertTimestamps(data) {
  const firing = groupAndDeduplicate(data, 'alertname+namespace').filter(
    (alert) => alert.metric.alertname !== 'Watchdog',
  );
  return firing.map((alert, index) => {
    // Process each value
    const processedValues = alert.values.map((value) => {
      const timestamp = value[0];

      // Convert timestamp to date
      const date = new Date(timestamp * 1000);
      return [date, value[1]];
    });

    return {
      alertname: alert.metric.alertname,
      namespace: alert.metric.namespace,
      severity: alert.metric.severity,
      values: processedValues,
      x: firing.length - index,
    };
  });
}

export const createAlertsChartBars = (alert) => {
  const data = [];
  for (let i = 0; i < alert.values.length - 1; i++) {
    data.push({
      y0: new Date(alert.values[i].at(0)),
      y: new Date(alert.values[i + 1].at(0)),
      x: alert.x,
      name: alert.severity[0].toUpperCase() + alert.severity.slice(1),
      fill:
        alert.values[i].at(1) === '2'
          ? global_danger_color_100.var
          : alert.values[i].at(1) === '1'
          ? global_warning_color_100.var
          : global_info_color_100.var,
    });
  }

  return data;
};

export const createIncidentsChartBars = (incident) => {
  const data = [];
  for (let i = 0; i < incident.values.length - 1; i++) {
    data.push({
      y0: new Date(incident.values[i].at(0)),
      y: new Date(incident.values[i + 1].at(0)),
      x: incident.x,
      name: incident.severity[0].toUpperCase() + incident.severity.slice(1),
      component: incident.component,
      group_id: incident.group_id,
      fill:
        incident.values[i].at(1) === '2'
          ? global_danger_color_100.var
          : incident.values[i].at(1) === '1'
          ? global_warning_color_100.var
          : global_info_color_100.var,
    });
  }

  return data;
};

export const formatDate = (date, isTime) => {
  const dateString = date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeString = date?.toLocaleTimeString('en-US', { hour12: false });
  return isTime ? `${dateString} ${timeString}` : dateString;
};

/**
 * Generates an array of dates, each representing midnight (00:00:00) of the past `days` number of days, starting from today.
 *
 * @param {number} days - The number of days for which to generate the date array. The array will contain dates starting from `days` ago up to today.
 * @returns {Array<Date>} An array of `Date` objects, each set to midnight (00:00:00) in UTC, for the past `days` number of days.
 *
 * @description
 * This function creates an array of `Date` objects, starting from `days` ago up to the current day. Each date in the array is set to midnight (00:00:00) to represent the start of the day.
 *
 * The function works by subtracting days from the current date and setting the time to 00:00:00 for each day.
 *
 * @example
 * // Generate an array of 7 days (last 7 days including today)
 * const dateArray = generateDateArray(7);
 * // Output example:
 * // [
 * //   2024-09-06T00:00:00.000Z,
 * //   2024-09-07T00:00:00.000Z,
 * //   2024-09-08T00:00:00.000Z,
 * //   2024-09-09T00:00:00.000Z,
 * //   2024-09-10T00:00:00.000Z,
 * //   2024-09-11T00:00:00.000Z,
 * //   2024-09-12T00:00:00.000Z
 * // ]
 */
export function generateDateArray(days) {
  const currentDate = new Date();

  const dateArray = [];
  for (let i = 0; i < days; i++) {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - (days - 1 - i));
    newDate.setHours(0, 0, 0, 0);
    dateArray.push(newDate);
  }

  return dateArray;
}

export function processIncidentTimestamps(data) {
  // Deduplicate and group the data by group_id
  const incidents = groupAndDeduplicate(data, 'group_id').filter(
    (incident) => incident.metric.src_alertname !== 'Watchdog',
  );

  return incidents.map((incident, index) => {
    const processedValues = incident.values.map((value) => {
      const timestamp = value[0];
      const date = new Date(timestamp * 1000);
      return [date, value[1]];
    });

    return {
      component: incident.metric.component,
      group_id: incident.metric.group_id,
      severity: incident.metric.src_severity,
      type: incident.metric.type,
      values: processedValues,
      x: incidents.length - index,
      state: 'informative',
    };
  });
}

const QUERY_CHUNK_SIZE = 24 * 60 * 60 * 1000;
export const getIncidentsTimeRanges = (timespan, maxEndTime = Date.now()) => {
  const startTime = maxEndTime - timespan;
  const timeRanges = [{ endTime: startTime + QUERY_CHUNK_SIZE, duration: QUERY_CHUNK_SIZE }];
  while (timeRanges.at(-1).endTime < maxEndTime) {
    const nextEndTime = timeRanges.at(-1).endTime + QUERY_CHUNK_SIZE;
    timeRanges.push({ endTime: nextEndTime, duration: QUERY_CHUNK_SIZE });
  }
  return timeRanges;
};

/**
 * Filters a single incident based on the selected filter criteria.
 *
 * @param {Object} incident - The incident object to check against the filters.
 * @param {Object} filters - An object containing all and selected filters.
 * @param {Array<string>} filters.all - An array of all available filters.
 * @param {Array<string>} filters.selected - An array of selected filters.
 *
 * @returns {boolean} Returns true if the incident matches all the selected filters, otherwise false.
 *
 * @description
 * The function checks the incident against the following filter criteria:
 * - If the "informative" filter is selected, it checks if `severity === 'info'`.
 * - If the "long-standing" filter is selected, it checks if the incident has been active (i.e., "firing")
 *   for 7 or more days by comparing the difference between the first and last timestamps in the `values` array.
 * - If the "inactive" filter is selected, it checks if any value in the `values` array corresponds to the current day
 *   and current hour (i.e., both the date and the hour match the current UTC date and hour).
 *
 * @example
 * const filters = {
 *   "selected": ["informative", "long-standing", "inactive"],
 *   "all": ["long-standing", "informative", "inactive"]
 * };
 *
 * const incident = {
 *   "component": "compute",
 *   "group_id": "73850a6a-e39e-4601-8910-3b4f60f4d53e",
 *   "severity": "info",
 *   "type": "alert",
 *   "values": [
 *     ["2024-09-01T00:00:00.000Z", "1"],
 *     ["2024-09-08T00:00:00.000Z", "1"]
 *   ],
 *   "x": 7
 * };
 *
 */
export function filterIncident(filters, incident) {
  const { selected } = filters;
  const currentDate = new Date(); // Get the current date and time in UTC
  const currentDay = currentDate.getUTCDate();
  const currentMonth = currentDate.getUTCMonth();
  const currentYear = currentDate.getUTCFullYear();
  const currentHour = currentDate.getUTCHours();

  // Check if "informative" is selected
  if (selected.includes('informative') && incident.severity !== 'info') {
    return false;
  }

  // Check if "long-standing" is selected
  if (selected.includes('long-standing')) {
    const values = incident.values.map((v) => new Date(v[0]));
    const firstDate = values[0];
    const lastDate = values[values.length - 1];

    // Calculate the difference in days between the first and last date
    const dayDifference = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    if (dayDifference < 7) {
      return false;
    }
  }

  // Check if "inactive" is selected
  if (selected.includes('inactive')) {
    const hasMatchingDayAndHour = incident.values.some((v) => {
      const valueDate = new Date(v[0]);
      return (
        valueDate.getUTCDate() === currentDay &&
        valueDate.getUTCMonth() === currentMonth &&
        valueDate.getUTCFullYear() === currentYear &&
        valueDate.getUTCHours() === currentHour
      );
    });

    if (!hasMatchingDayAndHour) {
      return false;
    }
  }

  return true;
}
