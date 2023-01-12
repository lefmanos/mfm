import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { DataService } from '../services/data.service';
import { transaction, reduceTransaction, filterTransaction } from './transaction.interface';

@Injectable({
    providedIn: 'root'
})
export class StatisticsService {

    private balanceSource = new BehaviorSubject({});

    balance = this.balanceSource.asObservable();

    transactionList: transaction[] = [];
    accountList: string[] = [];

    constructor(
        private dataService: DataService
    ) { }

    ngOnInit() {
        this.dataService.transactionList.subscribe(list => this.transactionList = list);
        this.dataService.accountList.subscribe(list => this.accountList = list);
    }

    updateBalance() {
        let balanceStats : {[id: string]: number} = {};
        balanceStats['total'] = this.getTodaysBalance()
        for (let account of this.accountList) {
            balanceStats[account] = this.getTodaysBalance([account]);
        }
        this.balanceSource.next(balanceStats);
    }

    getCurrentMonthsTransactions(accounts: string[] = [], categories: string[] = []) {
        let today = this.getToday();
        return filterTransaction(this.transactionList, accounts, categories, `${today.slice(0,-2)}00`, today);
    }

    getTodaysTransactions(accounts: string[] = [], categories: string[] = []) {
        let today = this.getToday();
        return filterTransaction(this.transactionList, accounts, categories, today, today);
    }

    getTodaysBalance(accounts: string[] = [], categories: string[] = []) {
        let today = this.getToday();
        return this.getBalance(accounts, categories, today);
    }

    getBalance( account: string[] = [], category: string[] = [], untilDate: string, fromDate: string = "0000-00-00") {
        let tr = filterTransaction(this.transactionList, account, category, untilDate, fromDate);
        return tr.reduce(reduceTransaction, 0);
    }

    private formatDate(d: Date) : string {
        return format(parseISO(d.toISOString()), 'yyyy-MM-dd');
    }
    private getToday() : string{
        return this.formatDate(new Date(Date.now()));
    }
}
