import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { take, tap } from 'rxjs/operators';
import { format, parseISO } from 'date-fns';
import { transaction, category, subscriptionContainer } from '../services/transaction.interface'

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    expenseCategoryList : category[] = [];
    incomeCategoryList : category[] = [];
    accountList : string[] = [];
    addingExpense = "true";
    initSema : number = 0;
    initData : boolean[] = [false, false, false];

    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) { 
        console.log('tab1 constructor');
        this.dataService.trackMe();

    }
    
    newTransactionForm = this.formBuilder.group({
        date: ['', Validators.required],
        category: [ '', Validators.required],
        account: [ '', Validators.required],
        amount: [0, Validators.required],
        notes: ['']
    });

    subs : subscriptionContainer = new subscriptionContainer();
    async ionViewDidEnter(){
        console.log('ionViewDidEnter tab1');
        this.subs.add = this.dataService.expenseCategoryList.subscribe(list => {
                this.expenseCategoryList = list;
                if (this.initData[0]) {
                    return;
                }
                if (!this.expenseCategoryList.length) {
                    return;
                }
                console.log('-->expense init subscription initialized');
                console.log(list);
                this.initSema = this.initSema + 1;
                this.initData[0]=true;
                if (this.initSema == 3) {
                    this.resetForm();
                }
            });
        this.subs.add = this.dataService.incomeCategoryList.subscribe(list => {
                this.incomeCategoryList = list;
                if (this.initData[1]) {
                    return;
                }
                if (!this.incomeCategoryList.length) {
                    return;
                }
                console.log('-->income init subscription initialized');
                console.log(list);
                this.initSema = this.initSema + 1;
                this.initData[1]=true;
                if (this.initSema == 3) {
                    this.resetForm();
                }
            });
        this.subs.add = this.dataService.accountList.subscribe(list => {
                this.accountList = list;
                if (this.initData[2]) {
                    return;
                }
                if (!this.accountList.length) {
                    return;
                }
                console.log('-->accounts init subscription initialized');
                console.log(list);
                this.initSema = this.initSema + 1;
                this.initData[2]=true;
                if (this.initSema == 3) {
                    this.resetForm();
                }
            });
        console.log('tab1 ngOnInit done subscribing');
        // this.dataService.expenseCategoryList.pipe( take(1));
        // this.resetForm();
    }

    ionViewWillLeave() {
        console.log('ionViewWillLeave tab1');
        this.subs.unsubscribe();
    }

    async resetForm() {
        console.log('Reset form');
        if (!this.expenseCategoryList.length) {
            console.log('gotcha!');
            this.dataService.expenseCategoryList.pipe( 
                take(1), 
                tap(_ => { console.log('haha'); })
            );
        }
        let newValue;
        let datenow = (new Date(Date.now())).toISOString();
        datenow = format(parseISO(datenow), 'yyyy-MM-dd');
        if (this.newTransactionForm.status == 'VALID') {
            newValue = {
                date: this.newTransactionForm.value['date']!,
                category: this.newTransactionForm.value['category']!,
                account: this.newTransactionForm.value['account']!,
                amount: this.newTransactionForm.value['amount']!,
                notes: this.newTransactionForm.value['notes']!
            }
        } else {
            newValue = {
                date: datenow,
                category: "",
                account: this.accountList[0],
                amount: 0,
                notes: ''
            }
        }

        this.newTransactionForm.reset();
        if (this.addingExpense == "true") {
            newValue['category'] = this.expenseCategoryList[0]['name'];
        } else {
            newValue['category'] = this.incomeCategoryList[0]['name'];
        }

        this.newTransactionForm.setValue(newValue);

    }

    async onSubmit(): Promise<void> {
        if (this.newTransactionForm.status != 'VALID') {
            console.log(this.newTransactionForm.value);
            console.log('Invalid input');
            return;
        }
        if (this.newTransactionForm.value["amount"] as number == 0) {
            console.log('no price defined');
            return;
        }

        let incomeFactor : number = -1
        if (this.addingExpense == 'false') {
            incomeFactor = 1;
        }
        let newTransaction :transaction = { 
            date:       this.newTransactionForm.value["date"] as string,
            category:   this.newTransactionForm.value["category"] as string,
            account:    this.newTransactionForm.value["account"] as string,
            amount:     incomeFactor*(this.newTransactionForm.value["amount"] as number),
            notes:      this.newTransactionForm.value["notes"] as string
        }

        console.log(newTransaction);
        await this.dataService.addTransactions(newTransaction);
        this.resetForm();
    }
}
