import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';

import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { filter } from 'rxjs/operators';


const TRANSACTIONS = 'transactions'
const CATEGORIES = 'categories'

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private storageReady = new BehaviorSubject(false);

    constructor(private storage: Storage) { 
    }

    async init() {
        await this.storage.defineDriver(CordovaSQLiteDriver);
        await this.storage.create();
        this.storageReady.next(true);
    }

    getTransactions() {
        return this.getData(TRANSACTIONS);
    }

    getCategories() {
        return this.getData(CATEGORIES);
    }

    addCategories(item: any) {
        return this.addData(CATEGORIES, item);
    }

    addTransactions(item: any) {
        return this.addData(TRANSACTIONS, item)
    }

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
        console.log('Done clearing database');
    }

    async removeCategory(index: number) {
        console.log('Removing ', index, ' item');
        await this.removeItem(CATEGORIES, index);
        console.log('Done removing ', index, ' item');
    }

    async removeItem(key: string, index: number) {
        const storedData = await this.storage.get(key);
        storedData.splice(index,1);
        return this.storage.set(key, storedData);
    }
}
