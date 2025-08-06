import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import { formatNumberEnglish } from '../../../utils/localization';

const ProfitChart = ({ chartData = [], chartType = 'bar' }) => {
  const monthlyData = [
    { month: 'يناير', owner: 15000, crew: 15000, total: 30000 },
    { month: 'فبراير', owner: 18000, crew: 18000, total: 36000 },
    { month: 'مارس', owner: 22000, crew: 22000, total: 44000 },
    { month: 'أبريل', owner: 19500, crew: 19500, total: 39000 },
    { month: 'مايو', owner: 25000, crew: 25000, total: 50000 },
    { month: 'يونيو', owner: 28000, crew: 28000, total: 56000 }
  ];

  const pieData = [
    { name: 'مالك القارب', value: 50, color: 'var(--color-primary)' },
    { name: 'الطاقم', value: 50, color: 'var(--color-secondary)' }
  ];

  const formatAmount = (value) => {
    return formatNumberEnglish(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 elevation-2">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {entry?.name === 'owner' ? 'مالك القارب' : 
                   entry?.name === 'crew' ? 'الطاقم' : 'الإجمالي'}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatAmount(entry?.value)} ر.س
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">توزيع الأرباح الشهرية</h3>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => {}}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'bar' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name="BarChart3" size={16} />
          </button>
          
          <button
            onClick={() => {}}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'pie' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name="PieChart" size={16} />
          </button>
        </div>
      </div>
      <div className="h-80 w-full">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={formatAmount}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="owner" 
                name="owner"
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="crew" 
                name="crew"
                fill="var(--color-secondary)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'النسبة']}
                labelFormatter={(label) => label}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">مالك القارب (50%)</span>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-sm text-muted-foreground">الطاقم (50%)</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitChart;