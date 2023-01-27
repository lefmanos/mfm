import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { DataService } from '../services/data.service';
import { category, transaction, reduceTransaction, filterTransaction, subscriptionContainer } from './transaction.interface';

const ms2UnixDate = 86400000;

@Injectable({
    providedIn: 'root'
})

export class StatisticsService {

    private balanceSource = new BehaviorSubject({});
    private balanceWeekSource = new BehaviorSubject([] as string[][]);
    private weekExpensesSource = new BehaviorSubject([] as string[][]);
    private weekIncomeSource  = new BehaviorSubject([] as string[][]);

    weekArrayExpenses = this.weekExpensesSource.asObservable();
    weekArrayIncome = this.weekIncomeSource.asObservable();

    balance = this.balanceSource.asObservable();
    balanceWeekArray = this.balanceWeekSource.asObservable();

    transactionList: transaction[] = [];
    accountList: string[] = [];
    expenseCategoryList : category[] = [];
    incomeCategoryList : category[] = [];

    currentWeekViewOffset : number = 0;
    constructor(
        private dataService: DataService
    ) { 
        this.init();
        this.dataService.trackMe();
    }

    subs : subscriptionContainer = new subscriptionContainer();
    init() {
        this.subs.add = this.dataService.transactionList.subscribe(list => {
                this.transactionList = list;
                if (list.length) {
                    this.updateBalance();
                }
            });
        this.subs.add = this.dataService.expenseCategoryList.subscribe(list => {
                this.expenseCategoryList = list;
                if (list.length) {
                    this.updateBalance();
                }
            });
        this.subs.add = this.dataService.incomeCategoryList.subscribe(list => {
                this.incomeCategoryList = list;
                if (list.length) {
                    this.updateBalance();
                }
            });
        this.subs.add = this.dataService.accountList.subscribe(list => this.accountList = list);
    }

    cleanUp() {
        this.subs.unsubscribe();
    }

    updateBalance() {
        let bbt = [] as string[][];
        let week_range = this.getCurrentWeekViewDateRange();
        let bt = [] as string[];
        for (let day of week_range) {
            bt.push(this.getDaysBalance(day).toFixed(2));
        }
        bbt.push(bt);
        bt = [] as string[];
        for (let day of week_range) {
            bt.push(this.getDaysBudget(day).toFixed(2));
        }
        bbt.push(bt);
        console.log('update balance in service');
        console.log(bbt);
        this.balanceWeekSource.next(bbt);
        this.buildWeekarray();
    }

    private buildWeekarray() {
        let weekArray : string[][] = [];

        let week_range = this.getCurrentWeekDateRange();
        for (let cat of this.expenseCategoryList) {
            let weekLine : string[] = [];
            weekLine.push(cat['color']);
            weekLine.push(cat['name']);
            for (let day of week_range) {
                weekLine.push(this.getCategoryDaysBalance(cat['name'], day).toFixed(2));
            }
            weekArray.push(weekLine);
        }
        this.weekExpensesSource.next(weekArray);
        weekArray = [];
        for (let cat of this.incomeCategoryList) {
            let weekLine : string[] = [];
            weekLine.push(cat['color']);
            weekLine.push(cat['name']);
            for (let day of week_range) {
                weekLine.push(this.getCategoryDaysBalance(cat['name'], day).toFixed(2));
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

    getCurrentWeekViewDateRange() {
        let d = this.getCurrentWeekDay();
        let weekRange = [];
        for (let i=1; i<=7; i++) {
            let offset = 7*this.currentWeekViewOffset;
            weekRange.push(this.getFormatedDay(i-d + offset));
        }
        return weekRange;
    }

    // TODO finish functionality
    getCurrentMonthViewDateRange() {
        let d = this.getCurrentWeekDay();
        let weekRange = [];
        for (let i=1; i<=7; i++) {
            let offset = 7*this.currentWeekViewOffset;
            weekRange.push(this.getFormatedDay(i-d + offset));
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
