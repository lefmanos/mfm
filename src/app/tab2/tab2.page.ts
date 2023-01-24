import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { transaction, category } from '../services/transaction.interface'

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
    transactionList :transaction[] = [];
    expenseCategoryList : category[] = [];
    weekArray = [['', 'Sumary', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']];

    constructor(private dataService: DataService) {
    }

    async ngOnInit(){
        this.dataService.transactionList.subscribe(list => this.transactionList = list);
        this.dataService.expenseCategoryList.subscribe(list => this.expenseCategoryList = list);
        this.buildWeekarray();
    }

    private buildWeekarray() {
        this.weekArray.push(['#deaf42', 'balance', '0', '0', '0', '0', '0', '0', '0']);
        for (let cat of this.expenseCategoryList) {
            this.weekArray.push([cat['color'], cat['name'], '0', '0', '0', '0', '0', '0', '0']);
        }
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
