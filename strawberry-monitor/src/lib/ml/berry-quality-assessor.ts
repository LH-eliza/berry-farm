export type QualityGrade = "A" | "B" | "C" | "D" | "F";

export interface BerryQualityMetrics {
  size: number; // mm diameter
  shape: number; // 0-100 score (100 = perfect sphere)
  colorUniformity: number; // 0-100 score
  firmnessPrediction: number; // 0-100 score
  ripenessLevel: number; // 0-100 percentage
  brixPrediction: number; // predicted sugar content
}

export interface QualityAssessmentResult {
  qualityGrade: QualityGrade;
  overallScore: number;
  metrics: BerryQualityMetrics;
  harvestRecommendation:
    | "harvest_now"
    | "wait_1_2_days"
    | "wait_3_5_days"
    | "wait_week_plus";
  confidence: number;
  recommendations: string[];
  optimalHarvestDate?: Date;
}

export interface BerryQualityData {
  id: string;
  imageUrl: string;
  plantId: string;
  assessment: QualityAssessmentResult;
  timestamp: Date;
}

export class BerryQualityAssessor {
  private model: any;
  private isModelLoaded: boolean = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      console.log("Loading berry quality assessment model...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.isModelLoaded = true;
      console.log("Berry quality assessment model loaded successfully");
    } catch (error) {
      console.error("Failed to load berry quality assessment model:", error);
    }
  }

  public async assessBerryQuality(
    imageUrl: string,
    plantId: string,
    daysSinceFlowering: number
  ): Promise<QualityAssessmentResult> {
    if (!this.isModelLoaded) {
      throw new Error("Model not loaded yet");
    }

    try {
      const metrics = await this.analyzeBerryMetrics(
        imageUrl,
        daysSinceFlowering
      );
      const overallScore = this.calculateOverallScore(metrics);
      const qualityGrade = this.determineQualityGrade(overallScore);
      const harvestRecommendation = this.determineHarvestRecommendation(
        metrics,
        daysSinceFlowering
      );
      const confidence = this.calculateConfidence(metrics);
      const recommendations = this.generateRecommendations(
        qualityGrade,
        metrics
      );
      const optimalHarvestDate = this.calculateOptimalHarvestDate(
        metrics,
        daysSinceFlowering
      );

      return {
        qualityGrade,
        overallScore,
        metrics,
        harvestRecommendation,
        confidence,
        recommendations,
        optimalHarvestDate,
      };
    } catch (error) {
      console.error("Error assessing berry quality:", error);
      throw error;
    }
  }

  private async analyzeBerryMetrics(
    imageUrl: string,
    daysSinceFlowering: number
  ): Promise<BerryQualityMetrics> {
    // Simulate image analysis for berry metrics
    const baseSize = 15 + daysSinceFlowering * 0.5; // mm
    const size = Math.min(
      25,
      Math.max(10, baseSize + (Math.random() - 0.5) * 4)
    );

    const shape = 70 + Math.random() * 30; // 70-100 score
    const colorUniformity = 60 + Math.random() * 40; // 60-100 score
    const firmnessPrediction = this.predictFirmness(daysSinceFlowering);
    const ripenessLevel = this.calculateRipenessLevel(daysSinceFlowering);
    const brixPrediction = this.predictBrix(daysSinceFlowering);

    return {
      size,
      shape,
      colorUniformity,
      firmnessPrediction,
      ripenessLevel,
      brixPrediction,
    };
  }

  private predictFirmness(daysSinceFlowering: number): number {
    // Firmness decreases as berries ripen
    const optimalFirmness = 85;
    const firmnessDecay = Math.max(0, (daysSinceFlowering - 45) * 2);
    return Math.max(
      20,
      optimalFirmness - firmnessDecay + (Math.random() - 0.5) * 10
    );
  }

  private calculateRipenessLevel(daysSinceFlowering: number): number {
    // Ripeness increases over time after flowering
    const baseRipeness = Math.min(100, (daysSinceFlowering - 30) * 3);
    return Math.max(
      0,
      Math.min(100, baseRipeness + (Math.random() - 0.5) * 10)
    );
  }

  private predictBrix(daysSinceFlowering: number): number {
    // Sugar content increases with ripeness
    const baseBrix = 6 + Math.min(6, (daysSinceFlowering - 40) * 0.2);
    return Math.max(4, Math.min(12, baseBrix + (Math.random() - 0.5) * 2));
  }

  private calculateOverallScore(metrics: BerryQualityMetrics): number {
    const weights = {
      size: 0.25,
      shape: 0.2,
      colorUniformity: 0.2,
      firmnessPrediction: 0.15,
      ripenessLevel: 0.15,
      brixPrediction: 0.05,
    };

    const normalizedSize = Math.min(100, (metrics.size / 25) * 100);
    const normalizedBrix = Math.min(100, (metrics.brixPrediction / 12) * 100);

    return (
      weights.size * normalizedSize +
      weights.shape * metrics.shape +
      weights.colorUniformity * metrics.colorUniformity +
      weights.firmnessPrediction * metrics.firmnessPrediction +
      weights.ripenessLevel * metrics.ripenessLevel +
      weights.brixPrediction * normalizedBrix
    );
  }

  private determineQualityGrade(overallScore: number): QualityGrade {
    if (overallScore >= 90) return "A";
    if (overallScore >= 80) return "B";
    if (overallScore >= 70) return "C";
    if (overallScore >= 60) return "D";
    return "F";
  }

  private determineHarvestRecommendation(
    metrics: BerryQualityMetrics,
    daysSinceFlowering: number
  ): "harvest_now" | "wait_1_2_days" | "wait_3_5_days" | "wait_week_plus" {
    const ripeness = metrics.ripenessLevel;
    const firmness = metrics.firmnessPrediction;

    if (ripeness >= 85 && firmness >= 60) return "harvest_now";
    if (ripeness >= 70 && firmness >= 70) return "wait_1_2_days";
    if (ripeness >= 50 && firmness >= 80) return "wait_3_5_days";
    return "wait_week_plus";
  }

  private calculateConfidence(metrics: BerryQualityMetrics): number {
    // Higher confidence when metrics are consistent
    const variance =
      Math.sqrt(
        Math.pow(metrics.shape - 85, 2) +
          Math.pow(metrics.colorUniformity - 80, 2) +
          Math.pow(metrics.firmnessPrediction - 70, 2)
      ) / 3;

    return Math.max(0.6, 1 - variance / 100);
  }

  private generateRecommendations(
    qualityGrade: QualityGrade,
    metrics: BerryQualityMetrics
  ): string[] {
    const recommendations: string[] = [];

    switch (qualityGrade) {
      case "A":
        recommendations.push("Excellent quality - ready for premium market");
        recommendations.push("Maintain current growing conditions");
        recommendations.push("Consider harvesting within 1-2 days");
        break;
      case "B":
        recommendations.push("Good quality - suitable for standard market");
        recommendations.push("Monitor for optimal harvest timing");
        recommendations.push("Ensure consistent watering");
        break;
      case "C":
        recommendations.push("Acceptable quality - may need improvement");
        recommendations.push("Check nutrient levels");
        recommendations.push("Optimize environmental conditions");
        recommendations.push("Consider extended ripening period");
        break;
      case "D":
        recommendations.push("Below average quality - needs attention");
        recommendations.push("Assess growing conditions");
        recommendations.push("Check for pest or disease issues");
        recommendations.push("Consider adjusting nutrient regimen");
        break;
      case "F":
        recommendations.push("Poor quality - immediate intervention required");
        recommendations.push("Diagnose underlying issues");
        recommendations.push("Consider plant health assessment");
        recommendations.push("May need to discard affected berries");
        break;
    }

    // Add specific recommendations based on metrics
    if (metrics.size < 15) {
      recommendations.push(
        "Berry size below optimal - check nutrient availability"
      );
    }
    if (metrics.shape < 75) {
      recommendations.push(
        "Irregular shape detected - ensure consistent growing conditions"
      );
    }
    if (metrics.colorUniformity < 70) {
      recommendations.push(
        "Color inconsistency - check for disease or nutrient deficiency"
      );
    }
    if (metrics.firmnessPrediction < 50) {
      recommendations.push(
        "Soft berries detected - may be overripe or diseased"
      );
    }

    return recommendations;
  }

  private calculateOptimalHarvestDate(
    metrics: BerryQualityMetrics,
    daysSinceFlowering: number
  ): Date | undefined {
    const ripeness = metrics.ripenessLevel;
    const firmness = metrics.firmnessPrediction;

    if (ripeness >= 85 && firmness >= 60) {
      return new Date(); // Harvest now
    }

    if (ripeness >= 70 && firmness >= 70) {
      const harvestDate = new Date();
      harvestDate.setDate(harvestDate.getDate() + 1);
      return harvestDate;
    }

    if (ripeness >= 50 && firmness >= 80) {
      const harvestDate = new Date();
      harvestDate.setDate(harvestDate.getDate() + 3);
      return harvestDate;
    }

    return undefined; // Too early to predict
  }

  public async batchAssessQuality(
    berries: { imageUrl: string; plantId: string; daysSinceFlowering: number }[]
  ): Promise<QualityAssessmentResult[]> {
    const results: QualityAssessmentResult[] = [];

    for (const berry of berries) {
      try {
        const result = await this.assessBerryQuality(
          berry.imageUrl,
          berry.plantId,
          berry.daysSinceFlowering
        );
        results.push(result);
      } catch (error) {
        console.error(
          `Error assessing berry quality for plant ${berry.plantId}:`,
          error
        );
      }
    }

    return results;
  }

  public async trackQualityTrends(
    plantId: string,
    historicalAssessments: QualityAssessmentResult[]
  ): Promise<{
    qualityTrend: "improving" | "stable" | "declining";
    averageQuality: number;
    consistencyScore: number;
    recommendations: string[];
  }> {
    if (historicalAssessments.length < 2) {
      return {
        qualityTrend: "stable",
        averageQuality: 0,
        consistencyScore: 0,
        recommendations: ["Insufficient data for trend analysis"],
      };
    }

    const scores = historicalAssessments.map((a) => a.overallScore);
    const averageQuality =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Calculate trend
    const recentScores = scores.slice(-3);
    const earlierScores = scores.slice(0, Math.max(0, scores.length - 3));

    let qualityTrend: "improving" | "stable" | "declining" = "stable";
    if (recentScores.length > 0 && earlierScores.length > 0) {
      const recentAvg =
        recentScores.reduce((sum, score) => sum + score, 0) /
        recentScores.length;
      const earlierAvg =
        earlierScores.reduce((sum, score) => sum + score, 0) /
        earlierScores.length;

      if (recentAvg > earlierAvg + 5) qualityTrend = "improving";
      else if (recentAvg < earlierAvg - 5) qualityTrend = "declining";
    }

    // Calculate consistency
    const variance =
      scores.reduce(
        (sum, score) => sum + Math.pow(score - averageQuality, 2),
        0
      ) / scores.length;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

    const recommendations = this.generateTrendRecommendations(
      qualityTrend,
      averageQuality,
      consistencyScore
    );

    return {
      qualityTrend,
      averageQuality,
      consistencyScore,
      recommendations,
    };
  }

  private generateTrendRecommendations(
    trend: "improving" | "stable" | "declining",
    averageQuality: number,
    consistencyScore: number
  ): string[] {
    const recommendations: string[] = [];

    switch (trend) {
      case "improving":
        recommendations.push(
          "Quality is improving - maintain current practices"
        );
        recommendations.push("Consider documenting successful techniques");
        break;
      case "stable":
        recommendations.push(
          "Quality is stable - consider optimization opportunities"
        );
        break;
      case "declining":
        recommendations.push(
          "Quality is declining - investigate potential issues"
        );
        recommendations.push("Review environmental conditions");
        recommendations.push("Check for pest or disease problems");
        break;
    }

    if (averageQuality < 70) {
      recommendations.push(
        "Overall quality below target - implement improvement plan"
      );
    }

    if (consistencyScore < 80) {
      recommendations.push(
        "Inconsistent quality - standardize growing practices"
      );
    }

    return recommendations;
  }
}
