import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { DataService } from '../services/data.service';

@Injectable({
    providedIn: 'root'
})
export class StatisticsService {

    private balanceSource = new BehaviorSubject({
        current: 0
    });

    balance = this.balanceSource.asObservable();

    transactionList = [];
    constructor(
        private dataService: DataService
    ) { }

    ngOnInit() {
        this.dataService.transactionList.subscribe(list => this.transactionList = list);
    }

    updateBalance() {
        let today = this.getTodaysBalance();
        this.balanceSource.next({
            current: today
        });
    }

    getTodaysBalance() {
        let datenow = (new Date(Date.now())).toISOString();
        datenow = format(parseISO(datenow), 'yyyy-MM-dd');
        return this.getDateBalance("0000-00-00", datenow);
    }

    getDateBalance(fromDate: string, untilDate: string, categoryFilter?: string) {
        let transactionBalance = 0;

        let hasFilter = false;
        if ( typeof categoryFilter !== 'undefined' ) {
            hasFilter = true;
        }

        for (let item of this.transactionList) {
            if (item["date"] > untilDate) {
                break;
            }
            if (item["date"] > fromDate) {
                if (hasFilter) {
                    if (item["category"] == categoryFilter) {
                        transactionBalance = transactionBalance + item["amount"];
                    }
                } else {
                    transactionBalance = transactionBalance + item["amount"];
                }
            }
        };

        return transactionBalance;
    }

}
