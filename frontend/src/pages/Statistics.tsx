import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import type { Statistics } from '@/types';
import { STATUS_MAP } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  BookOpen,
  Mic,
  PenTool,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

const CHART_COLORS = ['#C8553D', '#2D6A4F', '#D4A373', '#E8B088', '#873424', '#245840', '#F2E8CF'];
const PENDING_COLORS = ['#D4A373', '#2D6A4F', '#C8553D'];

const STATUS_KEYS = ['pending', 'confirmed', 'needs_revision'] as const;

function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-4 bg-cream-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-cream-200 rounded w-1/3" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-5 bg-cream-200 rounded w-1/3 mb-6" />
      <div className="h-64 bg-cream-100 rounded" />
    </div>
  );
}

const OVERVIEW_ITEMS = [
  { key: 'total_terms' as const, label: '词条总数', icon: BookOpen, color: 'bg-ochre-50 text-ochre-500' },
  { key: 'total_pronunciations' as const, label: '发音总数', icon: Mic, color: 'bg-sage-50 text-sage-600' },
  { key: 'total_annotations' as const, label: '标注总数', icon: PenTool, color: 'bg-amber-50 text-amber-600' },
  { key: 'total_versions' as const, label: '版本总数', icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { key: 'pending_count' as const, label: '待处理', icon: AlertCircle, color: 'bg-red-50 text-red-500' },
];

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

export default function Statistics() {
  const { statistics, loading, fetchStatistics } = useStore();
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    fetchStatistics().then(() => setAnimDone(true));
  }, [fetchStatistics]);

  const categoryData = statistics
    ? Object.entries(statistics.category_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const eraData = statistics
    ? Object.entries(statistics.era_coverage)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    : [];

  const pendingData = statistics
    ? STATUS_KEYS.map((key, i) => ({
        name: STATUS_MAP[key],
        value: statistics.pending_ratio[key],
        color: PENDING_COLORS[i],
      }))
    : [];

  const polysemy = statistics?.polysemy_count;

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title">统计总览</h1>
        <p className="text-ink-500 mt-2">方言词汇平台数据全景概览，一览核心指标与分布趋势</p>
      </div>

      {loading && !statistics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      ) : !statistics ? (
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 text-cream-400 mx-auto mb-3" />
          <p className="text-ink-400">暂无统计数据</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {OVERVIEW_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="card p-5 flex flex-col items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-500 mb-0.5">{item.label}</p>
                    <p className="text-2xl font-bold text-ink-900 font-display">
                      {statistics.overview[item.key].toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="section-title text-lg !mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-ochre-500" />
                分类分布
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={animDone ? 0 : 800}
                    labelLine={false}
                    label={CustomPieLabel}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cat-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} 个词条`, name]}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6">
              <h3 className="section-title text-lg !mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-sage-600" />
                年代覆盖
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eraData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2E8CF" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6B6B6B' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 11, fill: '#6B6B6B' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} 个词条`, '词条数']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#C8553D"
                    radius={[0, 6, 6, 0]}
                    animationBegin={0}
                    animationDuration={animDone ? 0 : 800}
                  >
                    {eraData.map((_, index) => (
                      <Cell key={`era-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="section-title text-lg !mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                多义词条统计
              </h3>
              {polysemy ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-ochre-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-ochre-500 font-display">{polysemy.polysemy_count}</p>
                      <p className="text-xs text-ink-500 mt-1">多义词条数</p>
                    </div>
                    <div className="bg-sage-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-sage-600 font-display">{polysemy.total_terms}</p>
                      <p className="text-xs text-ink-500 mt-1">词条总数</p>
                    </div>
                    <div className="bg-cream-100 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-ink-700 font-display">
                        {(polysemy.ratio * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-ink-500 mt-1">多义率</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-ink-600">多义词条占比</span>
                      <span className="text-sm font-semibold text-ochre-500">
                        {(polysemy.ratio * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-cream-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(polysemy.ratio * 100, 100)}%`,
                          background: 'linear-gradient(90deg, #C8553D, #D4A373)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-ink-400 text-center py-10">暂无数据</p>
              )}
            </div>

            <div className="card p-6">
              <h3 className="section-title text-lg !mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                审核状态分布
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pendingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={animDone ? 0 : 800}
                        labelLine={false}
                        label={CustomPieLabel}
                      >
                        {pendingData.map((entry, index) => (
                          <Cell key={`pend-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} 个词条`, name]}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-4">
                  {pendingData.map((item) => {
                    const ratio = statistics.pending_ratio.total > 0
                      ? ((item.value / statistics.pending_ratio.total) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-ink-700">{item.name}</span>
                            <span className="text-sm font-semibold text-ink-900">{item.value}</span>
                          </div>
                          <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${ratio}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-cream-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-500">总计</span>
                      <span className="text-sm font-bold text-ink-900">{statistics.pending_ratio.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
