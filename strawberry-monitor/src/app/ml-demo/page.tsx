"use client";

import React, { useState, useEffect } from "react";
import MLDashboard from "@/components/ml/MLDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Brain,
  Camera,
  Activity,
  TrendingUp,
} from "lucide-react";

// Simulated data for demo
const generateDemoData = () => {
  const plants = [
    {
      id: "plant-1",
      name: "Strawberry Plant A",
      healthScore: 85,
      growthStage: "fruiting",
      stageProgress: 75,
      lastUpdate: new Date(),
      alerts: [],
    },
    {
      id: "plant-2",
      name: "Strawberry Plant B",
      healthScore: 72,
      growthStage: "flowering",
      stageProgress: 45,
      lastUpdate: new Date(),
      alerts: [
        {
          id: "alert-1",
          type: "warning" as const,
          message: "Slight nutrient deficiency detected",
          plantId: "plant-2",
          timestamp: new Date(),
          priority: "medium" as const,
        },
      ],
    },
    {
      id: "plant-3",
      name: "Strawberry Plant C",
      healthScore: 95,
      growthStage: "harvest-ready",
      stageProgress: 95,
      lastUpdate: new Date(),
      alerts: [],
    },
  ];

  const environmentalData = {
    temperature: 22.5,
    humidity: 68,
    soilMoisture: 75,
    lightIntensity: 4500,
    ph: 6.1,
    ec: 1.4,
    timestamp: new Date(),
  };

  const yieldForecasts = [
    {
      plantId: "plant-1",
      expectedYield: 125.5,
      confidence: 0.85,
      harvestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      yieldRange: { min: 110, max: 140 },
    },
    {
      plantId: "plant-2",
      expectedYield: 95.2,
      confidence: 0.72,
      harvestDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      yieldRange: { min: 80, max: 110 },
    },
    {
      plantId: "plant-3",
      expectedYield: 180.0,
      confidence: 0.95,
      harvestDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      yieldRange: { min: 170, max: 190 },
    },
  ];

  const alerts = [
    {
      id: "alert-1",
      type: "warning" as const,
      message: "Slight nutrient deficiency detected in Plant B",
      plantId: "plant-2",
      timestamp: new Date(),
      priority: "medium" as const,
    },
    {
      id: "alert-2",
      type: "info" as const,
      message: "Plant C ready for harvest in 2 days",
      plantId: "plant-3",
      timestamp: new Date(),
      priority: "low" as const,
    },
  ];

  return { plants, environmentalData, yieldForecasts, alerts };
};

export default function MLDemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [demoData, setDemoData] = useState(generateDemoData());
  const [mlMetrics, setMlMetrics] = useState({
    processingTime: 245,
    accuracy: 94.2,
    dataQuality: 98.5,
    modelConfidence: 87.3,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        // Simulate real-time data updates
        setDemoData((prevData) => ({
          ...prevData,
          environmentalData: {
            ...prevData.environmentalData,
            temperature:
              prevData.environmentalData.temperature +
              (Math.random() - 0.5) * 2,
            humidity: Math.max(
              50,
              Math.min(
                85,
                prevData.environmentalData.humidity + (Math.random() - 0.5) * 5
              )
            ),
            soilMoisture: Math.max(
              60,
              Math.min(
                90,
                prevData.environmentalData.soilMoisture +
                  (Math.random() - 0.5) * 3
              )
            ),
            timestamp: new Date(),
          },
        }));

        // Update ML metrics
        setMlMetrics((prev) => ({
          processingTime: prev.processingTime + (Math.random() - 0.5) * 10,
          accuracy: Math.max(
            90,
            Math.min(98, prev.accuracy + (Math.random() - 0.5) * 2)
          ),
          dataQuality: Math.max(
            95,
            Math.min(100, prev.dataQuality + (Math.random() - 0.5) * 1)
          ),
          modelConfidence: Math.max(
            80,
            Math.min(95, prev.modelConfidence + (Math.random() - 0.5) * 3)
          ),
        }));
      }, 3000); // Update every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleToggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const handleResetData = () => {
    setDemoData(generateDemoData());
    setMlMetrics({
      processingTime: 245,
      accuracy: 94.2,
      dataQuality: 98.5,
      modelConfidence: 87.3,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold">
                Berry Farm ML Pipeline Demo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleToggleSimulation}
                variant={isRunning ? "destructive" : "default"}
                size="sm"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Simulation
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Simulation
                  </>
                )}
              </Button>
              <Button onClick={handleResetData} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ML Pipeline Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mlMetrics.processingTime.toFixed(0)}ms
              </div>
              <Progress
                value={Math.min(100, (mlMetrics.processingTime / 500) * 100)}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Model Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mlMetrics.accuracy.toFixed(1)}%
              </div>
              <Progress value={mlMetrics.accuracy} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Data Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mlMetrics.dataQuality.toFixed(1)}%
              </div>
              <Progress value={mlMetrics.dataQuality} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Model Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mlMetrics.modelConfidence.toFixed(1)}%
              </div>
              <Progress value={mlMetrics.modelConfidence} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* ML Models Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Computer Vision Models
              </CardTitle>
              <CardDescription>
                Plant health, growth stage, and quality assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plant Health Detection</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Growth Stage Classification</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Berry Quality Assessment</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Yield Prediction</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Environmental Optimization
              </CardTitle>
              <CardDescription>
                Climate control and nutrient management AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Climate Control AI</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nutrient Management</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">HVAC Control</span>
                  <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lighting Control</span>
                  <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Data Pipeline
              </CardTitle>
              <CardDescription>
                Real-time data processing and storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Edge Processing</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cloud Storage</span>
                  <Badge className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sensor Data</span>
                  <Badge className="bg-green-100 text-green-800">
                    Streaming
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Image Processing</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <MLDashboard
          plants={demoData.plants}
          environmentalData={demoData.environmentalData}
          yieldForecasts={demoData.yieldForecasts}
          alerts={demoData.alerts}
        />
      </div>
    </div>
  );
}
