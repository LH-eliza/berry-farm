# Berry Farm Machine Learning Pipeline

## Overview

This repository contains a comprehensive machine learning pipeline for strawberry farming optimization. The system integrates computer vision models, environmental optimization AI, and real-time monitoring to maximize berry yield and quality.

## 🧠 Phase 2: Machine Learning Pipeline

### Computer Vision Models

#### 1. Plant Health Detection

- **Objective**: Identify healthy vs. stressed plants
- **Input**: Daily plant images
- **Output**: Health score, problem classification
- **Architecture**: CNN with transfer learning (ResNet/EfficientNet)
- **Features**:
  - Health scoring (0-100)
  - Problem classification (Healthy, Minor Stress, Moderate Stress, Severe Stress, Critical)
  - Confidence scoring
  - Actionable recommendations
  - Severity assessment

#### 2. Growth Stage Classification

- **Objective**: Determine growth stage automatically
- **Stages**: Germination, seedling, vegetative, flowering, fruiting, harvest-ready, post-harvest
- **Benefits**: Automated care scheduling
- **Features**:
  - Stage confidence scoring
  - Progress tracking (0-100%)
  - Days to next stage estimation
  - Stage-specific care recommendations
  - Growth rate analysis

#### 3. Berry Quality Assessment

- **Objective**: Predict berry quality before harvest
- **Metrics**: Size, shape, color uniformity, firmness prediction
- **Output**: Quality grade, optimal harvest timing
- **Features**:
  - Quality grading (A-F)
  - Harvest recommendations
  - Quality trend analysis
  - Optimal harvest date prediction

#### 4. Yield Prediction

- **Objective**: Forecast harvest quantity and timing
- **Input**: Plant images, environmental data, historical yields
- **Output**: Expected yield per plant, harvest schedule
- **Features**:
  - Yield range prediction (min-max)
  - Confidence scoring
  - Factor analysis (positive/negative)
  - Historical trend analysis

### Environmental Optimization Models

#### 1. Climate Control AI

- **Objective**: Optimize temperature, humidity, light cycles
- **Input**: Sensor data, plant response, growth targets
- **Output**: HVAC and lighting control commands
- **Features**:
  - Multi-parameter optimization
  - Priority-based control commands
  - Energy efficiency monitoring
  - Plant health projection
  - Adaptive learning

#### 2. Nutrient Management

- **Objective**: Optimize hydroponic nutrient delivery
- **Input**: Plant health indicators, growth stage, water quality
- **Output**: Nutrient recipe adjustments
- **Features**:
  - 12-nutrient optimization (N, P, K, Ca, Mg, S, Fe, Mn, Zn, Cu, B, Mo)
  - pH and EC target management
  - Deficiency symptom detection
  - Growth stage-specific requirements
  - Historical learning

## 🏗️ System Architecture

### Data Pipeline Architecture

```
Sensors/Cameras → Edge Processing → Cloud Storage → ML Pipeline → Control Systems
```

#### Components:

1. **Data Sources**

   - Environmental sensors (temperature, humidity, soil moisture, light, pH, EC)
   - High-resolution cameras
   - Manual data entry

2. **Edge Processing**

   - Data validation and quality assessment
   - Real-time preprocessing
   - Local decision making

3. **Cloud Storage**

   - Secure data storage
   - Historical analysis
   - Backup and redundancy

4. **ML Pipeline**

   - Model orchestration
   - Batch and real-time processing
   - Result aggregation

5. **Control Systems**
   - Automated environmental controls
   - Alert generation
   - Action recommendations

### Real-time Monitoring Dashboard

#### Features:

- **Live plant health status**: Real-time health scoring and alerts
- **Growth progress tracking**: Visual progress indicators and stage transitions
- **Environmental conditions**: Current sensor readings and trends
- **Yield forecasts**: Predictive analytics and harvest scheduling
- **Alert system**: Priority-based notifications and recommendations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd strawberry-monitor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Access the application**
   - Main dashboard: http://localhost:3000
   - ML Demo: http://localhost:3000/ml-demo

### Project Structure

```
strawberry-monitor/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main landing page
│   │   └── ml-demo/
│   │       └── page.tsx             # ML pipeline demo
│   ├── components/
│   │   ├── ui/                      # UI components
│   │   └── ml/
│   │       └── MLDashboard.tsx      # ML monitoring dashboard
│   └── lib/
│       └── ml/                      # ML pipeline components
│           ├── plant-health-detection.ts
│           ├── growth-stage-classifier.ts
│           ├── berry-quality-assessor.ts
│           ├── yield-predictor.ts
│           ├── climate-control-ai.ts
│           ├── nutrient-manager.ts
│           ├── ml-pipeline.ts
│           └── data-pipeline.ts
```

## 📊 ML Pipeline Components

### Core Models

#### PlantHealthDetector

```typescript
const detector = new PlantHealthDetector();
const result = await detector.analyzePlantHealth(imageUrl, plantId);
// Returns: HealthAnalysisResult with score, classification, recommendations
```

#### GrowthStageClassifier

```typescript
const classifier = new GrowthStageClassifier();
const result = await classifier.classifyGrowthStage(
  imageUrl,
  plantId,
  daysSincePlanting
);
// Returns: GrowthStageAnalysis with stage, progress, recommendations
```

#### BerryQualityAssessor

```typescript
const assessor = new BerryQualityAssessor();
const result = await assessor.assessBerryQuality(
  imageUrl,
  plantId,
  daysSinceFlowering
);
// Returns: QualityAssessmentResult with grade, metrics, harvest timing
```

#### YieldPredictor

```typescript
const predictor = new YieldPredictor();
const result = await predictor.predictYield(
  plantData,
  environmentalData,
  imageUrl
);
// Returns: YieldPrediction with expected yield, confidence, harvest date
```

#### ClimateControlAI

```typescript
const climateAI = new ClimateControlAI();
const result = await climateAI.optimizeClimate(
  currentConditions,
  plantResponse,
  targets,
  timeOfDay
);
// Returns: ClimateOptimizationResult with commands, predictions, recommendations
```

#### NutrientManager

```typescript
const nutrientManager = new NutrientManager();
const result = await nutrientManager.optimizeNutrients(
  currentNutrients,
  waterQuality,
  plantHealth,
  growthStage
);
// Returns: NutrientOptimizationResult with adjustments, recipe, recommendations
```

### Pipeline Orchestration

#### MLPipeline

```typescript
const pipeline = new MLPipeline();
const result = await pipeline.processPlantData(
  plantData,
  sensorData,
  plantImage
);
// Returns: Complete analysis with all model results, alerts, and actions
```

#### DataPipeline

```typescript
const dataPipeline = new DataPipeline(config);
await dataPipeline.ingestData(sensorData, plantImage, plantData);
const results = await dataPipeline.processBatch();
```

## 🎯 Usage Examples

### Basic Plant Analysis

```typescript
import { MLPipeline } from "@/lib/ml/ml-pipeline";

const pipeline = new MLPipeline();

const plantData = {
  id: "plant-1",
  variety: "Albion",
  plantingDate: new Date("2024-01-01"),
  currentStage: "fruiting",
  healthScore: 85,
  berryCount: 12,
  daysSincePlanting: 90,
  daysSinceFlowering: 30,
};

const sensorData = {
  temperature: 22.5,
  humidity: 68,
  soilMoisture: 75,
  lightIntensity: 4500,
  ph: 6.1,
  ec: 1.4,
  timestamp: new Date(),
};

const plantImage = {
  id: "img-1",
  url: "https://example.com/plant-image.jpg",
  plantId: "plant-1",
  timestamp: new Date(),
};

const result = await pipeline.processPlantData(
  plantData,
  sensorData,
  plantImage
);
console.log("Health Score:", result.plantHealth.healthScore);
console.log("Growth Stage:", result.growthStage.currentStage);
console.log("Expected Yield:", result.yieldPrediction.expectedYield);
```

### Batch Processing

```typescript
import { DataPipeline } from "@/lib/ml/data-pipeline";

const config = {
  edgeProcessing: {
    enabled: true,
    maxProcessingTime: 5000,
    qualityThreshold: 0.7,
  },
  cloudStorage: {
    bucket: "berry-farm-data",
    region: "us-west-2",
    retentionDays: 365,
    compression: true,
  },
  mlPipeline: {
    batchSize: 10,
    processingInterval: 30000,
    retryAttempts: 3,
  },
  monitoring: {
    alertThresholds: {
      processingTime: 10000,
      errorRate: 0.05,
      dataQuality: 0.8,
    },
  },
};

const dataPipeline = new DataPipeline(config);

// Ingest data
await dataPipeline.ingestData(sensorData, plantImage, plantData);

// Process batch
const results = await dataPipeline.processBatch();

// Get metrics
const metrics = dataPipeline.getMetrics();
console.log("Processing metrics:", metrics);
```

## 🔧 Configuration

### ML Pipeline Configuration

```typescript
interface MLPipelineConfig {
  models: {
    plantHealth: {
      confidenceThreshold: number;
      updateInterval: number;
    };
    growthStage: {
      stageTransitionThreshold: number;
    };
    berryQuality: {
      qualityThreshold: number;
    };
    yieldPrediction: {
      predictionHorizon: number;
    };
  };
  processing: {
    batchSize: number;
    parallelProcessing: boolean;
    retryAttempts: number;
  };
}
```

### Data Pipeline Configuration

```typescript
interface DataPipelineConfig {
  edgeProcessing: {
    enabled: boolean;
    maxProcessingTime: number;
    qualityThreshold: number;
  };
  cloudStorage: {
    bucket: string;
    region: string;
    retentionDays: number;
    compression: boolean;
  };
  mlPipeline: {
    batchSize: number;
    processingInterval: number;
    retryAttempts: number;
  };
  monitoring: {
    alertThresholds: {
      processingTime: number;
      errorRate: number;
      dataQuality: number;
    };
  };
}
```

## 📈 Monitoring and Analytics

### Key Metrics

- **Processing Time**: Average time to process plant data
- **Model Accuracy**: Overall prediction accuracy
- **Data Quality**: Quality score of incoming data
- **Model Confidence**: Confidence levels across all models

### Alert System

- **Critical Alerts**: Immediate action required
- **High Priority**: Important issues needing attention
- **Medium Priority**: Issues to monitor
- **Low Priority**: Informational updates

### Dashboard Features

- Real-time data visualization
- Historical trend analysis
- Performance metrics
- Alert management
- Action recommendations

## 🔮 Future Enhancements

### Phase 3: Advanced Features

- **Predictive Maintenance**: Equipment failure prediction
- **Weather Integration**: External weather data integration
- **Market Analysis**: Price prediction and market trends
- **Supply Chain Optimization**: Inventory and logistics management
- **Mobile App**: Native mobile application
- **API Integration**: Third-party system integration

### Model Improvements

- **Transfer Learning**: Pre-trained model fine-tuning
- **Ensemble Methods**: Multiple model combination
- **Active Learning**: Continuous model improvement
- **Edge AI**: On-device model deployment
- **Federated Learning**: Distributed model training

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the demo application

---

**Built with ❤️ for smart agriculture**
