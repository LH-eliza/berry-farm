import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Camera,
  Activity,
  TrendingUp,
  Leaf,
  Droplets,
  Thermometer,
  Sun,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold">Berry Farm Monitor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/ml-demo">
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  ML Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Berry Farming with
              <span className="text-green-600"> AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Advanced machine learning pipeline for optimizing strawberry
              cultivation. Monitor plant health, predict yields, and automate
              environmental controls.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ml-demo">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Brain className="h-5 w-5 mr-2" />
                  Explore ML Pipeline
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <Activity className="h-5 w-5 mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Phase 2: Machine Learning Pipeline
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive AI-powered monitoring and optimization system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Computer Vision Models */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-6 w-6 mr-2 text-blue-600" />
                  Computer Vision Models
                </CardTitle>
                <CardDescription>
                  Advanced image analysis for plant monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plant Health Detection</span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Growth Stage Classification</span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Berry Quality Assessment</span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Yield Prediction</span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Optimization */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-6 w-6 mr-2 text-purple-600" />
                  Environmental Optimization
                </CardTitle>
                <CardDescription>
                  AI-powered climate and nutrient management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Climate Control AI</span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nutrient Management</span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HVAC Control</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lighting Control</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      Connected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Pipeline */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-orange-600" />
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
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
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
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              System Integration Architecture
            </h2>
            <p className="text-lg text-gray-600">
              End-to-end data flow from sensors to AI insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Data Flow</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Camera className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Sensors & Cameras</h4>
                    <p className="text-sm text-gray-600">
                      Real-time environmental and image data collection
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Edge Processing</h4>
                    <p className="text-sm text-gray-600">
                      Local data validation and preprocessing
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Cloud Storage</h4>
                    <p className="text-sm text-gray-600">
                      Secure data storage and historical analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">ML Pipeline</h4>
                    <p className="text-sm text-gray-600">
                      AI model processing and insights generation
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Control Systems</h4>
                    <p className="text-sm text-gray-600">
                      Automated environmental and nutrient control
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Key Features
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">
                    Real-time Monitoring Dashboard
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Live plant health status</li>
                    <li>• Growth progress tracking</li>
                    <li>• Environmental conditions</li>
                    <li>• Yield forecasts</li>
                    <li>• Alert system for problems</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">AI-Powered Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Plant health scoring</li>
                    <li>• Growth stage classification</li>
                    <li>• Berry quality assessment</li>
                    <li>• Yield prediction</li>
                    <li>• Optimal harvest timing</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Automated Controls</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Climate optimization</li>
                    <li>• Nutrient management</li>
                    <li>• Lighting control</li>
                    <li>• Ventilation systems</li>
                    <li>• Irrigation scheduling</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience Smart Farming?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Explore our machine learning pipeline in action with real-time data
            and AI insights.
          </p>
          <Link href="/ml-demo">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Brain className="h-5 w-5 mr-2" />
              Launch ML Demo
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Berry Farm Monitor</h3>
              <p className="text-gray-400">
                Advanced machine learning system for optimizing strawberry
                cultivation and maximizing yield quality.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Technologies</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Computer Vision</li>
                <li>• Machine Learning</li>
                <li>• IoT Sensors</li>
                <li>• Cloud Computing</li>
                <li>• Real-time Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Plant Health Detection</li>
                <li>• Growth Stage Classification</li>
                <li>• Berry Quality Assessment</li>
                <li>• Yield Prediction</li>
                <li>• Environmental Optimization</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Berry Farm Monitor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
