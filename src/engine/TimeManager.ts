export class TimeManager {
    private useRealTime: boolean;
    private speedFactor: number = 1;
  
    constructor(useRealTime: boolean = true, speedFactor: number = 1) {
      this.useRealTime = useRealTime;
      this.speedFactor = speedFactor;
    }
  
    public async delay(ms: number): Promise<void> {
      if (!this.useRealTime) {
        return new Promise(resolve => setTimeout(resolve, 500));
      }
  
      const adjustedMs = Math.floor(ms / this.speedFactor);
      
      return new Promise(resolve => setTimeout(resolve, adjustedMs));
    }
  
    public getElapsedTime(timestamp: number): number {
      return Date.now() - timestamp;
    }
  
    public formatTime(ms: number): string {
      if (ms < 60000) {
        return `${Math.floor(ms / 1000)} seconds`;
      } else if (ms < 3600000) {
        return `${Math.floor(ms / 60000)} minutes`;
      } else if (ms < 86400000) {
        return `${Math.floor(ms / 3600000)} hours`;
      } else {
        return `${Math.floor(ms / 86400000)} days`;
      }
    }
  
    public toggleRealTime(): boolean {
      this.useRealTime = !this.useRealTime;
      return this.useRealTime;
    }
  
    public setSpeedFactor(factor: number): void {
      if (factor > 0) {
        this.speedFactor = factor;
      }
    }
  
    public getCompletionTime(durationMs: number): Date {
      const completionTime = new Date();
      completionTime.setTime(completionTime.getTime() + durationMs);
      return completionTime;
    }
  
    public formatTimestamp(timestamp: number): string {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }