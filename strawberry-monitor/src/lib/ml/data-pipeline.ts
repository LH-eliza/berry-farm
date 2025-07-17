import {
  MLPipeline,
  MLPipelineResult,
  SensorData,
  PlantImage,
  PlantData,
} from "./ml-pipeline";

export interface DataSource {
  id: string;
  type: "sensor" | "camera" | "manual";
  location: string;
  status: "active" | "inactive" | "error";
  lastUpdate: Date;
}

export interface EdgeProcessingResult {
  processed: boolean;
  quality: "high" | "medium" | "low";
  confidence: number;
  metadata: Record<string, any>;
}

export interface CloudStorageConfig {
  bucket: string;
  region: string;
  retentionDays: number;
  compression: boolean;
}

export interface DataPipelineConfig {
  edgeProcessing: {
    enabled: boolean;
    maxProcessingTime: number; // ms
    qualityThreshold: number;
  };
  cloudStorage: CloudStorageConfig;
  mlPipeline: {
    batchSize: number;
    processingInterval: number; // ms
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

export interface PipelineMetrics {
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  averageProcessingTime: number;
  dataQualityScore: number;
  lastUpdate: Date;
}

export class DataPipeline {
  private mlPipeline: MLPipeline;
  private config: DataPipelineConfig;
  private metrics: PipelineMetrics;
  private dataQueue: Array<{
    sensorData: SensorData;
    plantImage: PlantImage;
    plantData: PlantData;
    timestamp: Date;
  }> = [];

  constructor(config: DataPipelineConfig) {
    this.mlPipeline = new MLPipeline();
    this.config = config;
    this.metrics = {
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: 0,
      averageProcessingTime: 0,
      dataQualityScore: 100,
      lastUpdate: new Date(),
    };
  }

  public async ingestData(
    sensorData: SensorData,
    plantImage: PlantImage,
    plantData: PlantData
  ): Promise<void> {
    try {
      console.log(`Ingesting data for plant ${plantData.id}...`);

      // Add to processing queue
      this.dataQueue.push({
        sensorData,
        plantImage,
        plantData,
        timestamp: new Date(),
      });

      this.metrics.totalRecords++;
      this.updateMetrics();

      // Process immediately if queue is small, otherwise batch process
      if (this.dataQueue.length >= this.config.mlPipeline.batchSize) {
        await this.processBatch();
      }
    } catch (error) {
      console.error("Error ingesting data:", error);
      this.metrics.failedRecords++;
      this.updateMetrics();
      throw error;
    }
  }

  public async processBatch(): Promise<MLPipelineResult[]> {
    if (this.dataQueue.length === 0) {
      return [];
    }

    const startTime = Date.now();
    const batch = this.dataQueue.splice(0, this.config.mlPipeline.batchSize);
    const results: MLPipelineResult[] = [];

    try {
      console.log(`Processing batch of ${batch.length} records...`);

      // Process each record in the batch
      for (const record of batch) {
        try {
          const result = await this.processRecord(record);
          results.push(result);
          this.metrics.processedRecords++;
        } catch (error) {
          console.error(
            `Error processing record for plant ${record.plantData.id}:`,
            error
          );
          this.metrics.failedRecords++;
        }
      }

      // Store results in cloud storage
      await this.storeResults(results);

      const processingTime = Date.now() - startTime;
      this.updateProcessingTime(processingTime);
      this.updateMetrics();

      console.log(`Batch processing completed in ${processingTime}ms`);
    } catch (error) {
      console.error("Error processing batch:", error);
      this.metrics.failedRecords += batch.length;
      this.updateMetrics();
      throw error;
    }

    return results;
  }

  private async processRecord(record: {
    sensorData: SensorData;
    plantImage: PlantImage;
    plantData: PlantData;
    timestamp: Date;
  }): Promise<MLPipelineResult> {
    const startTime = Date.now();

    try {
      // Edge processing
      const edgeResult = await this.edgeProcess(record);

      if (!edgeResult.processed) {
        throw new Error(
          `Edge processing failed: quality ${edgeResult.quality}`
        );
      }

      // ML pipeline processing
      const mlResult = await this.mlPipeline.processPlantData(
        record.plantData,
        record.sensorData,
        record.plantImage
      );

      const processingTime = Date.now() - startTime;

      // Check processing time threshold
      if (processingTime > this.config.edgeProcessing.maxProcessingTime) {
        console.warn(
          `Processing time ${processingTime}ms exceeds threshold ${this.config.edgeProcessing.maxProcessingTime}ms`
        );
      }

      return mlResult;
    } catch (error) {
      console.error("Error processing record:", error);
      throw error;
    }
  }

  private async edgeProcess(record: {
    sensorData: SensorData;
    plantImage: PlantImage;
    plantData: PlantData;
    timestamp: Date;
  }): Promise<EdgeProcessingResult> {
    // Simulate edge processing
    const quality = this.assessDataQuality(record);
    const confidence = this.calculateConfidence(record);
    const processed =
      quality !== "low" &&
      confidence > this.config.edgeProcessing.qualityThreshold;

    return {
      processed,
      quality,
      confidence,
      metadata: {
        imageSize: record.plantImage.url.length,
        sensorCount: Object.keys(record.sensorData).length,
        processingTime: Date.now() - record.timestamp.getTime(),
      },
    };
  }

  private assessDataQuality(record: {
    sensorData: SensorData;
    plantImage: PlantImage;
    plantData: PlantData;
    timestamp: Date;
  }): "high" | "medium" | "low" {
    let qualityScore = 100;

    // Check sensor data quality
    if (
      record.sensorData.temperature < 10 ||
      record.sensorData.temperature > 35
    ) {
      qualityScore -= 20;
    }
    if (record.sensorData.humidity < 30 || record.sensorData.humidity > 95) {
      qualityScore -= 20;
    }
    if (
      record.sensorData.soilMoisture < 20 ||
      record.sensorData.soilMoisture > 100
    ) {
      qualityScore -= 20;
    }

    // Check image quality
    if (!record.plantImage.url || record.plantImage.url.length < 100) {
      qualityScore -= 30;
    }

    // Check data freshness
    const age = Date.now() - record.timestamp.getTime();
    if (age > 300000) {
      // 5 minutes
      qualityScore -= 20;
    }

    if (qualityScore >= 80) return "high";
    if (qualityScore >= 60) return "medium";
    return "low";
  }

  private calculateConfidence(record: {
    sensorData: SensorData;
    plantImage: PlantImage;
    plantData: PlantData;
    timestamp: Date;
  }): number {
    let confidence = 0.8; // Base confidence

    // Sensor data confidence
    const sensorValues = [
      record.sensorData.temperature,
      record.sensorData.humidity,
      record.sensorData.soilMoisture,
      record.sensorData.lightIntensity,
      record.sensorData.ph,
      record.sensorData.ec,
    ];

    const validSensors = sensorValues.filter(
      (val) => val !== null && val !== undefined && val >= 0
    );
    confidence += (validSensors.length / sensorValues.length) * 0.2;

    // Image confidence
    if (record.plantImage.url && record.plantImage.url.length > 1000) {
      confidence += 0.1;
    }

    // Plant data confidence
    if (
      record.plantData.healthScore >= 0 &&
      record.plantData.healthScore <= 100
    ) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  private async storeResults(results: MLPipelineResult[]): Promise<void> {
    try {
      console.log(`Storing ${results.length} results to cloud storage...`);

      // Simulate cloud storage upload
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("Results stored successfully");
    } catch (error) {
      console.error("Error storing results:", error);
      throw error;
    }
  }

  private updateProcessingTime(processingTime: number): void {
    const currentAvg = this.metrics.averageProcessingTime;
    const recordCount = this.metrics.processedRecords;

    this.metrics.averageProcessingTime =
      (currentAvg * (recordCount - 1) + processingTime) / recordCount;
  }

  private updateMetrics(): void {
    this.metrics.lastUpdate = new Date();

    // Calculate data quality score
    const totalRecords = this.metrics.totalRecords;
    const failedRecords = this.metrics.failedRecords;

    if (totalRecords > 0) {
      this.metrics.dataQualityScore = Math.max(
        0,
        100 - (failedRecords / totalRecords) * 100
      );
    }

    // Check alert thresholds
    this.checkAlertThresholds();
  }

  private checkAlertThresholds(): void {
    const thresholds = this.config.monitoring.alertThresholds;

    if (this.metrics.averageProcessingTime > thresholds.processingTime) {
      console.warn(
        `Processing time ${this.metrics.averageProcessingTime}ms exceeds threshold ${thresholds.processingTime}ms`
      );
    }

    const errorRate = this.metrics.failedRecords / this.metrics.totalRecords;
    if (errorRate > thresholds.errorRate) {
      console.warn(
        `Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold ${(
          thresholds.errorRate * 100
        ).toFixed(2)}%`
      );
    }

    if (this.metrics.dataQualityScore < thresholds.dataQuality) {
      console.warn(
        `Data quality score ${this.metrics.dataQualityScore} below threshold ${thresholds.dataQuality}`
      );
    }
  }

  public getMetrics(): PipelineMetrics {
    return { ...this.metrics };
  }

  public getQueueStatus(): {
    queueLength: number;
    estimatedProcessingTime: number;
  } {
    const queueLength = this.dataQueue.length;
    const estimatedProcessingTime =
      queueLength * this.metrics.averageProcessingTime;

    return {
      queueLength,
      estimatedProcessingTime,
    };
  }

  public async forceProcess(): Promise<MLPipelineResult[]> {
    console.log("Force processing all queued data...");
    return await this.processBatch();
  }

  public async clearQueue(): Promise<void> {
    console.log(`Clearing queue of ${this.dataQueue.length} items...`);
    this.dataQueue = [];
  }

  public async updateConfig(
    newConfig: Partial<DataPipelineConfig>
  ): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    console.log("Data pipeline configuration updated");
  }
}
