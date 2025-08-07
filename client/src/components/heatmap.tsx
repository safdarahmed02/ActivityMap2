import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Topic } from "@shared/schema";

interface HeatmapProps {
  topic: Topic;
  onEntryEdit: (date: string, currentValue: number) => void;
}

export default function Heatmap({ topic, onEntryEdit }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const getHeatmapLevel = (value: number, maxValue: number): number => {
    if (value === 0) return 0;
    const ratio = value / maxValue;
    if (ratio <= 0.2) return 1;
    if (ratio <= 0.4) return 2;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.8) return 4;
    return 5;
  };

  const { yearlyData, stats } = useMemo(() => {
    const data = topic.data as Record<string, number>;
    const values = Object.values(data);
    const maxValue = Math.max(...values, 1);
    
    // Find the range of years with data
    const dates = Object.keys(data).filter(date => data[date] > 0);
    if (dates.length === 0) {
      // If no data, show current year
      dates.push(new Date().toISOString().split('T')[0]);
    }
    
    const years = dates.map(date => new Date(date).getFullYear());
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years, new Date().getFullYear());
    
    const yearlyData: Array<{
      year: number;
      months: Array<{
        month: number;
        name: string;
        days: Array<{ date: string; value: number; level: number; dayOfMonth: number; dayOfWeek: number }>
      }>
    }> = [];

    for (let year = minYear; year <= maxYear; year++) {
      const months = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
          days.push({ date: '', value: 0, level: 0, dayOfMonth: 0, dayOfWeek: i });
        }
        
        // Add actual days of the month
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = date.toISOString().split('T')[0];
          const value = data[dateStr] || 0;
          const level = getHeatmapLevel(value, maxValue);
          const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
          
          days.push({ date: dateStr, value, level, dayOfMonth: day, dayOfWeek });
        }
        
        months.push({
          month,
          name: monthNames[month],
          days
        });
      }
      
      yearlyData.push({ year, months });
    }

    // Calculate statistics
    const totalThisYear = values.reduce((sum, val) => sum + val, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = Object.entries(data)
      .filter(([date]) => new Date(date) >= weekAgo)
      .reduce((sum, [, val]) => sum + val, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayValue = data[today] || 0;

    // Calculate current streak
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (data[dateStr] && data[dateStr] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      yearlyData,
      stats: { totalThisYear, thisWeek, todayValue, streak }
    };
  }, [topic.data, getHeatmapLevel]);

  const getHeatmapClass = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100 border border-gray-200';
      case 1: return 'bg-red-100 border border-red-200';
      case 2: return 'bg-red-200 border border-red-300';
      case 3: return 'bg-red-400 border border-red-500';
      case 4: return 'bg-red-500 border border-red-600';
      case 5: return 'bg-red-600 border border-red-700';
      default: return 'bg-gray-100 border border-gray-200';
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, date: string, value: number) => {
    if (!date) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const content = value === 0 
      ? `No ${topic.unit} on ${new Date(date).toLocaleDateString()}`
      : `${value} ${topic.unit} on ${new Date(date).toLocaleDateString()}`;
    
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };


  return (
    <>
      {/* Topic Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{topic.name} Progress</h2>
            <p className="text-gray-600">Track your daily {topic.name.toLowerCase()} {topic.unit}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{stats.todayValue}{topic.unit.charAt(0)}</div>
            <div className="text-sm text-gray-500">today</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span>{stats.totalThisYear} contributions</span> in total
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200"></div>
              <div className="w-3 h-3 rounded-sm bg-red-200 border border-red-300"></div>
              <div className="w-3 h-3 rounded-sm bg-red-400 border border-red-500"></div>
              <div className="w-3 h-3 rounded-sm bg-red-500 border border-red-600"></div>
              <div className="w-3 h-3 rounded-sm bg-red-600 border border-red-700"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Heatmap Container */}
      <Card className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6 relative" id="heatmapContainer">
        <CardContent className="p-0">
          <div className="space-y-6">
            {yearlyData.map((yearData) => (
              <div key={yearData.year} className="space-y-2">
                {/* Year Label */}
                <div className="text-xs text-gray-400 font-medium">
                  {yearData.year}
                </div>
                
                {/* Year Grid */}
                <div className="flex gap-2">
                  {/* Day Labels */}
                  <div className="flex flex-col gap-1 text-xs text-gray-400 font-medium mr-2 mt-4">
                    <div className="h-3 text-center">Mon</div>
                    <div className="h-3"></div>
                    <div className="h-3 text-center">Wed</div>
                    <div className="h-3"></div>
                    <div className="h-3 text-center">Fri</div>
                    <div className="h-3"></div>
                    <div className="h-3 text-center">Sun</div>
                  </div>
                  
                  <div className="flex-1">
                    {/* Month Headers */}
                    <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-gray-400 font-medium">
                      {yearData.months.map((month) => (
                        <div key={month.month} className="text-center">{month.name}</div>
                      ))}
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-12 gap-2">
                      {yearData.months.map((month) => (
                        <div key={month.month} className="grid grid-cols-7 gap-0.5">
                          {month.days.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className={`w-3 h-3 cursor-pointer transition-all ${
                                day.date ? getHeatmapClass(day.level) : 'bg-transparent'
                              } ${day.date ? 'hover:ring-1 hover:ring-white' : ''}`}
                              onClick={() => day.date && onEntryEdit(day.date, day.value)}
                              onMouseEnter={(e) => day.date && handleMouseEnter(e, day.date, day.value)}
                              onMouseLeave={handleMouseLeave}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        
        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 px-2 py-1 text-xs text-white bg-black rounded shadow-lg pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
          >
            {tooltip.content}
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalThisYear}</div>
            <div className="text-sm text-gray-600">Total this year</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.thisWeek}</div>
            <div className="text-sm text-gray-600">This week</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.todayValue}</div>
            <div className="text-sm text-gray-600">Today</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.streak}</div>
            <div className="text-sm text-gray-600">Current streak</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
