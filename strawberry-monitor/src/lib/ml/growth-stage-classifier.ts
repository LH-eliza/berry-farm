export type GrowthStage =
  | "germination"
  | "seedling"
  | "vegetative"
  | "flowering"
  | "fruiting"
  | "harvest-ready"
  | "post-harvest";

export interface GrowthStageData {
  stage: GrowthStage;
  confidence: number;
  daysInStage: number;
  estimatedDaysToNextStage: number;
  stageProgress: number; // 0-100 percentage
  recommendations: string[];
}

export interface GrowthStageAnalysis {
  currentStage: GrowthStage;
  confidence: number;
  stageProgress: number;
  estimatedDaysToNextStage: number;
  careRecommendations: string[];
  nextStage: GrowthStage;
  isTransitioning: boolean;
}

export class GrowthStageClassifier {
  private model: any;
  private isModelLoaded: boolean = false;
  private stageTransitions: Record<GrowthStage, GrowthStage> = {
    germination: "seedling",
    seedling: "vegetative",
    vegetative: "flowering",
    flowering: "fruiting",
    fruiting: "harvest-ready",
    "harvest-ready": "post-harvest",
    "post-harvest": "germination",
  };

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      console.log("Loading growth stage classification model...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.isModelLoaded = true;
      console.log("Growth stage classification model loaded successfully");
    } catch (error) {
      console.error("Failed to load growth stage classification model:", error);
    }
  }

  public async classifyGrowthStage(
    imageUrl: string,
    plantId: string,
    daysSincePlanting: number
  ): Promise<GrowthStageAnalysis> {
    if (!this.isModelLoaded) {
      throw new Error("Model not loaded yet");
    }

    try {
      // Simulate growth stage classification based on image and time
      const currentStage = this.simulateGrowthStage(daysSincePlanting);
      const confidence = this.calculateStageConfidence(
        currentStage,
        daysSincePlanting
      );
      const stageProgress = this.calculateStageProgress(
        currentStage,
        daysSincePlanting
      );
      const estimatedDaysToNextStage = this.estimateDaysToNextStage(
        currentStage,
        stageProgress
      );
      const careRecommendations =
        this.generateCareRecommendations(currentStage);
      const nextStage = this.stageTransitions[currentStage];
      const isTransitioning = stageProgress > 80;

      return {
        currentStage,
        confidence,
        stageProgress,
        estimatedDaysToNextStage,
        careRecommendations,
        nextStage,
        isTransitioning,
      };
    } catch (error) {
      console.error("Error classifying growth stage:", error);
      throw error;
    }
  }

  private simulateGrowthStage(daysSincePlanting: number): GrowthStage {
    if (daysSincePlanting <= 7) return "germination";
    if (daysSincePlanting <= 21) return "seedling";
    if (daysSincePlanting <= 60) return "vegetative";
    if (daysSincePlanting <= 90) return "flowering";
    if (daysSincePlanting <= 120) return "fruiting";
    if (daysSincePlanting <= 140) return "harvest-ready";
    return "post-harvest";
  }

  private calculateStageConfidence(
    stage: GrowthStage,
    daysSincePlanting: number
  ): number {
    // Higher confidence for typical stage durations
    const stageDurations = {
      germination: { min: 0, max: 7, optimal: 5 },
      seedling: { min: 7, max: 21, optimal: 14 },
      vegetative: { min: 21, max: 60, optimal: 40 },
      flowering: { min: 60, max: 90, optimal: 75 },
      fruiting: { min: 90, max: 120, optimal: 105 },
      "harvest-ready": { min: 120, max: 140, optimal: 130 },
      "post-harvest": { min: 140, max: 365, optimal: 200 },
    };

    const duration = stageDurations[stage];
    const distanceFromOptimal = Math.abs(daysSincePlanting - duration.optimal);
    const maxDistance = duration.max - duration.min;

    return Math.max(0.5, 1 - distanceFromOptimal / maxDistance);
  }

  private calculateStageProgress(
    stage: GrowthStage,
    daysSincePlanting: number
  ): number {
    const stageDurations = {
      germination: { min: 0, max: 7 },
      seedling: { min: 7, max: 21 },
      vegetative: { min: 21, max: 60 },
      flowering: { min: 60, max: 90 },
      fruiting: { min: 90, max: 120 },
      "harvest-ready": { min: 120, max: 140 },
      "post-harvest": { min: 140, max: 365 },
    };

    const duration = stageDurations[stage];
    const progress =
      (daysSincePlanting - duration.min) / (duration.max - duration.min);
    return Math.min(100, Math.max(0, progress * 100));
  }

  private estimateDaysToNextStage(
    stage: GrowthStage,
    stageProgress: number
  ): number {
    const stageDurations = {
      germination: 7,
      seedling: 14,
      vegetative: 39,
      flowering: 30,
      fruiting: 30,
      "harvest-ready": 20,
      "post-harvest": 225,
    };

    const remainingProgress = (100 - stageProgress) / 100;
    return Math.round(stageDurations[stage] * remainingProgress);
  }

  private generateCareRecommendations(stage: GrowthStage): string[] {
    const recommendations: Record<GrowthStage, string[]> = {
      germination: [
        "Maintain consistent soil moisture",
        "Keep temperature between 18-24°C",
        "Ensure adequate humidity (70-80%)",
        "Provide gentle, indirect light",
      ],
      seedling: [
        "Gradually increase light exposure",
        "Maintain soil moisture without overwatering",
        "Begin gentle fertilization",
        "Monitor for damping off disease",
      ],
      vegetative: [
        "Provide 14-16 hours of light daily",
        "Maintain consistent watering schedule",
        "Apply balanced fertilizer every 2 weeks",
        "Ensure good air circulation",
        "Monitor for pest infestations",
      ],
      flowering: [
        "Reduce nitrogen, increase phosphorus",
        "Maintain consistent moisture",
        "Ensure adequate pollination",
        "Monitor temperature (18-24°C)",
        "Provide 12-14 hours of light",
      ],
      fruiting: [
        "Increase potassium for fruit development",
        "Maintain consistent watering",
        "Support heavy fruit clusters",
        "Monitor for pests and diseases",
        "Ensure adequate calcium for fruit quality",
      ],
      "harvest-ready": [
        "Reduce watering slightly",
        "Monitor fruit color and firmness",
        "Prepare for harvest timing",
        "Check for optimal ripeness indicators",
        "Plan harvest schedule",
      ],
      "post-harvest": [
        "Clean up plant debris",
        "Assess plant health for next cycle",
        "Prepare soil for next planting",
        "Document yield and quality data",
        "Plan for crop rotation if needed",
      ],
    };

    return recommendations[stage] || [];
  }

  public async trackGrowthProgression(
    plantId: string,
    historicalData: { stage: GrowthStage; date: Date }[]
  ): Promise<{
    averageStageDuration: number;
    stageTransitions: { from: GrowthStage; to: GrowthStage; date: Date }[];
    growthRate: number;
  }> {
    const transitions = [];
    let totalDuration = 0;
    let transitionCount = 0;

    for (let i = 1; i < historicalData.length; i++) {
      const current = historicalData[i];
      const previous = historicalData[i - 1];

      if (current.stage !== previous.stage) {
        const duration =
          (current.date.getTime() - previous.date.getTime()) /
          (1000 * 60 * 60 * 24);
        totalDuration += duration;
        transitionCount++;

        transitions.push({
          from: previous.stage,
          to: current.stage,
          date: current.date,
        });
      }
    }

    const averageStageDuration =
      transitionCount > 0 ? totalDuration / transitionCount : 0;
    const growthRate = this.calculateGrowthRate(historicalData);

    return {
      averageStageDuration,
      stageTransitions: transitions,
      growthRate,
    };
  }

  private calculateGrowthRate(
    historicalData: { stage: GrowthStage; date: Date }[]
  ): number {
    if (historicalData.length < 2) return 0;

    const firstDate = historicalData[0].date;
    const lastDate = historicalData[historicalData.length - 1].date;
    const totalDays =
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

    const stageValues = {
      germination: 1,
      seedling: 2,
      vegetative: 3,
      flowering: 4,
      fruiting: 5,
      "harvest-ready": 6,
      "post-harvest": 7,
    };

    const firstStage = stageValues[historicalData[0].stage];
    const lastStage =
      stageValues[historicalData[historicalData.length - 1].stage];
    const stageProgress = lastStage - firstStage;

    return totalDays > 0 ? stageProgress / totalDays : 0;
  }
}
