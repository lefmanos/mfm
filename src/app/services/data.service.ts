import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';

import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { filter } from 'rxjs/operators';


const TRANSACTIONS = 'transactions'
const EXPENSECAT = 'expence_categories'
const INCOMECAT = 'income_categories'

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private storageReady = new BehaviorSubject(false);
    private expenseCategorySource = new BehaviorSubject([]);
    private incomeCategorySource = new BehaviorSubject([]);
    private transactionsSource = new BehaviorSubject([]);
    expenseCategoryList = this.expenseCategorySource.asObservable();
    incomeCategoryList = this.incomeCategorySource.asObservable();
    transactionList = this.transactionsSource.asObservable();

    constructor(private storage: Storage) { 
    }

    async init() {
        await this.storage.defineDriver(CordovaSQLiteDriver);
        await this.storage.create();
        this.storageReady.next(true);
        this.loadAll();
    }

    async addIncomeCategory(item: any) {
        await this.addData(INCOMECAT, item);
        this.loadCategories();
    }

    async removeIncomeCategory(index: number) {
        await this.removeItem(INCOMECAT, index);
        this.loadCategories();
    }

    async addExpenseCategory(item: any) {
        await this.addData(EXPENSECAT, item);
        this.loadCategories();
    }

    async removeExpenseCategory(index: number) {
        await this.removeItem(EXPENSECAT, index);
        this.loadCategories();
    }

    async addTransactions(item: any) {
        await this.addData(TRANSACTIONS, item)
        this.loadTransactions();
    }

    async removeTransaction(index: number) {
        await this.removeItem(TRANSACTIONS, index);
        this.loadTransactions();
    }

    /* shared data helpers */

    private loadAll() {
        this.loadCategories();
        this.loadTransactions();
    }

    private loadTransactions() {
        this.getData(TRANSACTIONS).subscribe(res => {
            if (res != null) {
                res.sort( function(a : any, b : any) {
                    if (a["date"] > b["date"]) {
                        return 1;
                    }

                    if (a["date"] < b["date"]) {
                        return -1;
                    }
                    return 0;
                });
            }
            this.transactionsSource.next(res);
        });
    }

    private loadCategories() {
        this.getData(EXPENSECAT).subscribe(res => {
            this.expenseCategorySource.next(res);
        });
        this.getData(INCOMECAT).subscribe(res => {
            this.incomeCategorySource.next(res);
        });
    }

    /* database API */

    private getData(key: string) {
        return this.storageReady.pipe(
            filter(ready => ready),
            switchMap(_ => {
                return from(this.storage.get(key)) || of([]);
            })
        );
    }

    private async addData(key: string, item: any) {
        const storedTransaction = await this.storage.get(key) || [];
        storedTransaction.push(item);
        return this.storage.set(key, storedTransaction);

    }

    async clearData() {
        console.log('Clearing database');
        this.storage.clear();
        this.loadAll();
        console.log('Done clearing database');
    }

    async removeItem(key: string, index: number) {
        const storedData = await this.storage.get(key);
        storedData.splice(index,1);
        return this.storage.set(key, storedData);
    }
}
