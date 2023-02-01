import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { format, parseISO } from 'date-fns';
import { DataService } from '../services/data.service';
import { category, transaction, reduceTransaction, filterTransaction, subscriptionContainer } from './transaction.interface';
import { isRegExp } from 'util';

const ms2UnixDate = 86400000;

@Injectable({
    providedIn: 'root'
})

export class StatisticsService {

    private balanceViewSource = new BehaviorSubject([] as string[][]);
    private weekExpensesSource = new BehaviorSubject([] as string[][]);
    private weekIncomeSource  = new BehaviorSubject([] as string[][]);

    weekArrayExpenses = this.weekExpensesSource.asObservable();
    weekArrayIncome = this.weekIncomeSource.asObservable();
    balanceViewArray = this.balanceViewSource.asObservable();

    transactionList: transaction[] = [];
    accountList: string[] = [];
    expenseCategoryList : category[] = [];
    incomeCategoryList : category[] = [];

    currentWeekViewOffset : number = 0;
    currentMonthViewOffset : number = 0;

    private isReady = 3;
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
                if (list != null && list.length) {
                    this.isReady--;
                    if (this.isReady == 0) {
                        this.updateBalance();
                    }
                }
            });
        this.subs.add = this.dataService.expenseCategoryList.subscribe(list => {
                this.expenseCategoryList = list;
                if (list != null && list.length) {
                    this.isReady--;
                    if (this.isReady == 0) {
                        this.updateBalance();
                    }
                }
            });
        this.subs.add = this.dataService.incomeCategoryList.subscribe(list => {
                this.incomeCategoryList = list;
                if (list != null && list.length) {
                    this.isReady--;
                    if (this.isReady == 0) {
                        this.updateBalance();
                    }
                }
            });
        this.subs.add = this.dataService.accountList.subscribe(list => this.accountList = list);
    }

    cleanUp() {
        this.subs.unsubscribe();
    }

    changeWeekViewOffset(forward: boolean = true) {
        console.log('Change offset');
        let offset = this.currentWeekViewOffset;
        this.currentWeekViewOffset = forward ? offset + 1 : offset - 1;
        console.log(this.currentWeekViewOffset);
        this.updateBalance();
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
        this.balanceViewSource.next(bbt);
        this.buildWeekarray();
    }

    private buildWeekarray() {
        let weekArray : string[][] = [];

        let week_range = this.getCurrentWeekViewDateRange();
        for (let cat of this.expenseCategoryList) {
            let weekLine : string[] = [];
            weekLine.push(cat['color']);
            weekLine.push(cat['name']);
            for (let day of week_range) {
                weekLine.push(this.getCategoryDaysBalance(cat['name'], day).toFixed(2));
            }
            weekArray.push(weekLine);
        }
        console.log(weekArray);
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
        console.log(weekArray);
        this.weekIncomeSource.next(weekArray);
    }

    private buildMontharray() {
        let monthArray : string[][] = [];

        let month_range = this.getCurrentMonthViewDateRange();
        for (let week of month_range) {
            let weekLine : string[] = [];
            weekLine.push('000000');
            weekLine.push(week[0]);
            for (let day of week) {
                weekLine.push(this.getDaysBalance(day).toFixed(2));
            }
            monthArray.push(weekLine);
        }
        this.weekExpensesSource.next(monthArray);
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
    getCurrentMonthViewDateRange(): string[][] {
        let d = this.getCurrentWeekDay();
        let dm = this.getCurrentMonthDay();
        let monthRange :string[][]= [][7];

        let week_offset = 0;
        while (d - dm > 1) {
            let weekRange = [];
            for (let i=1; i<=7; i++) {
                let offset = 7*week_offset;
                weekRange.push(this.getFormatedDay(i-d + offset));
            }
            monthRange.push(weekRange);
            dm -= 7;
        }
        monthRange.reverse();
        dm = this.getCurrentMonthDay() + 7;
        while (d - dm < 32) {
            let weekRange = [];
            for (let i=1; i<=7; i++) {
                let offset = 7*week_offset;
                weekRange.push(this.getFormatedDay(i-d + offset));
            }
            monthRange.push(weekRange);
            dm += 7;
        }
        return monthRange;
    }

    getCurrentWeekDay(): number {
        return (new Date(Date.now())).getDay();
    }

    getCurrentMonthDay(): number {
        return (new Date(Date.now())).getDate();
    }

    getCurrentMonth(): number {
        return (new Date(Date.now())).getMonth();
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
