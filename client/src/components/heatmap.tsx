import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Topic } from "@shared/schema";

interface HeatmapProps {
  topic: Topic;
  onEntryEdit: (date: string, currentValue: number) => void;
}

export default function Heatmap({ topic, onEntryEdit }: HeatmapProps) {
  const getHeatmapLevel = (value: number, maxValue: number): number => {
    if (value === 0) return 0;
    const ratio = value / maxValue;
    if (ratio <= 0.2) return 1;
    if (ratio <= 0.4) return 2;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.8) return 4;
    return 5;
  };

  const { heatmapData, stats, monthHeaders } = useMemo(() => {
    const data = topic.data as Record<string, number>;
    const values = Object.values(data);
    const maxValue = Math.max(...values, 1);
    
    // Generate year grid (52 weeks * 7 days)
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364); // 52 weeks back

    const grid: Array<{ date: string; value: number; level: number }> = [];
    const currentDate = new Date(startDate);

    // Align to start on Sunday
    while (currentDate.getDay() !== 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (let i = 0; i < 371; i++) { // 53 weeks * 7 days
      const dateStr = currentDate.toISOString().split('T')[0];
      const value = data[dateStr] || 0;
      const level = getHeatmapLevel(value, maxValue);
      
      grid.push({ date: dateStr, value, level });
      currentDate.setDate(currentDate.getDate() + 1);
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

    // Generate month headers
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return {
      heatmapData: grid,
      stats: { totalThisYear, thisWeek, todayValue, streak },
      monthHeaders: months
    };
  }, [topic.data, getHeatmapLevel]);

  const getHeatmapClass = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-200';
      case 1: return 'heatmap-1';
      case 2: return 'heatmap-2';
      case 3: return 'heatmap-3';
      case 4: return 'heatmap-4';
      case 5: return 'heatmap-5';
      default: return 'bg-gray-200';
    }
  };

  const formatTooltip = (entry: { date: string; value: number }): string => {
    if (entry.value === 0) {
      return `No data on ${new Date(entry.date).toLocaleDateString()}`;
    }
    return `${entry.value} ${topic.unit} on ${new Date(entry.date).toLocaleDateString()}`;
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
            <span>{stats.totalThisYear} contributions</span> in the last year
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
              <div className="w-3 h-3 rounded-sm heatmap-1"></div>
              <div className="w-3 h-3 rounded-sm heatmap-2"></div>
              <div className="w-3 h-3 rounded-sm heatmap-3"></div>
              <div className="w-3 h-3 rounded-sm heatmap-4"></div>
              <div className="w-3 h-3 rounded-sm heatmap-5"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Heatmap Container */}
      <Card className="bg-white rounded-xl border border-gray-200 p-6 mb-6" id="heatmapContainer">
        <CardContent className="p-0">
          {/* Month Headers */}
          <div className="grid grid-cols-12 gap-1 mb-2 text-xs text-gray-500 font-medium">
            {monthHeaders.map((month, i) => (
              <div key={i}>{month}</div>
            ))}
          </div>
          
          {/* Heatmap Grid */}
          <div className="flex gap-1">
            {/* Day Labels */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 font-medium mr-2">
              <div className="h-3"></div>
              <div>Mon</div>
              <div className="h-3"></div>
              <div>Wed</div>
              <div className="h-3"></div>
              <div>Fri</div>
              <div className="h-3"></div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-53 gap-1">
              {heatmapData.map((entry, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all ${getHeatmapClass(entry.level)}`}
                  title={formatTooltip(entry)}
                  onClick={() => onEntryEdit(entry.date, entry.value)}
                />
              ))}
            </div>
          </div>
        </CardContent>
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
