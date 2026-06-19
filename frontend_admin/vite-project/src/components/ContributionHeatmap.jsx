import React, { useMemo } from 'react';

/**
 * Component hiển thị heatmap contributions giống GitHub
 * @param {Array} contributions - Array of {date: string, count: number}
 */
const ContributionHeatmap = ({ contributions = [] }) => {
  // Tạo map để dễ lookup contributions theo ngày
  const contributionsMap = useMemo(() => {
    const map = new Map();
    contributions.forEach((item) => {
      const dateStr = typeof item.date === 'string' ? item.date : item.date.split('T')[0];
      map.set(dateStr, item.count || 0);
    });
    return map;
  }, [contributions]);

  // Tính toán các ngày trong 1 năm gần nhất (53 tuần)
  const weeks = useMemo(() => {
    const weeksArray = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tính ngày bắt đầu: 53 tuần trước, bắt đầu từ Chủ nhật của tuần đó
    const startDate = new Date(today);
    const daysToSubtract = (53 * 7) - today.getDay();
    startDate.setDate(today.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);

    for (let week = 0; week < 53; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + day);
        
        // Chỉ thêm ngày trong quá khứ và không quá hôm nay
        if (date <= today && date >= startDate) {
          const dateStr = date.toISOString().split('T')[0];
          const count = contributionsMap.get(dateStr) || 0;
          weekDays.push({
            date: dateStr,
            count: count,
            dateObj: new Date(date),
          });
        }
      }
      // Luôn thêm week, kể cả khi không đủ 7 ngày (để giữ layout đúng)
      weeksArray.push(weekDays);
    }
    return weeksArray;
  }, [contributionsMap]);

  // Tính max count để scale màu
  const maxCount = useMemo(() => {
    return Math.max(...Array.from(contributionsMap.values()), 1);
  }, [contributionsMap]);

  // Hàm tính màu dựa trên count
  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-green-200';
    if (intensity < 0.5) return 'bg-green-400';
    if (intensity < 0.75) return 'bg-green-600';
    return 'bg-green-800';
  };

  // Tính tổng contributions
  const totalContributions = useMemo(() => {
    return Array.from(contributionsMap.values()).reduce((sum, count) => sum + count, 0);
  }, [contributionsMap]);

  // Lấy tháng labels
  const monthLabels = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const firstDay = week[0].dateObj;
        const month = firstDay.getMonth();
        const monthName = monthNames[month];
        
        // Chỉ thêm label nếu là tuần đầu tiên của tháng hoặc tuần đầu tiên
        if (weekIndex === 0 || firstDay.getDate() <= 7) {
          const existingMonth = months.find((m) => m.month === month && m.weekIndex === weekIndex);
          if (!existingMonth) {
            months.push({ month: monthName, weekIndex });
          }
        }
      }
    });
    return months;
  }, [weeks]);

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {totalContributions} contributions in the last year
        </h3>
      </div>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="inline-block min-w-full">
          {/* Month labels row */}
          <div className="flex mb-2 ml-8 relative">
            {monthLabels.map((monthLabel, idx) => {
              // Tính vị trí của label dựa trên weekIndex
              const leftPosition = monthLabel.weekIndex * 18; // 16px (w-4) + 2px gap
              return (
                <div
                  key={idx}
                  className="absolute text-xs text-gray-600 font-medium whitespace-nowrap"
                  style={{ left: `${leftPosition}px` }}
                >
                  {monthLabel.month}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-3 text-xs text-gray-600 font-medium flex-shrink-0">
              <div className="h-4"></div>
              <div className="h-4 flex items-center">Mon</div>
              <div className="h-4"></div>
              <div className="h-4 flex items-center">Wed</div>
              <div className="h-4"></div>
              <div className="h-4 flex items-center">Fri</div>
              <div className="h-4"></div>
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = week[dayIndex];
                    if (!day) {
                      // Ngày trong tương lai hoặc ngoài phạm vi
                      return <div key={`empty-${dayIndex}`} className="w-4 h-4" />;
                    }
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-4 h-4 rounded ${getColor(day.count)} cursor-pointer hover:ring-2 hover:ring-gray-500 hover:scale-110 transition-all border border-gray-200`}
                        title={`${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-end gap-3 text-xs text-gray-600">
        <span className="font-medium">Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
          <div className="w-4 h-4 rounded bg-green-200 border border-gray-200"></div>
          <div className="w-4 h-4 rounded bg-green-400 border border-gray-200"></div>
          <div className="w-4 h-4 rounded bg-green-600 border border-gray-200"></div>
          <div className="w-4 h-4 rounded bg-green-800 border border-gray-200"></div>
        </div>
        <span className="font-medium">More</span>
      </div>
    </div>
  );
};

export default ContributionHeatmap;

