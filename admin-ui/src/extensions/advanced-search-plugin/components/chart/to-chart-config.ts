import { ChartConfiguration } from 'chart.js';

export interface SimpleChartConfig {
    title: string;
    data: Array<{ x: any; y: number }>;
    color: `#${string}`;
    isPercentageChart?: boolean;
}

export function toLineChartConfig(config: SimpleChartConfig): ChartConfiguration {
    return {
        type: 'line',
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'category',
                },
                y: {
                    ticks: {
                        callback: (tickValue) => {
                            return config.isPercentageChart ? tickValue + '%' : tickValue;
                        },
                    },
                },
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'x',
                    callbacks: {
                        label: (tooltipItem) => {
                            return config.isPercentageChart
                                ? ((tooltipItem.raw as any).y as number).toFixed(2) + '%'
                                : tooltipItem.formattedValue;
                        },
                    },
                },
            },
        },
        data: {
            datasets: [
                {
                    label: config.title,
                    data: config.data,
                    fill: 'origin',
                    borderColor: config.color,
                    backgroundColor: config.color + '55',
                    tension: 0.3,
                },
            ],
        },
    };
}
