import {
  PlantHealthDetector,
  HealthAnalysisResult,
} from "./plant-health-detection";
import {
  GrowthStageClassifier,
  GrowthStageAnalysis,
} from "./growth-stage-classifier";
import {
  BerryQualityAssessor,
  QualityAssessmentResult,
} from "./berry-quality-assessor";
import { YieldPredictor, YieldPrediction } from "./yield-predictor";
import {
  ClimateControlAI,
  ClimateOptimizationResult,
} from "./climate-control-ai";
import {
  NutrientManager,
  NutrientOptimizationResult,
} from "./nutrient-manager";

export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
  ph: number;
  ec: number;
  timestamp: Date;
}

export interface PlantImage {
  id: string;
  url: string;
  plantId: string;
  timestamp: Date;
  metadata?: {
    cameraAngle: string;
    lighting: string;
    resolution: string;
  };
}

export interface PlantData {
  id: string;
  variety: string;
  plantingDate: Date;
  currentStage: string;
  healthScore: number;
  berryCount: number;
  daysSincePlanting: number;
  daysSinceFlowering: number;
}

export interface MLPipelineResult {
  plantHealth: HealthAnalysisResult;
  growthStage: GrowthStageAnalysis;
  berryQuality?: QualityAssessmentResult;
  yieldPrediction: YieldPrediction;
  climateOptimization: ClimateOptimizationResult;
  nutrientOptimization: NutrientOptimizationResult;
  overallRecommendations: string[];
  alerts: Alert[];
  nextActions: Action[];
}

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  plantId?: string;
  timestamp: Date;
  priority: "low" | "medium" | "high" | "critical";
}

export interface Action {
  id: string;
  type: "immediate" | "scheduled" | "monitoring";
  description: string;
  plantId?: string;
  dueDate: Date;
  priority: "low" | "medium" | "high" | "critical";
}

export class MLPipeline {
  private plantHealthDetector: PlantHealthDetector;
  private growthStageClassifier: GrowthStageClassifier;
  private berryQualityAssessor: BerryQualityAssessor;
  private yieldPredictor: YieldPredictor;
  private climateControlAI: ClimateControlAI;
  private nutrientManager: NutrientManager;

  constructor() {
    this.plantHealthDetector = new PlantHealthDetector();
    this.growthStageClassifier = new GrowthStageClassifier();
    this.berryQualityAssessor = new BerryQualityAssessor();
    this.yieldPredictor = new YieldPredictor();
    this.climateControlAI = new ClimateControlAI();
    this.nutrientManager = new NutrientManager();
  }

  public async processPlantData(
    plantData: PlantData,
    sensorData: SensorData,
    plantImage: PlantImage
  ): Promise<MLPipelineResult> {
    try {
      console.log(`Processing data for plant ${plantData.id}...`);

      // Run all ML models in parallel
      const [
        healthResult,
        growthResult,
        qualityResult,
        yieldResult,
        climateResult,
        nutrientResult,
      ] = await Promise.all([
        this.analyzePlantHealth(plantImage, plantData),
        this.analyzeGrowthStage(plantImage, plantData),
        this.analyzeBerryQuality(plantImage, plantData),
        this.predictYield(plantData, sensorData, plantImage),
        this.optimizeClimate(sensorData, plantData),
        this.optimizeNutrients(sensorData, plantData),
      ]);

      // Generate overall recommendations and alerts
      const overallRecommendations = this.generateOverallRecommendations({
        healthResult,
        growthResult,
        qualityResult,
        yieldResult,
        climateResult,
        nutrientResult,
      });

      const alerts = this.generateAlerts(
        {
          healthResult,
          growthResult,
          qualityResult,
          yieldResult,
          climateResult,
          nutrientResult,
        },
        plantData
      );

      const nextActions = this.generateNextActions(
        {
          healthResult,
          growthResult,
          qualityResult,
          yieldResult,
          climateResult,
          nutrientResult,
        },
        plantData
      );

      return {
        plantHealth: healthResult,
        growthStage: growthResult,
        berryQuality: qualityResult,
        yieldPrediction: yieldResult,
        climateOptimization: climateResult,
        nutrientOptimization: nutrientResult,
        overallRecommendations,
        alerts,
        nextActions,
      };
    } catch (error) {
      console.error("Error in ML pipeline:", error);
      throw error;
    }
  }

  private async analyzePlantHealth(
    plantImage: PlantImage,
    plantData: PlantData
  ): Promise<HealthAnalysisResult> {
    return await this.plantHealthDetector.analyzePlantHealth(
      plantImage.url,
      plantData.id
    );
  }

  private async analyzeGrowthStage(
    plantImage: PlantImage,
    plantData: PlantData
  ): Promise<GrowthStageAnalysis> {
    return await this.growthStageClassifier.classifyGrowthStage(
      plantImage.url,
      plantData.id,
      plantData.daysSincePlanting
    );
  }

  private async analyzeBerryQuality(
    plantImage: PlantImage,
    plantData: PlantData
  ): Promise<QualityAssessmentResult | undefined> {
    // Only analyze berry quality if plant is in fruiting or harvest-ready stage
    if (
      plantData.currentStage === "fruiting" ||
      plantData.currentStage === "harvest-ready"
    ) {
      return await this.berryQualityAssessor.assessBerryQuality(
        plantImage.url,
        plantData.id,
        plantData.daysSinceFlowering
      );
    }
    return undefined;
  }

  private async predictYield(
    plantData: PlantData,
    sensorData: SensorData,
    plantImage: PlantImage
  ): Promise<YieldPrediction> {
    const environmentalData = {
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      soilMoisture: sensorData.soilMoisture,
      lightIntensity: sensorData.lightIntensity,
      ph: sensorData.ph,
      nutrientLevels: {
        nitrogen: 150, // These would come from actual nutrient sensors
        phosphorus: 100,
        potassium: 200,
      },
    };

    const plantDataForYield = {
      plantId: plantData.id,
      growthStage: plantData.currentStage,
      healthScore: plantData.healthScore,
      berryCount: plantData.berryCount,
      daysSincePlanting: plantData.daysSincePlanting,
      daysSinceFlowering: plantData.daysSinceFlowering,
    };

    return await this.yieldPredictor.predictYield(
      plantDataForYield,
      environmentalData,
      plantImage.url
    );
  }

  private async optimizeClimate(
    sensorData: SensorData,
    plantData: PlantData
  ): Promise<ClimateOptimizationResult> {
    const currentConditions = {
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      lightIntensity: sensorData.lightIntensity,
      soilMoisture: sensorData.soilMoisture,
      timestamp: sensorData.timestamp,
    };

    const plantResponse = {
      healthScore: plantData.healthScore,
      growthRate: 0.8, // This would be calculated from historical data
      stressIndicators: [],
      timestamp: sensorData.timestamp,
    };

    const targets = this.getClimateTargets(plantData.currentStage);
    const timeOfDay = new Date().getHours();

    return await this.climateControlAI.optimizeClimate(
      currentConditions,
      plantResponse,
      targets,
      timeOfDay
    );
  }

  private async optimizeNutrients(
    sensorData: SensorData,
    plantData: PlantData
  ): Promise<NutrientOptimizationResult> {
    const currentNutrients = {
      nitrogen: 150,
      phosphorus: 100,
      potassium: 200,
      calcium: 200,
      magnesium: 50,
      sulfur: 50,
      iron: 2,
      manganese: 1,
      zinc: 1,
      copper: 0.5,
      boron: 0.5,
      molybdenum: 0.1,
    };

    const waterQuality = {
      ph: sensorData.ph,
      ec: sensorData.ec,
      temperature: sensorData.temperature,
      dissolvedOxygen: 8, // This would come from DO sensor
      alkalinity: 100, // This would come from alkalinity sensor
    };

    const plantHealth = {
      healthScore: plantData.healthScore,
      growthRate: 0.8,
      leafColor: "green" as const,
      leafSize: "normal" as const,
      rootHealth: "good" as const,
      stressIndicators: [],
    };

    const growthStage = {
      stage: plantData.currentStage,
      daysInStage: plantData.daysSincePlanting,
      expectedDuration: 140,
      nutrientRequirements: this.getNutrientRequirements(
        plantData.currentStage
      ),
    };

    return await this.nutrientManager.optimizeNutrients(
      currentNutrients,
      waterQuality,
      plantHealth,
      growthStage
    );
  }

  private getClimateTargets(growthStage: string) {
    const targets = {
      temperature: { min: 18, optimal: 21, max: 24 },
      humidity: { min: 60, optimal: 70, max: 80 },
      lightIntensity: { min: 2000, optimal: 5000, max: 8000 },
      lightHours: { min: 12, optimal: 14, max: 16 },
    };

    // Adjust targets based on growth stage
    switch (growthStage) {
      case "germination":
        targets.temperature = { min: 20, optimal: 22, max: 25 };
        targets.humidity = { min: 70, optimal: 80, max: 85 };
        targets.lightIntensity = { min: 1000, optimal: 2000, max: 3000 };
        break;
      case "flowering":
        targets.temperature = { min: 18, optimal: 20, max: 23 };
        targets.humidity = { min: 65, optimal: 75, max: 80 };
        break;
      case "fruiting":
        targets.temperature = { min: 18, optimal: 21, max: 24 };
        targets.humidity = { min: 60, optimal: 70, max: 75 };
        break;
    }

    return targets;
  }

  private getNutrientRequirements(growthStage: string) {
    const requirements = {
      nitrogen: 150,
      phosphorus: 100,
      potassium: 200,
      calcium: 200,
      magnesium: 50,
      sulfur: 50,
      iron: 2,
      manganese: 1,
      zinc: 1,
      copper: 0.5,
      boron: 0.5,
      molybdenum: 0.1,
    };

    // Adjust requirements based on growth stage
    switch (growthStage) {
      case "germination":
        requirements.nitrogen = 100;
        requirements.phosphorus = 50;
        requirements.potassium = 100;
        break;
      case "vegetative":
        requirements.nitrogen = 200;
        requirements.phosphorus = 100;
        requirements.potassium = 200;
        break;
      case "flowering":
        requirements.nitrogen = 180;
        requirements.phosphorus = 150;
        requirements.potassium = 250;
        break;
      case "fruiting":
        requirements.nitrogen = 150;
        requirements.phosphorus = 120;
        requirements.potassium = 300;
        break;
    }

    return requirements;
  }

  private generateOverallRecommendations(results: {
    healthResult: HealthAnalysisResult;
    growthResult: GrowthStageAnalysis;
    qualityResult?: QualityAssessmentResult;
    yieldResult: YieldPrediction;
    climateResult: ClimateOptimizationResult;
    nutrientResult: NutrientOptimizationResult;
  }): string[] {
    const recommendations: string[] = [];

    // Health-based recommendations
    if (results.healthResult.severity === "critical") {
      recommendations.push(
        "URGENT: Plant health critical - immediate intervention required"
      );
    } else if (results.healthResult.severity === "high") {
      recommendations.push(
        "Plant health needs attention - implement recommended actions"
      );
    }

    // Growth stage recommendations
    if (results.growthResult.isTransitioning) {
      recommendations.push(
        `Plant transitioning to ${results.growthResult.nextStage} stage - adjust care routine`
      );
    }

    // Quality recommendations
    if (results.qualityResult) {
      if (results.qualityResult.harvestRecommendation === "harvest_now") {
        recommendations.push(
          "Berries ready for harvest - schedule immediate harvest"
        );
      } else if (
        results.qualityResult.harvestRecommendation === "wait_1_2_days"
      ) {
        recommendations.push(
          "Berries nearly ready - prepare for harvest in 1-2 days"
        );
      }
    }

    // Yield recommendations
    if (results.yieldResult.expectedYield < 50) {
      recommendations.push(
        "Low yield prediction - review growing conditions and care practices"
      );
    }

    // Climate recommendations
    if (
      results.climateResult.commands.some((cmd) => cmd.priority === "critical")
    ) {
      recommendations.push(
        "Critical climate adjustments needed - implement immediately"
      );
    }

    // Nutrient recommendations
    if (
      results.nutrientResult.adjustments.some(
        (adj) => adj.priority === "critical"
      )
    ) {
      recommendations.push(
        "Critical nutrient adjustments required - implement immediately"
      );
    }

    return recommendations;
  }

  private generateAlerts(results: any, plantData: PlantData): Alert[] {
    const alerts: Alert[] = [];

    // Health alerts
    if (results.healthResult.severity === "critical") {
      alerts.push({
        id: `health-critical-${plantData.id}`,
        type: "critical",
        message: `Critical plant health issue: ${results.healthResult.problemClassification}`,
        plantId: plantData.id,
        timestamp: new Date(),
        priority: "critical",
      });
    }

    // Climate alerts
    const criticalClimateCommands = results.climateResult.commands.filter(
      (cmd: any) => cmd.priority === "critical"
    );
    criticalClimateCommands.forEach((cmd: any) => {
      alerts.push({
        id: `climate-critical-${plantData.id}-${Date.now()}`,
        type: "critical",
        message: `Critical climate issue: ${cmd.reasoning}`,
        plantId: plantData.id,
        timestamp: new Date(),
        priority: "critical",
      });
    });

    // Nutrient alerts
    const criticalNutrientAdjustments =
      results.nutrientResult.adjustments.filter(
        (adj: any) => adj.priority === "critical"
      );
    criticalNutrientAdjustments.forEach((adj: any) => {
      alerts.push({
        id: `nutrient-critical-${plantData.id}-${Date.now()}`,
        type: "critical",
        message: `Critical nutrient issue: ${adj.reasoning}`,
        plantId: plantData.id,
        timestamp: new Date(),
        priority: "critical",
      });
    });

    // Harvest alerts
    if (
      results.qualityResult &&
      results.qualityResult.harvestRecommendation === "harvest_now"
    ) {
      alerts.push({
        id: `harvest-ready-${plantData.id}`,
        type: "warning",
        message: "Berries ready for harvest",
        plantId: plantData.id,
        timestamp: new Date(),
        priority: "high",
      });
    }

    return alerts;
  }

  private generateNextActions(results: any, plantData: PlantData): Action[] {
    const actions: Action[] = [];

    // Immediate actions for critical issues
    if (results.healthResult.severity === "critical") {
      actions.push({
        id: `health-action-${plantData.id}`,
        type: "immediate",
        description: "Address critical plant health issues",
        plantId: plantData.id,
        dueDate: new Date(),
        priority: "critical",
      });
    }

    // Climate control actions
    const highPriorityClimateCommands = results.climateResult.commands.filter(
      (cmd: any) => cmd.priority === "high" || cmd.priority === "critical"
    );
    highPriorityClimateCommands.forEach((cmd: any) => {
      actions.push({
        id: `climate-action-${plantData.id}-${Date.now()}`,
        type: "immediate",
        description: `Climate control: ${cmd.reasoning}`,
        plantId: plantData.id,
        dueDate: new Date(),
        priority: cmd.priority,
      });
    });

    // Nutrient actions
    const highPriorityNutrientAdjustments =
      results.nutrientResult.adjustments.filter(
        (adj: any) => adj.priority === "high" || adj.priority === "critical"
      );
    highPriorityNutrientAdjustments.forEach((adj: any) => {
      actions.push({
        id: `nutrient-action-${plantData.id}-${Date.now()}`,
        type: "immediate",
        description: `Nutrient adjustment: ${adj.reasoning}`,
        plantId: plantData.id,
        dueDate: new Date(),
        priority: adj.priority,
      });
    });

    // Scheduled actions
    const nextCheckDate = new Date();
    nextCheckDate.setDate(nextCheckDate.getDate() + 1);

    actions.push({
      id: `monitoring-${plantData.id}`,
      type: "scheduled",
      description: "Daily plant monitoring and assessment",
      plantId: plantData.id,
      dueDate: nextCheckDate,
      priority: "medium",
    });

    return actions;
  }

  public async batchProcess(
    plantsData: {
      plantData: PlantData;
      sensorData: SensorData;
      plantImage: PlantImage;
    }[]
  ): Promise<MLPipelineResult[]> {
    const results: MLPipelineResult[] = [];

    for (const data of plantsData) {
      try {
        const result = await this.processPlantData(
          data.plantData,
          data.sensorData,
          data.plantImage
        );
        results.push(result);
      } catch (error) {
        console.error(`Error processing plant ${data.plantData.id}:`, error);
      }
    }

    return results;
  }
}
