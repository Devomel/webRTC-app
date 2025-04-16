import { DataItem, GroupedDataItem, StatisticsDateRange } from "../../models/statistics";

export const filterDataByRange = (data: DataItem[], range: StatisticsDateRange) => {
   const now = new Date();
   const startDate = new Date();

   const rangeModifiers = {
      week: () => startDate.setDate(now.getDate() - 7),
      month: () => startDate.setMonth(now.getMonth() - 1),
      year: () => startDate.setFullYear(now.getFullYear() - 1),
   };

   if (rangeModifiers[range]) rangeModifiers[range]();

   return data.filter(({ date }) => new Date(date) >= startDate);
};

export const groupByMonth = (data: DataItem[]) => {
   const grouped: Record<string, GroupedDataItem> = {};
   data.forEach(item => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!grouped[key]) {
         grouped[key] = { date: key, speed: 0, count: 0, accuracy: 0 };
      }
      grouped[key].speed += item.speed;
      grouped[key].accuracy += item.accuracy;

      grouped[key].count += 1;
   });

   return Object.values(grouped).map(entry => ({
      date: entry.date,
      speed: Math.round(entry.speed / entry.count),
      accuracy: Math.round(entry.accuracy / entry.count)
   }));
};



export const formatXAxis = (tickItem: string, range: StatisticsDateRange) => {
   const date = new Date(tickItem);
   const formatOptions: Record<StatisticsDateRange, Intl.DateTimeFormatOptions> = {
      week: { year: "numeric", month: "2-digit", day: "2-digit" },
      month: { year: "numeric", month: "2-digit" },
      year: { year: "numeric", month: "short" },
   };
   return formatOptions[range]
      ? date.toLocaleDateString("uk-UA", formatOptions[range])
      : "";
};