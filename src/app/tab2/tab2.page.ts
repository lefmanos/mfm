import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { StatisticsService } from '../services/statistics.service';
import { transaction, category, ui_info, subscriptionContainer } from '../services/transaction.interface'


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
    weekBalance : string[][] = [];

    balanceColor = "deaf42";
    constructor(
        private dataService: DataService,
        private stats: StatisticsService
    ) { 
        this.dataService.trackMe();
    }

    subs : subscriptionContainer = new subscriptionContainer();
    async ionViewDidEnter(){
        console.log('ionViewDidEnter tab2');
        this.subs.add = this.stats.balanceWeekArray.subscribe(list => this.weekBalance = list);
        this.subs.add = this.stats.weekArrayIncome.subscribe(list => this.weekArrayIncome = list);
        this.subs.add = this.stats.weekArrayExpenses.subscribe(list => this.weekArrayExpenses = list);
        this.subs.add = this.dataService.transactionList.subscribe(list => { this.transactionList = list; });
        this.subs.add = this.dataService.expenseCategoryList.subscribe(list => { this.expenseCategoryList = list; });
        this.subs.add = this.dataService.incomeCategoryList.subscribe(list => { this.incomeCategoryList = list; });
        this.updateUIData();
    }

    ionViewWillLeave() {
        console.log('ionViewWillLeave tab2');
        this.subs.unsubscribe();
        this.stats.cleanUp();
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
