export interface EnvironmentalData {
  temperature: number; // °C
  humidity: number; // %
  soilMoisture: number; // %
  lightIntensity: number; // lux
  ph: number;
  nutrientLevels: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

export interface PlantData {
  plantId: string;
  growthStage: string;
  healthScore: number;
  berryCount: number;
  daysSincePlanting: number;
  daysSinceFlowering: number;
}

export interface YieldPrediction {
  expectedYield: number; // grams per plant
  confidence: number;
  harvestDate: Date;
  yieldRange: {
    min: number;
    max: number;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
}

export interface HistoricalYieldData {
  plantId: string;
  harvestDate: Date;
  actualYield: number;
  environmentalConditions: EnvironmentalData;
  plantHealth: number;
}

export class YieldPredictor {
  private model: any;
  private isModelLoaded: boolean = false;
  private historicalData: HistoricalYieldData[] = [];

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      console.log("Loading yield prediction model...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.isModelLoaded = true;
      console.log("Yield prediction model loaded successfully");
    } catch (error) {
      console.error("Failed to load yield prediction model:", error);
    }
  }

  public async predictYield(
    plantData: PlantData,
    environmentalData: EnvironmentalData,
    imageUrl: string
  ): Promise<YieldPrediction> {
    if (!this.isModelLoaded) {
      throw new Error("Model not loaded yet");
    }

    try {
      const baseYield = this.calculateBaseYield(plantData);
      const environmentalMultiplier =
        this.calculateEnvironmentalMultiplier(environmentalData);
      const healthMultiplier = this.calculateHealthMultiplier(
        plantData.healthScore
      );
      const growthStageMultiplier = this.calculateGrowthStageMultiplier(
        plantData.growthStage
      );

      const expectedYield =
        baseYield *
        environmentalMultiplier *
        healthMultiplier *
        growthStageMultiplier;
      const confidence = this.calculateConfidence(plantData, environmentalData);
      const harvestDate = this.predictHarvestDate(plantData);
      const yieldRange = this.calculateYieldRange(expectedYield, confidence);
      const factors = this.analyzeFactors(plantData, environmentalData);
      const recommendations = this.generateRecommendations(
        factors,
        expectedYield
      );

      return {
        expectedYield,
        confidence,
        harvestDate,
        yieldRange,
        factors,
        recommendations,
      };
    } catch (error) {
      console.error("Error predicting yield:", error);
      throw error;
    }
  }

  private calculateBaseYield(plantData: PlantData): number {
    // Base yield calculation based on berry count and growth stage
    const baseYieldPerBerry = 8; // grams per berry
    const berryCount = plantData.berryCount;

    // Adjust for growth stage
    const growthStageMultipliers = {
      germination: 0,
      seedling: 0,
      vegetative: 0,
      flowering: 0.1,
      fruiting: 0.6,
      "harvest-ready": 1.0,
      "post-harvest": 0,
    };

    const multiplier =
      growthStageMultipliers[
        plantData.growthStage as keyof typeof growthStageMultipliers
      ] || 0;
    return berryCount * baseYieldPerBerry * multiplier;
  }

  private calculateEnvironmentalMultiplier(
    environmentalData: EnvironmentalData
  ): number {
    let multiplier = 1.0;

    // Temperature factor (optimal: 18-24°C)
    const temp = environmentalData.temperature;
    if (temp >= 18 && temp <= 24) {
      multiplier *= 1.0;
    } else if (temp >= 15 && temp <= 27) {
      multiplier *= 0.9;
    } else if (temp >= 12 && temp <= 30) {
      multiplier *= 0.7;
    } else {
      multiplier *= 0.5;
    }

    // Humidity factor (optimal: 60-80%)
    const humidity = environmentalData.humidity;
    if (humidity >= 60 && humidity <= 80) {
      multiplier *= 1.0;
    } else if (humidity >= 50 && humidity <= 90) {
      multiplier *= 0.9;
    } else {
      multiplier *= 0.7;
    }

    // Soil moisture factor (optimal: 70-85%)
    const moisture = environmentalData.soilMoisture;
    if (moisture >= 70 && moisture <= 85) {
      multiplier *= 1.0;
    } else if (moisture >= 60 && moisture <= 95) {
      multiplier *= 0.8;
    } else {
      multiplier *= 0.6;
    }

    // pH factor (optimal: 5.5-6.5)
    const ph = environmentalData.ph;
    if (ph >= 5.5 && ph <= 6.5) {
      multiplier *= 1.0;
    } else if (ph >= 5.0 && ph <= 7.0) {
      multiplier *= 0.9;
    } else {
      multiplier *= 0.7;
    }

    // Nutrient balance factor
    const nutrients = environmentalData.nutrientLevels;
    const nutrientBalance = this.calculateNutrientBalance(nutrients);
    multiplier *= nutrientBalance;

    return multiplier;
  }

  private calculateNutrientBalance(nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  }): number {
    const { nitrogen, phosphorus, potassium } = nutrients;

    // Optimal ratios: N:P:K = 1:1:1 for strawberries
    const total = nitrogen + phosphorus + potassium;
    if (total === 0) return 0.5;

    const nRatio = nitrogen / total;
    const pRatio = phosphorus / total;
    const kRatio = potassium / total;

    // Calculate balance score
    const idealRatio = 1 / 3;
    const nDeviation = Math.abs(nRatio - idealRatio);
    const pDeviation = Math.abs(pRatio - idealRatio);
    const kDeviation = Math.abs(kRatio - idealRatio);

    const averageDeviation = (nDeviation + pDeviation + kDeviation) / 3;
    return Math.max(0.5, 1 - averageDeviation);
  }

  private calculateHealthMultiplier(healthScore: number): number {
    if (healthScore >= 90) return 1.0;
    if (healthScore >= 80) return 0.95;
    if (healthScore >= 70) return 0.9;
    if (healthScore >= 60) return 0.8;
    if (healthScore >= 50) return 0.7;
    return 0.5;
  }

  private calculateGrowthStageMultiplier(growthStage: string): number {
    const multipliers = {
      germination: 0,
      seedling: 0,
      vegetative: 0.1,
      flowering: 0.3,
      fruiting: 0.8,
      "harvest-ready": 1.0,
      "post-harvest": 0,
    };

    return multipliers[growthStage as keyof typeof multipliers] || 0;
  }

  private calculateConfidence(
    plantData: PlantData,
    environmentalData: EnvironmentalData
  ): number {
    let confidence = 0.8; // Base confidence

    // Reduce confidence for extreme environmental conditions
    const temp = environmentalData.temperature;
    const humidity = environmentalData.humidity;
    const moisture = environmentalData.soilMoisture;

    if (temp < 15 || temp > 30) confidence -= 0.2;
    if (humidity < 50 || humidity > 90) confidence -= 0.1;
    if (moisture < 60 || moisture > 95) confidence -= 0.1;

    // Reduce confidence for poor health
    if (plantData.healthScore < 70) confidence -= 0.2;
    if (plantData.healthScore < 50) confidence -= 0.3;

    // Increase confidence for optimal conditions
    if (temp >= 18 && temp <= 24) confidence += 0.1;
    if (humidity >= 60 && humidity <= 80) confidence += 0.1;
    if (moisture >= 70 && moisture <= 85) confidence += 0.1;

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  private predictHarvestDate(plantData: PlantData): Date {
    const harvestDate = new Date();

    // Estimate days to harvest based on growth stage
    const daysToHarvest = {
      germination: 120,
      seedling: 100,
      vegetative: 80,
      flowering: 60,
      fruiting: 30,
      "harvest-ready": 7,
      "post-harvest": 0,
    };

    const days =
      daysToHarvest[plantData.growthStage as keyof typeof daysToHarvest] || 0;
    harvestDate.setDate(harvestDate.getDate() + days);

    return harvestDate;
  }

  private calculateYieldRange(
    expectedYield: number,
    confidence: number
  ): { min: number; max: number } {
    const uncertainty = 1 - confidence;
    const range = expectedYield * uncertainty;

    return {
      min: Math.max(0, expectedYield - range),
      max: expectedYield + range,
    };
  }

  private analyzeFactors(
    plantData: PlantData,
    environmentalData: EnvironmentalData
  ): {
    positive: string[];
    negative: string[];
  } {
    const positive: string[] = [];
    const negative: string[] = [];

    // Analyze environmental factors
    const temp = environmentalData.temperature;
    const humidity = environmentalData.humidity;
    const moisture = environmentalData.soilMoisture;
    const ph = environmentalData.ph;

    if (temp >= 18 && temp <= 24) {
      positive.push("Optimal temperature range");
    } else if (temp < 15 || temp > 30) {
      negative.push("Temperature outside optimal range");
    }

    if (humidity >= 60 && humidity <= 80) {
      positive.push("Optimal humidity levels");
    } else if (humidity < 50 || humidity > 90) {
      negative.push("Humidity outside optimal range");
    }

    if (moisture >= 70 && moisture <= 85) {
      positive.push("Optimal soil moisture");
    } else if (moisture < 60 || moisture > 95) {
      negative.push("Soil moisture outside optimal range");
    }

    if (ph >= 5.5 && ph <= 6.5) {
      positive.push("Optimal soil pH");
    } else {
      negative.push("Soil pH outside optimal range");
    }

    // Analyze plant health
    if (plantData.healthScore >= 80) {
      positive.push("Excellent plant health");
    } else if (plantData.healthScore < 60) {
      negative.push("Poor plant health detected");
    }

    // Analyze growth stage
    if (
      plantData.growthStage === "fruiting" ||
      plantData.growthStage === "harvest-ready"
    ) {
      positive.push("Optimal growth stage for yield");
    } else if (
      plantData.growthStage === "germination" ||
      plantData.growthStage === "seedling"
    ) {
      negative.push("Early growth stage - yield prediction uncertain");
    }

    return { positive, negative };
  }

  private generateRecommendations(
    factors: { positive: string[]; negative: string[] },
    expectedYield: number
  ): string[] {
    const recommendations: string[] = [];

    // Generate recommendations based on negative factors
    if (factors.negative.includes("Temperature outside optimal range")) {
      recommendations.push("Adjust temperature to 18-24°C for optimal yield");
    }
    if (factors.negative.includes("Humidity outside optimal range")) {
      recommendations.push("Maintain humidity between 60-80%");
    }
    if (factors.negative.includes("Soil moisture outside optimal range")) {
      recommendations.push(
        "Adjust watering schedule to maintain 70-85% soil moisture"
      );
    }
    if (factors.negative.includes("Soil pH outside optimal range")) {
      recommendations.push(
        "Adjust soil pH to 5.5-6.5 for optimal nutrient uptake"
      );
    }
    if (factors.negative.includes("Poor plant health detected")) {
      recommendations.push("Address plant health issues before harvest");
    }

    // Generate yield optimization recommendations
    if (expectedYield < 50) {
      recommendations.push(
        "Consider additional fertilization to improve yield"
      );
      recommendations.push(
        "Optimize environmental conditions for better growth"
      );
    } else if (expectedYield > 100) {
      recommendations.push(
        "Excellent yield potential - maintain current conditions"
      );
    }

    return recommendations;
  }

  public async updateHistoricalData(
    harvestData: HistoricalYieldData
  ): Promise<void> {
    this.historicalData.push(harvestData);

    // Keep only last 100 records to prevent memory bloat
    if (this.historicalData.length > 100) {
      this.historicalData = this.historicalData.slice(-100);
    }
  }

  public async getYieldTrends(plantId: string): Promise<{
    averageYield: number;
    yieldTrend: "increasing" | "stable" | "decreasing";
    seasonalPattern: boolean;
    recommendations: string[];
  }> {
    const plantData = this.historicalData.filter((d) => d.plantId === plantId);

    if (plantData.length < 3) {
      return {
        averageYield: 0,
        yieldTrend: "stable",
        seasonalPattern: false,
        recommendations: ["Insufficient historical data for trend analysis"],
      };
    }

    const yields = plantData.map((d) => d.actualYield);
    const averageYield =
      yields.reduce((sum, yield) => sum + yield, 0) / yields.length;

    // Calculate trend
    const recentYields = yields.slice(-3);
    const earlierYields = yields.slice(0, Math.max(0, yields.length - 3));

    let yieldTrend: "increasing" | "stable" | "decreasing" = "stable";
    if (recentYields.length > 0 && earlierYields.length > 0) {
      const recentAvg =
        recentYields.reduce((sum, yield) => sum + yield, 0) /
        recentYields.length;
      const earlierAvg =
        earlierYields.reduce((sum, yield) => sum + yield, 0) /
        earlierYields.length;

      if (recentAvg > earlierAvg + 10) yieldTrend = "increasing";
      else if (recentAvg < earlierAvg - 10) yieldTrend = "decreasing";
    }

    // Detect seasonal patterns
    const seasonalPattern = this.detectSeasonalPattern(plantData);

    const recommendations = this.generateTrendRecommendations(
      yieldTrend,
      averageYield
    );

    return {
      averageYield,
      yieldTrend,
      seasonalPattern,
      recommendations,
    };
  }

  private detectSeasonalPattern(plantData: HistoricalYieldData[]): boolean {
    // Simple seasonal pattern detection
    const monthlyYields = new Map<number, number[]>();

    plantData.forEach((data) => {
      const month = data.harvestDate.getMonth();
      if (!monthlyYields.has(month)) {
        monthlyYields.set(month, []);
      }
      monthlyYields.get(month)!.push(data.actualYield);
    });

    // Check if there's significant variation between months
    const monthlyAverages = Array.from(monthlyYields.entries()).map(
      ([month, yields]) => ({
        month,
        average: yields.reduce((sum, yield) => sum + yield, 0) / yields.length,
      })
    );

    if (monthlyAverages.length < 3) return false;

    const overallAverage =
      monthlyAverages.reduce((sum, m) => sum + m.average, 0) /
      monthlyAverages.length;
    const variance =
      monthlyAverages.reduce(
        (sum, m) => sum + Math.pow(m.average - overallAverage, 2),
        0
      ) / monthlyAverages.length;

    return variance > overallAverage * 0.1; // 10% variance threshold
  }

  private generateTrendRecommendations(
    trend: "increasing" | "stable" | "decreasing",
    averageYield: number
  ): string[] {
    const recommendations: string[] = [];

    switch (trend) {
      case "increasing":
        recommendations.push("Yield is improving - maintain current practices");
        recommendations.push("Consider documenting successful techniques");
        break;
      case "stable":
        recommendations.push(
          "Yield is stable - consider optimization opportunities"
        );
        break;
      case "decreasing":
        recommendations.push(
          "Yield is declining - investigate potential issues"
        );
        recommendations.push(
          "Review environmental conditions and care practices"
        );
        break;
    }

    if (averageYield < 50) {
      recommendations.push(
        "Average yield below target - implement improvement plan"
      );
    }

    return recommendations;
  }
}
