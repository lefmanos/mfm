import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
    transactionList = [];

    constructor(private dataService: DataService) {
    }

    async ngOnInit(){
        this.dataService.transactionList.subscribe(list => this.transactionList = list)
    }

    printSum() {
        let sum = 0;
        for (let tr of this.transactionList) {
            sum += tr["amount"];
        }
        console.log('sum: ', sum);
    }

}
