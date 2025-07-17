export interface NutrientLevels {
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  calcium: number; // ppm
  magnesium: number; // ppm
  sulfur: number; // ppm
  iron: number; // ppm
  manganese: number; // ppm
  zinc: number; // ppm
  copper: number; // ppm
  boron: number; // ppm
  molybdenum: number; // ppm
}

export interface WaterQuality {
  ph: number;
  ec: number; // Electrical conductivity (mS/cm)
  temperature: number; // °C
  dissolvedOxygen: number; // mg/L
  alkalinity: number; // ppm
}

export interface PlantHealthIndicators {
  healthScore: number;
  growthRate: number;
  leafColor: "dark_green" | "green" | "light_green" | "yellow" | "brown";
  leafSize: "small" | "normal" | "large";
  rootHealth: "excellent" | "good" | "fair" | "poor";
  stressIndicators: string[];
}

export interface GrowthStageInfo {
  stage: string;
  daysInStage: number;
  expectedDuration: number;
  nutrientRequirements: NutrientLevels;
}

export interface NutrientAdjustment {
  nutrient: keyof NutrientLevels;
  action: "increase" | "decrease" | "maintain";
  amount: number; // ppm change
  priority: "low" | "medium" | "high" | "critical";
  reasoning: string;
}

export interface NutrientOptimizationResult {
  adjustments: NutrientAdjustment[];
  recommendedRecipe: NutrientLevels;
  phAdjustment: number;
  ecTarget: number;
  confidence: number;
  recommendations: string[];
  nextCheckDate: Date;
}

export class NutrientManager {
  private model: any;
  private isModelLoaded: boolean = false;
  private historicalData: {
    nutrients: NutrientLevels;
    waterQuality: WaterQuality;
    plantHealth: PlantHealthIndicators;
    growthStage: GrowthStageInfo;
  }[] = [];

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      console.log("Loading nutrient management model...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.isModelLoaded = true;
      console.log("Nutrient management model loaded successfully");
    } catch (error) {
      console.error("Failed to load nutrient management model:", error);
    }
  }

  public async optimizeNutrients(
    currentNutrients: NutrientLevels,
    waterQuality: WaterQuality,
    plantHealth: PlantHealthIndicators,
    growthStage: GrowthStageInfo
  ): Promise<NutrientOptimizationResult> {
    if (!this.isModelLoaded) {
      throw new Error("Model not loaded yet");
    }

    try {
      const adjustments = this.analyzeNutrientNeeds(
        currentNutrients,
        waterQuality,
        plantHealth,
        growthStage
      );
      const recommendedRecipe = this.calculateOptimalRecipe(
        currentNutrients,
        adjustments
      );
      const phAdjustment = this.calculatePhAdjustment(
        waterQuality.ph,
        growthStage
      );
      const ecTarget = this.calculateECTarget(growthStage, plantHealth);
      const confidence = this.calculateConfidence(plantHealth, waterQuality);
      const recommendations = this.generateRecommendations(
        adjustments,
        plantHealth,
        waterQuality
      );
      const nextCheckDate = this.calculateNextCheckDate(
        growthStage,
        plantHealth
      );

      return {
        adjustments,
        recommendedRecipe,
        phAdjustment,
        ecTarget,
        confidence,
        recommendations,
        nextCheckDate,
      };
    } catch (error) {
      console.error("Error optimizing nutrients:", error);
      throw error;
    }
  }

  private analyzeNutrientNeeds(
    currentNutrients: NutrientLevels,
    waterQuality: WaterQuality,
    plantHealth: PlantHealthIndicators,
    growthStage: GrowthStageInfo
  ): NutrientAdjustment[] {
    const adjustments: NutrientAdjustment[] = [];
    const targetNutrients = growthStage.nutrientRequirements;

    // Analyze each nutrient
    Object.keys(currentNutrients).forEach((nutrient) => {
      const current = currentNutrients[nutrient as keyof NutrientLevels];
      const target = targetNutrients[nutrient as keyof NutrientLevels];
      const adjustment = this.analyzeNutrient(
        nutrient as keyof NutrientLevels,
        current,
        target,
        plantHealth,
        waterQuality
      );
      if (adjustment) adjustments.push(adjustment);
    });

    return adjustments;
  }

  private analyzeNutrient(
    nutrient: keyof NutrientLevels,
    current: number,
    target: number,
    plantHealth: PlantHealthIndicators,
    waterQuality: WaterQuality
  ): NutrientAdjustment | null {
    const tolerance = this.getNutrientTolerance(nutrient);
    const deviation = Math.abs(current - target);

    if (deviation <= tolerance) {
      return null; // Within acceptable range
    }

    let action: "increase" | "decrease" | "maintain" = "maintain";
    let amount = 0;
    let priority: "low" | "medium" | "high" | "critical" = "low";
    let reasoning = "";

    if (current < target) {
      action = "increase";
      amount = Math.min(target - current, this.getMaxAdjustment(nutrient));
      priority = this.determinePriority(nutrient, deviation, plantHealth);
      reasoning = `${nutrient} level ${current} ppm below target ${target} ppm`;
    } else {
      action = "decrease";
      amount = Math.min(current - target, this.getMaxAdjustment(nutrient));
      priority = this.determinePriority(nutrient, deviation, plantHealth);
      reasoning = `${nutrient} level ${current} ppm above target ${target} ppm`;
    }

    // Check for deficiency symptoms
    const deficiencySymptoms = this.checkDeficiencySymptoms(
      nutrient,
      plantHealth
    );
    if (deficiencySymptoms) {
      priority = "critical";
      reasoning += ` - ${deficiencySymptoms}`;
    }

    return {
      nutrient,
      action,
      amount,
      priority,
      reasoning,
    };
  }

  private getNutrientTolerance(nutrient: keyof NutrientLevels): number {
    const tolerances: Record<keyof NutrientLevels, number> = {
      nitrogen: 10,
      phosphorus: 5,
      potassium: 15,
      calcium: 20,
      magnesium: 10,
      sulfur: 5,
      iron: 2,
      manganese: 1,
      zinc: 1,
      copper: 0.5,
      boron: 0.5,
      molybdenum: 0.1,
    };
    return tolerances[nutrient];
  }

  private getMaxAdjustment(nutrient: keyof NutrientLevels): number {
    const maxAdjustments: Record<keyof NutrientLevels, number> = {
      nitrogen: 20,
      phosphorus: 10,
      potassium: 30,
      calcium: 40,
      magnesium: 15,
      sulfur: 10,
      iron: 5,
      manganese: 2,
      zinc: 2,
      copper: 1,
      boron: 1,
      molybdenum: 0.2,
    };
    return maxAdjustments[nutrient];
  }

  private determinePriority(
    nutrient: keyof NutrientLevels,
    deviation: number,
    plantHealth: PlantHealthIndicators
  ): "low" | "medium" | "high" | "critical" {
    const tolerance = this.getNutrientTolerance(nutrient);
    const severity = deviation / tolerance;

    if (severity > 3 || plantHealth.healthScore < 50) return "critical";
    if (severity > 2 || plantHealth.healthScore < 70) return "high";
    if (severity > 1.5) return "medium";
    return "low";
  }

  private checkDeficiencySymptoms(
    nutrient: keyof NutrientLevels,
    plantHealth: PlantHealthIndicators
  ): string | null {
    const symptoms: Record<keyof NutrientLevels, string[]> = {
      nitrogen: ["yellowing leaves", "stunted growth"],
      phosphorus: ["purple leaves", "poor root development"],
      potassium: ["leaf edge browning", "weak stems"],
      calcium: ["blossom end rot", "leaf curling"],
      magnesium: ["interveinal chlorosis", "leaf yellowing"],
      sulfur: ["yellow new growth", "stunted development"],
      iron: ["interveinal chlorosis", "yellow young leaves"],
      manganese: ["interveinal chlorosis", "brown spots"],
      zinc: ["small leaves", "interveinal chlorosis"],
      copper: ["wilting", "leaf curling"],
      boron: ["cracked stems", "poor fruit set"],
      molybdenum: ["nitrogen deficiency symptoms", "stunted growth"],
    };

    const nutrientSymptoms = symptoms[nutrient];
    const hasSymptoms = nutrientSymptoms.some((symptom) =>
      plantHealth.stressIndicators.some((indicator) =>
        indicator.toLowerCase().includes(symptom)
      )
    );

    return hasSymptoms ? `${nutrient} deficiency symptoms detected` : null;
  }

  private calculateOptimalRecipe(
    currentNutrients: NutrientLevels,
    adjustments: NutrientAdjustment[]
  ): NutrientLevels {
    const recipe = { ...currentNutrients };

    adjustments.forEach((adjustment) => {
      const current = recipe[adjustment.nutrient];
      if (adjustment.action === "increase") {
        recipe[adjustment.nutrient] = current + adjustment.amount;
      } else if (adjustment.action === "decrease") {
        recipe[adjustment.nutrient] = Math.max(0, current - adjustment.amount);
      }
    });

    return recipe;
  }

  private calculatePhAdjustment(
    currentPh: number,
    growthStage: GrowthStageInfo
  ): number {
    const targetPh = this.getTargetPh(growthStage.stage);
    const adjustment = targetPh - currentPh;

    // Limit adjustment to reasonable amount
    return Math.max(-1, Math.min(1, adjustment));
  }

  private getTargetPh(growthStage: string): number {
    const phTargets: Record<string, number> = {
      germination: 6.0,
      seedling: 5.8,
      vegetative: 5.8,
      flowering: 6.0,
      fruiting: 6.2,
      "harvest-ready": 6.2,
      "post-harvest": 6.0,
    };
    return phTargets[growthStage] || 6.0;
  }

  private calculateECTarget(
    growthStage: GrowthStageInfo,
    plantHealth: PlantHealthIndicators
  ): number {
    const baseEC = this.getBaseEC(growthStage.stage);

    // Adjust based on plant health
    let adjustment = 0;
    if (plantHealth.healthScore < 60) {
      adjustment = -0.2; // Reduce EC for stressed plants
    } else if (plantHealth.healthScore > 90) {
      adjustment = 0.1; // Slightly increase EC for healthy plants
    }

    return Math.max(0.5, Math.min(2.5, baseEC + adjustment));
  }

  private getBaseEC(growthStage: string): number {
    const ecTargets: Record<string, number> = {
      germination: 0.8,
      seedling: 1.0,
      vegetative: 1.4,
      flowering: 1.6,
      fruiting: 1.8,
      "harvest-ready": 1.6,
      "post-harvest": 1.0,
    };
    return ecTargets[growthStage] || 1.4;
  }

  private calculateConfidence(
    plantHealth: PlantHealthIndicators,
    waterQuality: WaterQuality
  ): number {
    let confidence = 0.8; // Base confidence

    // Reduce confidence for poor plant health
    if (plantHealth.healthScore < 70) confidence -= 0.2;
    if (plantHealth.healthScore < 50) confidence -= 0.3;

    // Reduce confidence for extreme water quality
    if (waterQuality.ph < 5.0 || waterQuality.ph > 7.5) confidence -= 0.2;
    if (waterQuality.ec < 0.5 || waterQuality.ec > 3.0) confidence -= 0.2;
    if (waterQuality.temperature < 15 || waterQuality.temperature > 30)
      confidence -= 0.1;

    // Increase confidence for optimal conditions
    if (plantHealth.healthScore > 90) confidence += 0.1;
    if (waterQuality.ph >= 5.8 && waterQuality.ph <= 6.2) confidence += 0.1;
    if (waterQuality.ec >= 1.0 && waterQuality.ec <= 2.0) confidence += 0.1;

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  private generateRecommendations(
    adjustments: NutrientAdjustment[],
    plantHealth: PlantHealthIndicators,
    waterQuality: WaterQuality
  ): string[] {
    const recommendations: string[] = [];

    const criticalAdjustments = adjustments.filter(
      (a) => a.priority === "critical"
    );
    const highPriorityAdjustments = adjustments.filter(
      (a) => a.priority === "high"
    );

    if (criticalAdjustments.length > 0) {
      recommendations.push("CRITICAL: Immediate nutrient adjustments required");
      criticalAdjustments.forEach((adj) => {
        recommendations.push(`- ${adj.reasoning}`);
      });
    }

    if (highPriorityAdjustments.length > 0) {
      recommendations.push("High priority nutrient adjustments needed");
      highPriorityAdjustments.forEach((adj) => {
        recommendations.push(`- ${adj.reasoning}`);
      });
    }

    // Water quality recommendations
    if (waterQuality.ph < 5.5 || waterQuality.ph > 6.5) {
      recommendations.push(
        `Adjust pH to optimal range (5.8-6.2) - current: ${waterQuality.ph}`
      );
    }

    if (waterQuality.ec < 1.0 || waterQuality.ec > 2.0) {
      recommendations.push(
        `Adjust EC to optimal range (1.0-2.0) - current: ${waterQuality.ec}`
      );
    }

    if (waterQuality.temperature < 18 || waterQuality.temperature > 25) {
      recommendations.push(
        `Adjust water temperature to 18-25°C - current: ${waterQuality.temperature}°C`
      );
    }

    // Plant health recommendations
    if (plantHealth.healthScore < 70) {
      recommendations.push(
        "Monitor plant health closely - consider reducing nutrient strength"
      );
    }

    if (plantHealth.stressIndicators.length > 0) {
      recommendations.push(
        "Address stress indicators before making major nutrient changes"
      );
    }

    if (adjustments.length === 0) {
      recommendations.push(
        "Nutrient levels are optimal - maintain current recipe"
      );
    }

    return recommendations;
  }

  private calculateNextCheckDate(
    growthStage: GrowthStageInfo,
    plantHealth: PlantHealthIndicators
  ): Date {
    const nextCheck = new Date();

    // More frequent checks for critical situations
    if (plantHealth.healthScore < 60) {
      nextCheck.setDate(nextCheck.getDate() + 1); // Daily checks
    } else if (plantHealth.healthScore < 80) {
      nextCheck.setDate(nextCheck.getDate() + 3); // Every 3 days
    } else {
      nextCheck.setDate(nextCheck.getDate() + 7); // Weekly checks
    }

    return nextCheck;
  }

  public async updateHistoricalData(
    nutrients: NutrientLevels,
    waterQuality: WaterQuality,
    plantHealth: PlantHealthIndicators,
    growthStage: GrowthStageInfo
  ): Promise<void> {
    this.historicalData.push({
      nutrients,
      waterQuality,
      plantHealth,
      growthStage,
    });

    // Keep only last 500 records
    if (this.historicalData.length > 500) {
      this.historicalData = this.historicalData.slice(-500);
    }
  }

  public async learnOptimalNutrients(growthStage: string): Promise<{
    optimalNutrients: NutrientLevels;
    confidence: number;
    sampleSize: number;
  }> {
    const stageData = this.historicalData.filter(
      (d) => d.growthStage.stage === growthStage
    );

    if (stageData.length < 5) {
      return {
        optimalNutrients: this.getDefaultNutrients(growthStage),
        confidence: 0.5,
        sampleSize: stageData.length,
      };
    }

    // Find data points with good plant health
    const healthyData = stageData.filter(
      (d) => d.plantHealth.healthScore >= 80
    );

    if (healthyData.length === 0) {
      return {
        optimalNutrients: this.getDefaultNutrients(growthStage),
        confidence: 0.6,
        sampleSize: stageData.length,
      };
    }

    // Calculate average nutrient levels from healthy plants
    const optimalNutrients = this.calculateAverageNutrients(healthyData);
    const confidence = Math.min(0.95, healthyData.length / 50);
    const sampleSize = healthyData.length;

    return {
      optimalNutrients,
      confidence,
      sampleSize,
    };
  }

  private getDefaultNutrients(growthStage: string): NutrientLevels {
    const defaults: Record<string, NutrientLevels> = {
      germination: {
        nitrogen: 100,
        phosphorus: 50,
        potassium: 100,
        calcium: 150,
        magnesium: 50,
        sulfur: 50,
        iron: 2,
        manganese: 1,
        zinc: 1,
        copper: 0.5,
        boron: 0.5,
        molybdenum: 0.1,
      },
      seedling: {
        nitrogen: 150,
        phosphorus: 75,
        potassium: 150,
        calcium: 200,
        magnesium: 75,
        sulfur: 75,
        iron: 3,
        manganese: 1.5,
        zinc: 1.5,
        copper: 0.5,
        boron: 0.5,
        molybdenum: 0.1,
      },
      vegetative: {
        nitrogen: 200,
        phosphorus: 100,
        potassium: 200,
        calcium: 250,
        magnesium: 100,
        sulfur: 100,
        iron: 4,
        manganese: 2,
        zinc: 2,
        copper: 0.5,
        boron: 0.5,
        molybdenum: 0.1,
      },
      flowering: {
        nitrogen: 180,
        phosphorus: 150,
        potassium: 250,
        calcium: 250,
        magnesium: 100,
        sulfur: 100,
        iron: 4,
        manganese: 2,
        zinc: 2,
        copper: 0.5,
        boron: 0.5,
        molybdenum: 0.1,
      },
      fruiting: {
        nitrogen: 150,
        phosphorus: 120,
        potassium: 300,
        calcium: 250,
        magnesium: 100,
        sulfur: 100,
        iron: 4,
        manganese: 2,
        zinc: 2,
        copper: 0.5,
        boron: 0.5,
        molybdenum: 0.1,
      },
      "harvest-ready": {
        nitrogen: 100,
        phosphorus: 100,
        potassium: 250,
        calcium: 250,
        magnesium: 100,
        sulfur: 100,
        iron: 4,
        manganese: 2,
        zinc: 2,
        copper: 0.5,
        boron: 0.5,
        molybdenum: 0.1,
      },
      "post-harvest": {
        nitrogen: 100,
        phosphorus: 50,
        potassium: 100,
        calcium: 150,
        magnesium: 50,
        sulfur: 50,
        iron: 2,
        manganese: 1,
        zinc: 1,
        copper: 0.5,
        boron: 0.5,
        molybdenum: 0.1,
      },
    };

    return defaults[growthStage] || defaults["vegetative"];
  }

  private calculateAverageNutrients(data: any[]): NutrientLevels {
    const nutrients: NutrientLevels = {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      calcium: 0,
      magnesium: 0,
      sulfur: 0,
      iron: 0,
      manganese: 0,
      zinc: 0,
      copper: 0,
      boron: 0,
      molybdenum: 0,
    };

    Object.keys(nutrients).forEach((nutrient) => {
      const values = data.map(
        (d) => d.nutrients[nutrient as keyof NutrientLevels]
      );
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      nutrients[nutrient as keyof NutrientLevels] = Math.round(average);
    });

    return nutrients;
  }
}
