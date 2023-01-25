import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { StatisticsService } from '../services/statistics.service';
import { transaction, category, ui_info } from '../services/transaction.interface'


@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
    transactionList :transaction[] = [];
    expenseCategoryList : category[] = [];
    incomeCategoryList : category[] = [];
    ui: ui_info = {
        weekDay : -1,
        isCurrentDate: false,
        weekRange: ['', '']
    };
    weekArray = [['', 'Sumary', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']];
    weekArrayExpenses : string[][] = [];
    weekArrayIncome : string[][] = [];
    weekBalance : number[][] = [];

    balanceColor = "deaf42";
    constructor(
        private dataService: DataService,
        private stats: StatisticsService
    ) { }

    async ngOnInit(){
        console.log('ngOnInit tab2');
        this.stats.balanceWeekArray.subscribe(list => this.weekBalance = list);
        this.stats.weekArrayIncome.subscribe(list => this.weekArrayIncome = list);
        this.stats.weekArrayExpenses.subscribe(list => this.weekArrayExpenses = list);
        this.dataService.transactionList.subscribe(list => { this.transactionList = list; });
        this.dataService.expenseCategoryList.subscribe(list => { this.expenseCategoryList = list; });
        this.dataService.incomeCategoryList.subscribe(list => { this.incomeCategoryList = list; });
        this.updateUIData();
    }

    private updateUIData() {
        this.ui['weekDay'] = this.stats.getCurrentWeekDay();
        this.ui['isCurrentDate'] = true;
        this.ui['weekRange'] = this.stats.getCurrentWeekDateRange();
    }

    printSum() {
        let sum = 0;
        for (let tr of this.transactionList) {
            sum += tr["amount"];
        }
        console.log('sum: ', sum);
    }

    async removeTransaction(i: number): Promise<void> {
        await this.dataService.removeTransaction(i);
    }

}
