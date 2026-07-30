import React from 'react';

interface ActivityHeatmapProps {
  title?: string;
  subtitle?: string;
  data?: { date: string, count: number }[];
}
const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ 
  title = "Activity Overview", 
  subtitle = "Verifications and interactions over the last 6 months",
  data: activityData = []
}) => {
  // Map incoming activity data to a lookup object
  const activityMap = new Map(activityData.map(item => [item.date, item.count]));

  // Generate data for a github-style heatmap
  // 26 weeks * 7 days
  const weeks = 26;
  const daysPerWeek = 7;
  const cellSize = 12;
  const cellGap = 6;
  const gridWidth = (weeks * cellSize) + ((weeks - 1) * cellGap);
  
  const generateData = () => {
    const grid = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * 7) + 1);

    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (w * 7) + d);
        const dateStr = date.toISOString().split('T')[0];
        const count = activityMap.get(dateStr) || 0;
        
        // Map count to level 0-4
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 5) level = 2;
        else if (count > 5 && count <= 10) level = 3;
        else if (count > 10) level = 4;
        
        week.push({ level, count, date: dateStr });
      }
      grid.push(week);
    }
    return grid;
  };

  const data = generateData();
  const dayLabels = ['Mon', 'Wed', 'Fri'];

  const monthLabels = (() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * 7) + 1);

    const labels: Array<{ label: string; weekIndex: number }> = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (w * 7));
      const month = date.getMonth();

      if (month !== lastMonth) {
        labels.push({
          label: date.toLocaleString('en-US', { month: 'short' }),
          weekIndex: w,
        });
        lastMonth = month;
      }
    }

    return labels;
  })();

  const getColor = (level: number) => {
    switch(level) {
      case 0: return 'bg-slate-100 dark:bg-slate-800';
      case 1: return 'bg-primary/20';
      case 2: return 'bg-primary/40';
      case 3: return 'bg-primary/60';
      case 4: return 'bg-primary';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
        <h3 className="font-bold text-text-main">{title}</h3>
        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4" style={{ minWidth: `${gridWidth + 48}px` }}>
          {/* Day Labels */}
          <div className="flex flex-col justify-between py-6 text-[10px] text-text-muted font-bold h-[100px]">
            {dayLabels.map(day => <span key={day}>{day}</span>)}
          </div>
          
          <div style={{ width: `${gridWidth}px` }}>
            {/* Month Labels */}
            <div className="relative mb-2 h-4 text-[10px] text-text-muted font-bold" style={{ width: `${gridWidth}px` }}>
              {monthLabels.map(month => (
                <span
                  key={`${month.label}-${month.weekIndex}`}
                  className="absolute"
                  style={{ left: `${(month.weekIndex / weeks) * 100}%` }}
                >
                  {month.label}
                </span>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex gap-1.5" style={{ width: `${gridWidth}px` }}>
              {data.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1.5">
                  {week.map((day, dIndex) => (
                    <div 
                      key={`${wIndex}-${dIndex}`}
                      className={`w-3 h-3 rounded-[2px] ${getColor(day.level)} transition-colors hover:ring-2 hover:ring-primary/30 cursor-pointer`}
                      title={`${day.date}: ${day.count} activities`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-text-muted font-medium">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(l => <div key={l} className={`w-3 h-3 rounded-[2px] ${getColor(l)}`} />)}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
