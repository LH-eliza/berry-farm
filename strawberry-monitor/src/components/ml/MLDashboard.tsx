"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Droplets,
  Thermometer,
  Sun,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface PlantHealthStatus {
  id: string;
  name: string;
  healthScore: number;
  growthStage: string;
  stageProgress: number;
  lastUpdate: Date;
  alerts: Alert[];
}

interface EnvironmentalConditions {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
  ph: number;
  ec: number;
  timestamp: Date;
}

interface YieldForecast {
  plantId: string;
  expectedYield: number;
  confidence: number;
  harvestDate: Date;
  yieldRange: { min: number; max: number };
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  plantId?: string;
  timestamp: Date;
  priority: "low" | "medium" | "high" | "critical";
}

interface MLDashboardProps {
  plants: PlantHealthStatus[];
  environmentalData: EnvironmentalConditions;
  yieldForecasts: YieldForecast[];
  alerts: Alert[];
}

export default function MLDashboard({
  plants,
  environmentalData,
  yieldForecasts,
  alerts,
}: MLDashboardProps) {
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">(
    "24h"
  );

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80)
      return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 60)
      return { label: "Good", color: "bg-yellow-100 text-yellow-800" };
    if (score >= 40)
      return { label: "Fair", color: "bg-orange-100 text-orange-800" };
    return { label: "Poor", color: "bg-red-100 text-red-800" };
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const criticalAlerts = alerts.filter(
    (alert) => alert.priority === "critical"
  );
  const warningAlerts = alerts.filter((alert) => alert.priority === "high");
  const infoAlerts = alerts.filter(
    (alert) => alert.priority === "medium" || alert.priority === "low"
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Berry Farm ML Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded-md px-3 py-1"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Alerts Section */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalAlerts.length} Critical Alert(s):</strong>
            {criticalAlerts.map((alert) => alert.message).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Plant Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="h-5 w-5 mr-2" />
              Plant Health Overview
            </CardTitle>
            <CardDescription>
              Overall health status of all plants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Average Health Score</span>
                <span
                  className={`font-bold ${getHealthColor(
                    plants.reduce((sum, plant) => sum + plant.healthScore, 0) /
                      plants.length
                  )}`}
                >
                  {Math.round(
                    plants.reduce((sum, plant) => sum + plant.healthScore, 0) /
                      plants.length
                  )}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Healthy Plants</span>
                <span className="font-bold text-green-600">
                  {plants.filter((p) => p.healthScore >= 80).length}/
                  {plants.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plants Needing Attention</span>
                <span className="font-bold text-orange-600">
                  {plants.filter((p) => p.healthScore < 60).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Thermometer className="h-5 w-5 mr-2" />
              Environmental Conditions
            </CardTitle>
            <CardDescription>Current environmental parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Thermometer className="h-4 w-4 mr-2" />
                  Temperature
                </span>
                <span className="font-bold">
                  {environmentalData.temperature}°C
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Droplets className="h-4 w-4 mr-2" />
                  Humidity
                </span>
                <span className="font-bold">{environmentalData.humidity}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Droplets className="h-4 w-4 mr-2" />
                  Soil Moisture
                </span>
                <span className="font-bold">
                  {environmentalData.soilMoisture}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  Light Intensity
                </span>
                <span className="font-bold">
                  {environmentalData.lightIntensity} lux
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Yield Forecast
            </CardTitle>
            <CardDescription>Predicted harvest yields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Total Expected Yield</span>
                <span className="font-bold">
                  {yieldForecasts
                    .reduce((sum, forecast) => sum + forecast.expectedYield, 0)
                    .toFixed(1)}
                  g
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Confidence</span>
                <span className="font-bold">
                  {Math.round(
                    (yieldForecasts.reduce(
                      (sum, forecast) => sum + forecast.confidence,
                      0
                    ) /
                      yieldForecasts.length) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Next Harvest</span>
                <span className="font-bold text-green-600">
                  {yieldForecasts.length > 0
                    ? new Date(
                        Math.min(
                          ...yieldForecasts.map((f) => f.harvestDate.getTime())
                        )
                      ).toLocaleDateString()
                    : "No data"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Plant Status */}
      <Card>
        <CardHeader>
          <CardTitle>Plant Status</CardTitle>
          <CardDescription>
            Detailed health and growth status for each plant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plants.map((plant) => {
              const healthBadge = getHealthBadge(plant.healthScore);
              return (
                <div
                  key={plant.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlant === plant.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setSelectedPlant(
                      selectedPlant === plant.id ? null : plant.id
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{plant.name}</h3>
                    <Badge className={healthBadge.color}>
                      {healthBadge.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Health Score
                      </span>
                      <span
                        className={`font-bold ${getHealthColor(
                          plant.healthScore
                        )}`}
                      >
                        {plant.healthScore}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Growth Stage</span>
                        <span className="font-medium">{plant.growthStage}</span>
                      </div>
                      <Progress value={plant.stageProgress} className="h-2" />
                    </div>

                    <div className="text-xs text-gray-500">
                      Last update: {plant.lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Active Alerts
            </CardTitle>
            <CardDescription>Current alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  No active alerts
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg"
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleString()}
                        {alert.plantId && ` • Plant: ${alert.plantId}`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        alert.priority === "critical"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Yield Forecast Details
            </CardTitle>
            <CardDescription>
              Detailed yield predictions by plant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {yieldForecasts.map((forecast) => (
                <div key={forecast.plantId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      Plant {forecast.plantId}
                    </span>
                    <Badge variant="outline">
                      {Math.round(forecast.confidence * 100)}% confidence
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Expected Yield</span>
                      <span className="font-bold">
                        {forecast.expectedYield.toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Range</span>
                      <span className="text-gray-600">
                        {forecast.yieldRange.min.toFixed(1)} -{" "}
                        {forecast.yieldRange.max.toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Harvest Date</span>
                      <span className="text-green-600 font-medium">
                        {forecast.harvestDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
          <CardDescription>
            ML pipeline and data processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">ML Pipeline</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Data Processing</div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Sensors</div>
              <div className="text-xs text-gray-500">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Storage</div>
              <div className="text-xs text-gray-500">Healthy</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
