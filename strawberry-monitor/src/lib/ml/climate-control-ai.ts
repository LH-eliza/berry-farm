export interface ClimateTargets {
  temperature: {
    min: number;
    optimal: number;
    max: number;
  };
  humidity: {
    min: number;
    optimal: number;
    max: number;
  };
  lightIntensity: {
    min: number;
    optimal: number;
    max: number;
  };
  lightHours: {
    min: number;
    optimal: number;
    max: number;
  };
}

export interface CurrentConditions {
  temperature: number;
  humidity: number;
  lightIntensity: number;
  soilMoisture: number;
  timestamp: Date;
}

export interface PlantResponse {
  healthScore: number;
  growthRate: number;
  stressIndicators: string[];
  timestamp: Date;
}

export interface ClimateControlCommand {
  action: "increase" | "decrease" | "maintain";
  parameter: "temperature" | "humidity" | "light" | "ventilation";
  intensity: number; // 0-100 percentage
  duration: number; // minutes
  priority: "low" | "medium" | "high" | "critical";
  reasoning: string;
}

export interface ClimateOptimizationResult {
  commands: ClimateControlCommand[];
  predictedConditions: CurrentConditions;
  plantHealthProjection: number;
  energyEfficiency: number;
  recommendations: string[];
}

export class ClimateControlAI {
  private model: any;
  private isModelLoaded: boolean = false;
  private historicalData: {
    conditions: CurrentConditions;
    response: PlantResponse;
  }[] = [];

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      console.log("Loading climate control AI model...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.isModelLoaded = true;
      console.log("Climate control AI model loaded successfully");
    } catch (error) {
      console.error("Failed to load climate control AI model:", error);
    }
  }

  public async optimizeClimate(
    currentConditions: CurrentConditions,
    plantResponse: PlantResponse,
    targets: ClimateTargets,
    timeOfDay: number // 0-24 hours
  ): Promise<ClimateOptimizationResult> {
    if (!this.isModelLoaded) {
      throw new Error("Model not loaded yet");
    }

    try {
      const commands = this.generateControlCommands(
        currentConditions,
        plantResponse,
        targets,
        timeOfDay
      );
      const predictedConditions = this.predictConditions(
        currentConditions,
        commands
      );
      const plantHealthProjection = this.projectPlantHealth(
        plantResponse,
        predictedConditions
      );
      const energyEfficiency = this.calculateEnergyEfficiency(
        commands,
        currentConditions
      );
      const recommendations = this.generateRecommendations(
        commands,
        plantHealthProjection
      );

      return {
        commands,
        predictedConditions,
        plantHealthProjection,
        energyEfficiency,
        recommendations,
      };
    } catch (error) {
      console.error("Error optimizing climate:", error);
      throw error;
    }
  }

  private generateControlCommands(
    currentConditions: CurrentConditions,
    plantResponse: PlantResponse,
    targets: ClimateTargets,
    timeOfDay: number
  ): ClimateControlCommand[] {
    const commands: ClimateControlCommand[] = [];

    // Temperature control
    const tempCommand = this.analyzeTemperatureControl(
      currentConditions.temperature,
      targets.temperature,
      plantResponse
    );
    if (tempCommand) commands.push(tempCommand);

    // Humidity control
    const humidityCommand = this.analyzeHumidityControl(
      currentConditions.humidity,
      targets.humidity,
      plantResponse
    );
    if (humidityCommand) commands.push(humidityCommand);

    // Light control
    const lightCommand = this.analyzeLightControl(
      currentConditions.lightIntensity,
      targets.lightIntensity,
      timeOfDay,
      plantResponse
    );
    if (lightCommand) commands.push(lightCommand);

    // Ventilation control
    const ventilationCommand = this.analyzeVentilationControl(
      currentConditions,
      plantResponse
    );
    if (ventilationCommand) commands.push(ventilationCommand);

    return commands;
  }

  private analyzeTemperatureControl(
    currentTemp: number,
    targetTemp: { min: number; optimal: number; max: number },
    plantResponse: PlantResponse
  ): ClimateControlCommand | null {
    const tempDiff = currentTemp - targetTemp.optimal;
    const healthScore = plantResponse.healthScore;

    if (Math.abs(tempDiff) < 1) {
      return null; // Temperature is optimal
    }

    let action: "increase" | "decrease" | "maintain" = "maintain";
    let intensity = 0;
    let priority: "low" | "medium" | "high" | "critical" = "low";
    let reasoning = "";

    if (currentTemp > targetTemp.max) {
      action = "decrease";
      intensity = Math.min(100, Math.abs(tempDiff) * 20);
      priority = currentTemp > targetTemp.max + 5 ? "critical" : "high";
      reasoning = `Temperature ${currentTemp}°C exceeds maximum ${targetTemp.max}°C`;
    } else if (currentTemp < targetTemp.min) {
      action = "increase";
      intensity = Math.min(100, Math.abs(tempDiff) * 20);
      priority = currentTemp < targetTemp.min - 5 ? "critical" : "high";
      reasoning = `Temperature ${currentTemp}°C below minimum ${targetTemp.min}°C`;
    } else if (tempDiff > 0) {
      action = "decrease";
      intensity = Math.min(50, Math.abs(tempDiff) * 10);
      priority = healthScore < 70 ? "high" : "medium";
      reasoning = `Temperature ${currentTemp}°C above optimal ${targetTemp.optimal}°C`;
    } else {
      action = "increase";
      intensity = Math.min(50, Math.abs(tempDiff) * 10);
      priority = healthScore < 70 ? "high" : "medium";
      reasoning = `Temperature ${currentTemp}°C below optimal ${targetTemp.optimal}°C`;
    }

    return {
      action,
      parameter: "temperature",
      intensity,
      duration: 30, // 30 minutes
      priority,
      reasoning,
    };
  }

  private analyzeHumidityControl(
    currentHumidity: number,
    targetHumidity: { min: number; optimal: number; max: number },
    plantResponse: PlantResponse
  ): ClimateControlCommand | null {
    const humidityDiff = currentHumidity - targetHumidity.optimal;
    const healthScore = plantResponse.healthScore;

    if (Math.abs(humidityDiff) < 5) {
      return null; // Humidity is optimal
    }

    let action: "increase" | "decrease" | "maintain" = "maintain";
    let intensity = 0;
    let priority: "low" | "medium" | "high" | "critical" = "low";
    let reasoning = "";

    if (currentHumidity > targetHumidity.max) {
      action = "decrease";
      intensity = Math.min(100, Math.abs(humidityDiff) * 2);
      priority =
        currentHumidity > targetHumidity.max + 10 ? "critical" : "high";
      reasoning = `Humidity ${currentHumidity}% exceeds maximum ${targetHumidity.max}%`;
    } else if (currentHumidity < targetHumidity.min) {
      action = "increase";
      intensity = Math.min(100, Math.abs(humidityDiff) * 2);
      priority =
        currentHumidity < targetHumidity.min - 10 ? "critical" : "high";
      reasoning = `Humidity ${currentHumidity}% below minimum ${targetHumidity.min}%`;
    } else if (humidityDiff > 0) {
      action = "decrease";
      intensity = Math.min(50, Math.abs(humidityDiff));
      priority = healthScore < 70 ? "high" : "medium";
      reasoning = `Humidity ${currentHumidity}% above optimal ${targetHumidity.optimal}%`;
    } else {
      action = "increase";
      intensity = Math.min(50, Math.abs(humidityDiff));
      priority = healthScore < 70 ? "high" : "medium";
      reasoning = `Humidity ${currentHumidity}% below optimal ${targetHumidity.optimal}%`;
    }

    return {
      action,
      parameter: "humidity",
      intensity,
      duration: 45, // 45 minutes
      priority,
      reasoning,
    };
  }

  private analyzeLightControl(
    currentLight: number,
    targetLight: { min: number; optimal: number; max: number },
    timeOfDay: number,
    plantResponse: PlantResponse
  ): ClimateControlCommand | null {
    // Check if it's during light hours (6 AM to 10 PM)
    const isLightHours = timeOfDay >= 6 && timeOfDay <= 22;

    if (!isLightHours) {
      // During dark hours, ensure lights are off
      if (currentLight > 0) {
        return {
          action: "decrease",
          parameter: "light",
          intensity: 100,
          duration: 60,
          priority: "medium",
          reasoning: "Dark period - turning off lights",
        };
      }
      return null;
    }

    const lightDiff = currentLight - targetLight.optimal;
    const healthScore = plantResponse.healthScore;

    if (Math.abs(lightDiff) < 100) {
      return null; // Light is optimal
    }

    let action: "increase" | "decrease" | "maintain" = "maintain";
    let intensity = 0;
    let priority: "low" | "medium" | "high" | "critical" = "low";
    let reasoning = "";

    if (currentLight > targetLight.max) {
      action = "decrease";
      intensity = Math.min(100, Math.abs(lightDiff) / 100);
      priority = currentLight > targetLight.max + 1000 ? "critical" : "high";
      reasoning = `Light intensity ${currentLight} lux exceeds maximum ${targetLight.max} lux`;
    } else if (currentLight < targetLight.min) {
      action = "increase";
      intensity = Math.min(100, Math.abs(lightDiff) / 100);
      priority = currentLight < targetLight.min - 1000 ? "critical" : "high";
      reasoning = `Light intensity ${currentLight} lux below minimum ${targetLight.min} lux`;
    } else if (lightDiff > 0) {
      action = "decrease";
      intensity = Math.min(50, Math.abs(lightDiff) / 200);
      priority = healthScore < 70 ? "high" : "medium";
      reasoning = `Light intensity ${currentLight} lux above optimal ${targetLight.optimal} lux`;
    } else {
      action = "increase";
      intensity = Math.min(50, Math.abs(lightDiff) / 200);
      priority = healthScore < 70 ? "high" : "medium";
      reasoning = `Light intensity ${currentLight} lux below optimal ${targetLight.optimal} lux`;
    }

    return {
      action,
      parameter: "light",
      intensity,
      duration: 60, // 1 hour
      priority,
      reasoning,
    };
  }

  private analyzeVentilationControl(
    currentConditions: CurrentConditions,
    plantResponse: PlantResponse
  ): ClimateControlCommand | null {
    const { temperature, humidity } = currentConditions;
    const healthScore = plantResponse.healthScore;

    // Ventilation needed for high humidity or temperature
    let action: "increase" | "decrease" | "maintain" = "maintain";
    let intensity = 0;
    let priority: "low" | "medium" | "high" | "critical" = "low";
    let reasoning = "";

    if (humidity > 85 || temperature > 26) {
      action = "increase";
      intensity = humidity > 90 || temperature > 28 ? 100 : 70;
      priority = humidity > 90 || temperature > 28 ? "critical" : "high";
      reasoning = `High ${
        humidity > 85 ? "humidity" : "temperature"
      } - increasing ventilation`;
    } else if (humidity < 50 && temperature < 18) {
      action = "decrease";
      intensity = 50;
      priority = "medium";
      reasoning = "Low humidity and temperature - reducing ventilation";
    } else if (healthScore < 60) {
      action = "increase";
      intensity = 30;
      priority = "medium";
      reasoning = "Poor plant health - increasing air circulation";
    } else {
      return null; // No ventilation adjustment needed
    }

    return {
      action,
      parameter: "ventilation",
      intensity,
      duration: 30,
      priority,
      reasoning,
    };
  }

  private predictConditions(
    currentConditions: CurrentConditions,
    commands: ClimateControlCommand[]
  ): CurrentConditions {
    const predicted = { ...currentConditions };

    commands.forEach((command) => {
      const change = command.intensity * (command.duration / 60); // Change per hour

      switch (command.parameter) {
        case "temperature":
          if (command.action === "increase") {
            predicted.temperature += change * 0.5; // 0.5°C per hour max
          } else if (command.action === "decrease") {
            predicted.temperature -= change * 0.5;
          }
          break;
        case "humidity":
          if (command.action === "increase") {
            predicted.humidity += change * 2; // 2% per hour max
          } else if (command.action === "decrease") {
            predicted.humidity -= change * 2;
          }
          break;
        case "light":
          if (command.action === "increase") {
            predicted.lightIntensity += change * 100; // 100 lux per hour max
          } else if (command.action === "decrease") {
            predicted.lightIntensity -= change * 100;
          }
          break;
      }
    });

    // Ensure values stay within reasonable bounds
    predicted.temperature = Math.max(10, Math.min(35, predicted.temperature));
    predicted.humidity = Math.max(30, Math.min(95, predicted.humidity));
    predicted.lightIntensity = Math.max(
      0,
      Math.min(10000, predicted.lightIntensity)
    );

    return predicted;
  }

  private projectPlantHealth(
    currentResponse: PlantResponse,
    predictedConditions: CurrentConditions
  ): number {
    let projectedHealth = currentResponse.healthScore;

    // Temperature impact
    const tempDiff = Math.abs(predictedConditions.temperature - 21); // Optimal temperature
    if (tempDiff > 5) {
      projectedHealth -= tempDiff * 2;
    }

    // Humidity impact
    const humidityDiff = Math.abs(predictedConditions.humidity - 70); // Optimal humidity
    if (humidityDiff > 15) {
      projectedHealth -= humidityDiff;
    }

    // Light impact
    if (predictedConditions.lightIntensity < 2000) {
      projectedHealth -= 10;
    } else if (predictedConditions.lightIntensity > 8000) {
      projectedHealth -= 5;
    }

    return Math.max(0, Math.min(100, projectedHealth));
  }

  private calculateEnergyEfficiency(
    commands: ClimateControlCommand[],
    currentConditions: CurrentConditions
  ): number {
    let efficiency = 100;

    // Reduce efficiency for excessive control actions
    const totalIntensity = commands.reduce(
      (sum, cmd) => sum + cmd.intensity,
      0
    );
    efficiency -= totalIntensity * 0.1;

    // Reduce efficiency for extreme conditions
    const tempDiff = Math.abs(currentConditions.temperature - 21);
    const humidityDiff = Math.abs(currentConditions.humidity - 70);

    efficiency -= tempDiff * 2;
    efficiency -= humidityDiff * 0.5;

    return Math.max(0, Math.min(100, efficiency));
  }

  private generateRecommendations(
    commands: ClimateControlCommand[],
    projectedHealth: number
  ): string[] {
    const recommendations: string[] = [];

    const criticalCommands = commands.filter(
      (cmd) => cmd.priority === "critical"
    );
    const highPriorityCommands = commands.filter(
      (cmd) => cmd.priority === "high"
    );

    if (criticalCommands.length > 0) {
      recommendations.push("CRITICAL: Immediate climate adjustments required");
      criticalCommands.forEach((cmd) => {
        recommendations.push(`- ${cmd.reasoning}`);
      });
    }

    if (highPriorityCommands.length > 0) {
      recommendations.push("High priority climate adjustments needed");
      highPriorityCommands.forEach((cmd) => {
        recommendations.push(`- ${cmd.reasoning}`);
      });
    }

    if (projectedHealth < 70) {
      recommendations.push(
        "Monitor plant health closely - conditions may be suboptimal"
      );
    }

    if (commands.length === 0) {
      recommendations.push(
        "Climate conditions are optimal - maintain current settings"
      );
    }

    return recommendations;
  }

  public async updateHistoricalData(
    conditions: CurrentConditions,
    response: PlantResponse
  ): Promise<void> {
    this.historicalData.push({ conditions, response });

    // Keep only last 1000 records
    if (this.historicalData.length > 1000) {
      this.historicalData = this.historicalData.slice(-1000);
    }
  }

  public async learnOptimalConditions(): Promise<{
    optimalTemperature: number;
    optimalHumidity: number;
    optimalLightIntensity: number;
    confidence: number;
  }> {
    if (this.historicalData.length < 10) {
      return {
        optimalTemperature: 21,
        optimalHumidity: 70,
        optimalLightIntensity: 5000,
        confidence: 0.5,
      };
    }

    // Find conditions that led to best plant health
    const healthyResponses = this.historicalData.filter(
      (d) => d.response.healthScore >= 80
    );

    if (healthyResponses.length === 0) {
      return {
        optimalTemperature: 21,
        optimalHumidity: 70,
        optimalLightIntensity: 5000,
        confidence: 0.5,
      };
    }

    const avgTemp =
      healthyResponses.reduce((sum, d) => sum + d.conditions.temperature, 0) /
      healthyResponses.length;
    const avgHumidity =
      healthyResponses.reduce((sum, d) => sum + d.conditions.humidity, 0) /
      healthyResponses.length;
    const avgLight =
      healthyResponses.reduce(
        (sum, d) => sum + d.conditions.lightIntensity,
        0
      ) / healthyResponses.length;
    const confidence = Math.min(0.95, healthyResponses.length / 100);

    return {
      optimalTemperature: Math.round(avgTemp * 10) / 10,
      optimalHumidity: Math.round(avgHumidity),
      optimalLightIntensity: Math.round(avgLight / 100) * 100,
      confidence,
    };
  }
}
