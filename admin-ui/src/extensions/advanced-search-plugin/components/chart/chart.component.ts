import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    CategoryScale,
    Chart,
    ChartConfiguration,
    Filler,
    FillTarget,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    TimeSeriesScale,
    Title,
    Tooltip,
} from 'chart.js';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    TimeSeriesScale,
    Title,
    Tooltip,
    Filler,
);

@Component({
    selector: 'vdr-chart',
    template: `<div><canvas #canvas></canvas></div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
    @Input() config: ChartConfiguration;

    @HostListener('window:resize')
    onResize() {
        this.resized$.next(null);
    }

    @ViewChild('canvas')
    private canvasRef: ElementRef<HTMLCanvasElement>;
    private chart: Chart;
    private resized$ = new Subject();
    private subscription: Subscription;

    ngOnInit() {
        this.subscription = this.resized$.pipe(debounceTime(100)).subscribe(() => {
            if (this.chart) {
                this.chart.resize();
            }
        });
    }

    ngOnChanges() {
        if (this.canvasRef?.nativeElement) {
            if (!this.chart) {
                this.chart = new Chart(this.canvasRef.nativeElement, this.config);
            } else {
                this.chart.data = this.config.data;
                this.chart.update();
            }
        }
    }

    ngOnDestroy() {
        if (this.chart) {
            this.chart.destroy();
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
