import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';

import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { filter } from 'rxjs/operators';
import { category, transaction, compareTransaction } from './transaction.interface';

const TRANSACTIONS = 'transactions'
const EXPENSECAT = 'expence_categories'
const INCOMECAT = 'income_categories'
const ACCOUNTS = 'accounts'

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private storageReady = new BehaviorSubject(false);
    private expenseCategorySource = new BehaviorSubject([] as category[]);
    private incomeCategorySource = new BehaviorSubject([] as category[]);
    private transactionsSource = new BehaviorSubject([] as transaction[]);
    private accountsSource = new BehaviorSubject([]);
    expenseCategoryList = this.expenseCategorySource.asObservable();
    incomeCategoryList = this.incomeCategorySource.asObservable();
    transactionList = this.transactionsSource.asObservable();
    accountList = this.accountsSource.asObservable();

    constructor(private storage: Storage) { 
        this.init();
    }

    async init() {
        await this.storage.defineDriver(CordovaSQLiteDriver);
        await this.storage.create();
        this.loadAll();
        this.storageReady.next(true);
    }

    async ngOnInit(){
        this.loadAll();
    }

    async addAccount(item: string) {
        await this.addData(ACCOUNTS, item);
        this.loadAccounts();
    }

    async removeAccount(index: number) {
        await this.removeItem(ACCOUNTS, index);
        this.loadAccounts();
    }

    async addIncomeCategory(item: category) {
        await this.addData(INCOMECAT, item);
        this.loadCategories();
    }

    async removeIncomeCategory(index: number) {
        await this.removeItem(INCOMECAT, index);
        this.loadCategories();
    }

    async addExpenseCategory(item: category) {
        await this.addData(EXPENSECAT, item);
        this.loadCategories();
    }

    async removeExpenseCategory(index: number) {
        await this.removeItem(EXPENSECAT, index);
        this.loadCategories();
    }

    async addTransactions(item: transaction) {
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
        this.loadAccounts();
        this.loadTransactions();
    }

    private loadAccounts() {
        this.getData(ACCOUNTS).subscribe(res => {
            this.accountsSource.next(res);
        });
    }
    private loadTransactions() {
        this.getData(TRANSACTIONS).subscribe(res => {
            if (res != null) {
                res.sort(compareTransaction);
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
