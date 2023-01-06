import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
    listTransactions = [];
    listTransactionsTest = ["adf asd  sdf sdf ", "adfsd", " sdkfjslkflk slkdf jklj  sflkdj"];

    constructor(private dataService: DataService) {
        this.loadTransaction();
    }

    async loadTransaction() {
        this.dataService.getTransactions().subscribe(res => {
            this.listTransactions = res;
        });

    }

}
