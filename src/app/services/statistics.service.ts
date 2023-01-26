import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { DataService } from '../services/data.service';
import { category, transaction, reduceTransaction, filterTransaction } from './transaction.interface';

const ms2UnixDate = 86400000;

@Injectable({
    providedIn: 'root'
})

export class StatisticsService {

    private balanceSource = new BehaviorSubject({});
    balanceWeekSource = new BehaviorSubject([] as string[][]);
    weekExpensesSource = new BehaviorSubject([] as string[][]);
    weekIncomeSource  = new BehaviorSubject([] as string[][]);

    weekArrayExpenses = this.weekExpensesSource.asObservable();
    weekArrayIncome = this.weekIncomeSource.asObservable();

    balance = this.balanceSource.asObservable();
    balanceWeekArray = this.balanceWeekSource.asObservable();

    transactionList: transaction[] = [];
    accountList: string[] = [];
    expenseCategoryList : category[] = [];
    incomeCategoryList : category[] = [];

    constructor(
        private dataService: DataService
    ) { 
        this.init();
    }

    init() {
        this.dataService.transactionList.subscribe(list => {
            this.transactionList = list;
            if (list.length) {
                this.updateBalance();
            }
        });
        this.dataService.expenseCategoryList.subscribe(list => {
            this.expenseCategoryList = list;
            if (list.length) {
                this.updateBalance();
            }
        });
        this.dataService.incomeCategoryList.subscribe(list => {
            this.incomeCategoryList = list;
            if (list.length) {
                this.updateBalance();
            }
        });
        this.dataService.accountList.subscribe(list => this.accountList = list);
    }

    updateBalance() {
        let bbt = [] as string[][];
        let week_range = this.getCurrentWeekDateRange();
        let bt = [] as string[];
        for (let day of week_range) {
            bt.push(this.getDaysBalance(day).toString());
        }
        bbt.push(bt);
        bt = [] as string[];
        for (let day of week_range) {
            bt.push(this.getDaysBudget(day).toString());
        }
        bbt.push(bt);
        console.log('update balance in service');
        console.log(bbt);
        this.balanceWeekSource.next(bbt);
        this.buildWeekarray();
    }

    private buildWeekarray() {
        let weekArray : string[][] = [];

        for (let cat of this.expenseCategoryList) {
            let weekLine : string[] = [];
            let week_range = this.getCurrentWeekDateRange();
            weekLine.push(cat['color']);
            weekLine.push(cat['name']);
            for (let day of week_range) {
                weekLine.push(this.getCategoryDaysBalance(cat['name'], day).toString());
            }
            weekArray.push(weekLine);
        }
        this.weekExpensesSource.next(weekArray);
        weekArray = [];
        for (let cat of this.incomeCategoryList) {
            let weekLine : string[] = [];
            let week_range = this.getCurrentWeekDateRange();
            weekLine.push(cat['color']);
            weekLine.push(cat['name']);
            for (let day of week_range) {
                weekLine.push(this.getCategoryDaysBalance(cat['name'], day).toString());
            }
            weekArray.push(weekLine);
        }
        this.weekIncomeSource.next(weekArray);
    }

    getDaysBalance(untilDate: string) {
        return this.getBalance([], [], untilDate);
    }

    getDaysBudget(untilDate: string) {
        return this.getBalance([], [], untilDate, untilDate);
    }

    getCategoryDaysBalance(cat : string, untilDate: string) {
        return this.getBalance([], [cat], untilDate, untilDate);
    }

    getBalance( account: string[] = [], category: string[] = [], untilDate: string, fromDate: string = "0000-00-00") {
        let tr = filterTransaction(this.transactionList, account, category, untilDate, fromDate);
        return tr.reduce(reduceTransaction, 0);
    }

    getCurrentWeekDateRange() {
        let d = this.getCurrentWeekDay();
        let weekRange = [];
        for (let i=1; i<=7; i++) {
            weekRange.push(this.getFormatedDay(i-d));
        }
        return weekRange;
    }

    getCurrentWeekDay(): number {
        return (new Date(Date.now())).getDay();
    }

    private getFormatedDay(dayOffset: number = 0) : string{
        return this.formatDate(new Date(Date.now() + dayOffset*ms2UnixDate));
    }

    private formatDate(d: Date) : string {
        return format(parseISO(d.toISOString()), 'yyyy-MM-dd');
    }

    getCurrentMonthsTransactions(accounts: string[] = [], categories: string[] = []) {
        let today = this.getFormatedDay();
        return filterTransaction(this.transactionList, accounts, categories, `${today.slice(0,-2)}00`, today);
    }

    getTodaysTransactions(accounts: string[] = [], categories: string[] = []) {
        let today = this.getFormatedDay();
        return filterTransaction(this.transactionList, accounts, categories, today, today);
    }
}
