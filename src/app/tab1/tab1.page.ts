import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { format, parseISO } from 'date-fns';
import { transaction } from '../services/transaction.interface'

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    expenseCategoryList : string[] = [];
    incomeCategoryList : string[] = [];
    accountList : string[] = [];
    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) { }
    
    newTransactionForm = this.formBuilder.group({
        date: ['', Validators.required],
        category: [ '', Validators.required],
        account: [ '', Validators.required],
        amount: [0, Validators.required],
        notes: ['']
    });

    async ngOnInit(){
        this.dataService.expenseCategoryList.subscribe(list => this.expenseCategoryList = list)
        this.dataService.incomeCategoryList.subscribe(list => this.incomeCategoryList = list)
        this.dataService.accountList.subscribe(list => this.accountList = list)

        this.resetForm();
    }

    private resetForm() {
        this.newTransactionForm.reset();
        let datenow = (new Date(Date.now())).toISOString();
        datenow = format(parseISO(datenow), 'yyyy-MM-dd');
        this.newTransactionForm.setValue ({
            date: datenow,
            category: this.expenseCategoryList[0],
            account: this.accountList[0],
            amount: 0,
            notes: ''
        });

    }

    async onSubmit(): Promise<void> {
        if (this.newTransactionForm.status == 'VALID') {

            let newTransaction :transaction = { 
                date:       this.newTransactionForm.value["date"] as string,
                category:   this.newTransactionForm.value["category"] as string,
                account:   this.newTransactionForm.value["account"] as string,
                amount:     this.newTransactionForm.value["amount"] as number,
                notes:      this.newTransactionForm.value["notes"] as string
            }
            console.log(newTransaction);
            await this.dataService.addTransactions(newTransaction);
            this.resetForm();
        } else {
            console.log(this.newTransactionForm.value);
            console.log('Invalid input');
        }
    }
}
