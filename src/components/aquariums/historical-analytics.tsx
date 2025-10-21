"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, Activity, Calendar, Droplets, Thermometer, Eye, Zap, Beaker, FlaskConical } from 'lucide-react'
import { format, subDays, subMonths, subWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns'

// Mock data types
interface WaterTest {
  id: string
  aquariumId: string
  date: Date
  parameters: {
    pH: number
    ammonia: number
    nitrite: number
    nitrate: number
    temperature: number
    salinity?: number
    alkalinity?: number
    phosphate?: number
    calcium?: number
    magnesium?: number
  }
  notes?: string
}

interface Aquarium {
  id: string
  name: string
  type: 'freshwater' | 'saltwater' | 'brackish'
  volume: number
  setupDate: Date
}

interface AnalyticsData {
  aquariums: Aquarium[]
  tests: WaterTest[]
}

// Correlation analysis
interface CorrelationResult {
  parameter1: string
  parameter2: string
  correlation: number
  strength: 'strong' | 'moderate' | 'weak'
  direction: 'positive' | 'negative'
}

// Trend analysis
interface TrendAnalysis {
  parameter: string
  trend: 'improving' | 'declining' | 'stable'
  rate: number
  confidence: number
}

// Predictive insights
interface PredictiveInsight {
  type: 'warning' | 'recommendation' | 'success'
  parameter: string
  message: string
  confidence: number
  daysAhead: number
}

// Seasonal patterns
interface SeasonalPattern {
  parameter: string
  season: 'spring' | 'summer' | 'fall' | 'winter'
  averageValue: number
  variance: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

// Generate mock data
const generateMockData = (): AnalyticsData => {
  const aquariums: Aquarium[] = [
    {
      id: '1',
      name: 'Community Tank',
      type: 'freshwater',
      volume: 75,
      setupDate: subMonths(new Date(), 18)
    },
    {
      id: '2', 
      name: 'Reef Display',
      type: 'saltwater',
      volume: 120,
      setupDate: subMonths(new Date(), 24)
    },
    {
      id: '3',
      name: 'Planted Paradise',
      type: 'freshwater',
      volume: 40,
      setupDate: subMonths(new Date(), 12)
    }
  ]

  const tests: WaterTest[] = []
  
  // Generate tests for the last 12 months
  for (let i = 365; i >= 0; i -= 3) {
    aquariums.forEach(aquarium => {
      const date = subDays(new Date(), i + Math.random() * 2)
      
      // Generate realistic parameter values with trends and seasonal variations
      const seasonFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.1
      const trendFactor = (365 - i) / 365 * 0.05
      
      const test: WaterTest = {
        id: `test-${aquarium.id}-${i}`,
        aquariumId: aquarium.id,
        date,
        parameters: aquarium.type === 'saltwater' ? {
          pH: 8.1 + (Math.random() - 0.5) * 0.4 + seasonFactor,
          ammonia: Math.random() * 0.1 + trendFactor,
          nitrite: Math.random() * 0.05 + trendFactor,
          nitrate: 5 + Math.random() * 15 + seasonFactor * 5,
          temperature: 78 + Math.random() * 4 + seasonFactor * 2,
          salinity: 35 + Math.random() * 2,
          alkalinity: 8 + Math.random() * 2,
          phosphate: 0.03 + Math.random() * 0.02,
          calcium: 420 + Math.random() * 40,
          magnesium: 1280 + Math.random() * 80
        } : {
          pH: 7.0 + (Math.random() - 0.5) * 1.0 + seasonFactor,
          ammonia: Math.random() * 0.25 + trendFactor,
          nitrite: Math.random() * 0.1 + trendFactor,
          nitrate: 10 + Math.random() * 30 + seasonFactor * 10,
          temperature: 76 + Math.random() * 6 + seasonFactor * 3,
          alkalinity: 6 + Math.random() * 4
        }
      }
      
      tests.push(test)
    })
  }
  
  return { aquariums, tests }
}

// Analytics calculations
const calculateCorrelations = (tests: WaterTest[]): CorrelationResult[] => {
  const parameters = ['pH', 'ammonia', 'nitrite', 'nitrate', 'temperature']
  const correlations: CorrelationResult[] = []
  
  for (let i = 0; i < parameters.length; i++) {
    for (let j = i + 1; j < parameters.length; j++) {
      const param1 = parameters[i] as keyof WaterTest['parameters']
      const param2 = parameters[j] as keyof WaterTest['parameters']
      
      const values1 = tests.map(t => t.parameters[param1]).filter(v => v !== undefined) as number[]
      const values2 = tests.map(t => t.parameters[param2]).filter(v => v !== undefined) as number[]
      
      if (values1.length > 10 && values2.length > 10) {
        // Simple correlation coefficient calculation
        const n = Math.min(values1.length, values2.length)
        const mean1 = values1.slice(0, n).reduce((a, b) => a + b, 0) / n
        const mean2 = values2.slice(0, n).reduce((a, b) => a + b, 0) / n
        
        let numerator = 0
        let sum1 = 0
        let sum2 = 0
        
        for (let k = 0; k < n; k++) {
          const diff1 = values1[k] - mean1
          const diff2 = values2[k] - mean2
          numerator += diff1 * diff2
          sum1 += diff1 * diff1
          sum2 += diff2 * diff2
        }
        
        const correlation = numerator / Math.sqrt(sum1 * sum2)
        
        if (!isNaN(correlation)) {
          const strength = Math.abs(correlation) > 0.7 ? 'strong' : 
                          Math.abs(correlation) > 0.3 ? 'moderate' : 'weak'
          
          correlations.push({
            parameter1: param1,
            parameter2: param2,
            correlation,
            strength,
            direction: correlation > 0 ? 'positive' : 'negative'
          })
        }
      }
    }
  }
  
  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
}

const calculateTrends = (tests: WaterTest[]): TrendAnalysis[] => {
  const parameters = ['pH', 'ammonia', 'nitrite', 'nitrate', 'temperature']
  const trends: TrendAnalysis[] = []
  
  parameters.forEach(param => {
    const paramKey = param as keyof WaterTest['parameters']
    const recentTests = tests
      .filter(t => t.parameters[paramKey] !== undefined)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 30) // Last 30 tests
    
    if (recentTests.length > 10) {
      const values = recentTests.map(t => t.parameters[paramKey] as number)
      const times = recentTests.map(t => t.date.getTime())
      
      // Simple linear regression for trend
      const n = values.length
      const sumX = times.reduce((a, b) => a + b, 0)
      const sumY = values.reduce((a, b) => a + b, 0)
      const sumXY = times.reduce((sum, x, i) => sum + x * values[i], 0)
      const sumXX = times.reduce((sum, x) => sum + x * x, 0)
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const confidence = Math.min(Math.abs(slope) * 1000000, 1) // Normalize confidence
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable'
      if (param === 'pH') {
        trend = Math.abs(slope) < 0.000001 ? 'stable' : 
               (slope > 0 && slope < 0.00001) || (slope < 0 && slope > -0.00001) ? 'improving' : 'declining'
      } else if (['ammonia', 'nitrite'].includes(param)) {
        trend = Math.abs(slope) < 0.000001 ? 'stable' : slope < 0 ? 'improving' : 'declining'
      } else if (param === 'nitrate') {
        trend = Math.abs(slope) < 0.000001 ? 'stable' : 
               slope < 0 ? 'improving' : slope > 0.00001 ? 'declining' : 'stable'
      } else {
        trend = Math.abs(slope) < 0.000001 ? 'stable' : 'improving'
      }
      
      trends.push({
        parameter: param,
        trend,
        rate: slope * 1000000, // Scale for display
        confidence: Math.min(confidence, 0.95)
      })
    }
  })
  
  return trends
}

const generatePredictiveInsights = (tests: WaterTest[], trends: TrendAnalysis[]): PredictiveInsight[] => {
  const insights: PredictiveInsight[] = []
  
  trends.forEach(trend => {
    if (trend.confidence > 0.7) {
      if (trend.parameter === 'ammonia' && trend.trend === 'declining' && trend.rate < -0.1) {
        insights.push({
          type: 'warning',
          parameter: trend.parameter,
          message: 'Ammonia levels may spike soon. Consider increasing biological filtration.',
          confidence: trend.confidence,
          daysAhead: 7
        })
      } else if (trend.parameter === 'nitrate' && trend.trend === 'declining' && trend.rate > 0.5) {
        insights.push({
          type: 'recommendation',
          parameter: trend.parameter,
          message: 'Nitrate buildup detected. Schedule water changes more frequently.',
          confidence: trend.confidence,
          daysAhead: 14
        })
      } else if (trend.parameter === 'pH' && trend.trend === 'improving') {
        insights.push({
          type: 'success',
          parameter: trend.parameter,
          message: 'pH stability is improving. Current maintenance routine is effective.',
          confidence: trend.confidence,
          daysAhead: 30
        })
      }
    }
  })
  
  return insights
}

const calculateSeasonalPatterns = (tests: WaterTest[]): SeasonalPattern[] => {
  const parameters = ['pH', 'ammonia', 'nitrite', 'nitrate', 'temperature']
  const patterns: SeasonalPattern[] = []
  
  parameters.forEach(param => {
    const paramKey = param as keyof WaterTest['parameters']
    const seasonalData = {
      spring: [] as number[],
      summer: [] as number[],
      fall: [] as number[],
      winter: [] as number[]
    }
    
    tests.forEach(test => {
      const value = test.parameters[paramKey]
      if (value !== undefined) {
        const month = test.date.getMonth()
        const season = month >= 2 && month <= 4 ? 'spring' :
                      month >= 5 && month <= 7 ? 'summer' :
                      month >= 8 && month <= 10 ? 'fall' : 'winter'
        seasonalData[season].push(value)
      }
    })
    
    Object.entries(seasonalData).forEach(([season, values]) => {
      if (values.length > 5) {
        const average = values.reduce((a, b) => a + b, 0) / values.length
        const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length
        
        patterns.push({
          parameter: param,
          season: season as 'spring' | 'summer' | 'fall' | 'winter',
          averageValue: average,
          variance,
          trend: 'stable' // Simplified for demo
        })
      }
    })
  })
  
  return patterns
}

// Parameter icons
const getParameterIcon = (parameter: string) => {
  switch (parameter) {
    case 'pH': return <Beaker className="w-4 h-4" />
    case 'ammonia': return <FlaskConical className="w-4 h-4" />
    case 'nitrite': return <Droplets className="w-4 h-4" />
    case 'nitrate': return <Activity className="w-4 h-4" />
    case 'temperature': return <Thermometer className="w-4 h-4" />
    default: return <Eye className="w-4 h-4" />
  }
}

export default function HistoricalAnalytics() {
  const [selectedAquarium, setSelectedAquarium] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('12months')
  const [activeTab, setActiveTab] = useState('overview')
  
  // Generate mock data
  const data = useMemo(() => generateMockData(), [])
  
  // Filter data based on selections
  const filteredTests = useMemo(() => {
    let tests = data.tests
    
    // Filter by aquarium
    if (selectedAquarium !== 'all') {
      tests = tests.filter(test => test.aquariumId === selectedAquarium)
    }
    
    // Filter by time range
    const now = new Date()
    const cutoffDate = timeRange === '3months' ? subMonths(now, 3) :
                      timeRange === '6months' ? subMonths(now, 6) :
                      timeRange === '12months' ? subMonths(now, 12) :
                      subMonths(now, 24)
    
    tests = tests.filter(test => test.date >= cutoffDate)
    
    return tests.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [data.tests, selectedAquarium, timeRange])
  
  // Calculate analytics
  const correlations = useMemo(() => calculateCorrelations(filteredTests), [filteredTests])
  const trends = useMemo(() => calculateTrends(filteredTests), [filteredTests])
  const insights = useMemo(() => generatePredictiveInsights(filteredTests, trends), [filteredTests, trends])
  const seasonalPatterns = useMemo(() => calculateSeasonalPatterns(filteredTests), [filteredTests])
  
  // Statistics
  const totalTests = filteredTests.length
  const aquariumsWithData = new Set(filteredTests.map(t => t.aquariumId)).size
  const averageTestFrequency = totalTests > 0 ? 
    (new Date().getTime() - Math.min(...filteredTests.map(t => t.date.getTime()))) / (totalTests * 24 * 60 * 60 * 1000) : 0
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historical Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and predictions from your water testing data
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedAquarium} onValueChange={setSelectedAquarium}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select aquarium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Aquariums</SelectItem>
              {data.aquariums.map((aquarium) => (
                <SelectItem key={aquarium.id} value={aquarium.id}>
                  {aquarium.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
              <SelectItem value="24months">24 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aquariums</p>
                <p className="text-2xl font-bold">{aquariumsWithData}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Frequency</p>
                <p className="text-2xl font-bold">{averageTestFrequency.toFixed(1)}d</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Parameter Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trends.map((trend) => (
                  <div key={trend.parameter} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getParameterIcon(trend.parameter)}
                      <div>
                        <p className="font-medium capitalize">{trend.parameter}</p>
                        <p className="text-sm text-muted-foreground">
                          {(trend.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        trend.trend === 'improving' ? 'default' :
                        trend.trend === 'declining' ? 'destructive' : 'secondary'
                      }>
                        {trend.trend === 'improving' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {trend.trend === 'declining' && <TrendingDown className="w-3 h-3 mr-1" />}
                        {trend.trend === 'stable' && <Target className="w-3 h-3 mr-1" />}
                        {trend.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Predictive Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.length > 0 ? insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'warning' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20' :
                    insight.type === 'recommendation' ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20' :
                    'border-l-green-500 bg-green-50 dark:bg-green-950/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />}
                      {insight.type === 'recommendation' && <Activity className="w-5 h-5 text-blue-500 mt-0.5" />}
                      {insight.type === 'success' && <Target className="w-5 h-5 text-green-500 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-medium capitalize">{insight.parameter}</p>
                        <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.daysAhead} days ahead
                          </Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <Progress value={insight.confidence * 100} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">
                              {(insight.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No significant insights detected</p>
                    <p className="text-sm">Continue testing for more predictions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Correlations Tab */}
        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Parameter Correlations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Discover relationships between different water parameters
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlations.slice(0, 10).map((correlation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getParameterIcon(correlation.parameter1)}
                        <span className="font-medium capitalize">{correlation.parameter1}</span>
                      </div>
                      <span className="text-muted-foreground">↔</span>
                      <div className="flex items-center gap-2">
                        {getParameterIcon(correlation.parameter2)}
                        <span className="font-medium capitalize">{correlation.parameter2}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {correlation.direction === 'positive' ? '+' : ''}{correlation.correlation.toFixed(3)}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{correlation.strength}</p>
                      </div>
                      <Progress 
                        value={Math.abs(correlation.correlation) * 100} 
                        className={`w-20 ${
                          correlation.direction === 'positive' ? 'text-green-500' : 'text-red-500'
                        }`} 
                      />
                    </div>
                  </div>
                ))}
                
                {correlations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No significant correlations found</p>
                    <p className="text-sm">More data needed for correlation analysis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Forecasting Models
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Linear Regression</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Predicts parameter values based on historical trends
                  </p>
                  <div className="space-y-2">
                    {trends.filter(t => t.confidence > 0.5).map((trend) => (
                      <div key={trend.parameter} className="flex justify-between text-sm">
                        <span className="capitalize">{trend.parameter}</span>
                        <span className="font-medium">{(trend.confidence * 100).toFixed(0)}% accuracy</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Seasonal Adjustment</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Accounts for seasonal variations in predictions
                  </p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">ML-Powered Insights</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Advanced pattern recognition and anomaly detection
                  </p>
                  <Badge variant="outline">Premium Feature</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['ammonia', 'nitrite', 'pH', 'nitrate'].map((param) => {
                  const trend = trends.find(t => t.parameter === param)
                  const riskLevel = !trend ? 'low' : 
                    trend.trend === 'declining' && ['ammonia', 'nitrite'].includes(param) ? 'high' :
                    trend.trend === 'improving' && param === 'nitrate' ? 'medium' : 'low'
                  
                  return (
                    <div key={param} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getParameterIcon(param)}
                        <div>
                          <p className="font-medium capitalize">{param}</p>
                          <p className="text-sm text-muted-foreground">
                            {trend ? `${trend.trend} trend` : 'Stable'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        riskLevel === 'high' ? 'destructive' :
                        riskLevel === 'medium' ? 'secondary' : 'default'
                      }>
                        {riskLevel} risk
                      </Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Seasonal Tab */}
        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Seasonal Patterns
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Parameter variations across different seasons
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['spring', 'summer', 'fall', 'winter'].map((season) => (
                  <div key={season} className="space-y-3">
                    <h4 className="font-medium capitalize text-center">{season}</h4>
                    <div className="space-y-2">
                      {seasonalPatterns
                        .filter(p => p.season === season)
                        .slice(0, 5)
                        .map((pattern, index) => (
                        <div key={index} className="p-3 border rounded-lg text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            {getParameterIcon(pattern.parameter)}
                            <span className="text-sm font-medium capitalize">
                              {pattern.parameter}
                            </span>
                          </div>
                          <p className="text-lg font-bold">
                            {pattern.averageValue.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            σ² {pattern.variance.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {seasonalPatterns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Insufficient data for seasonal analysis</p>
                  <p className="text-sm">Need at least 12 months of data across seasons</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button>
          <BarChart3 className="w-4 h-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline">
          <CalendarDays className="w-4 h-4 mr-2" />
          Schedule Analysis
        </Button>
        <Button variant="outline">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Configure Alerts
        </Button>
      </div>
    </div>
  )
}