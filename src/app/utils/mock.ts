// utils/data.ts
export interface DataPoint {
    time: Date;
    value: number;
  }
  
  export const generateMockData = (): DataPoint[] => {
    const now = new Date();
    const data: DataPoint[] = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        time: new Date(now.getTime() - i * 60000),
        value: Math.random() * 100,
      });
    }
    return data.reverse();
  };

  export const generateTradingData = (): DataPoint[] => {
    const now = new Date();
    const data: DataPoint[] = [];
    const initialPrice = 100; // Initial price
    let previousPrice = initialPrice;

    for (let i = 0; i < 100; i++) {
        const time = new Date(now.getTime() - i * 60000); // Time in the past
        const priceChange = (Math.random() - 0.5) * 20; // Random price change
        const newValue = previousPrice + priceChange; // New price
        const value = Math.max(1, newValue); // Ensure price is positive

        data.push({
            time,
            value,
        });

        previousPrice = value;
    }

    return data.reverse();
};

  
  export const generateNewDataPoint = (lastValue: number): DataPoint => {
    return {
      time: new Date(),
      value: lastValue + (Math.random() - 0.5) * 10,
    };
  };
  