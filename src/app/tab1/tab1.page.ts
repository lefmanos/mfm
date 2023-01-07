import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { format, parseISO } from 'date-fns';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    expenseCategoryList : string[] = [];
    incomeCategoryList : string[] = [];
    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) { }
    
    newTransactionForm = this.formBuilder.group({
        date: [null],
        category: ['', Validators.required],
        amount: [0, Validators.required],
        notes: ['']
    });

    async ngOnInit(){
        this.dataService.expenseCategoryList.subscribe(list => this.expenseCategoryList = list)
        this.dataService.incomeCategoryList.subscribe(list => this.incomeCategoryList = list)
    }

    async onSubmit(): Promise<void> {
        if (this.newTransactionForm.status == 'VALID') {

            let datenow = this.newTransactionForm.value["date"] || (new Date(Date.now())).toISOString();
            datenow = format(parseISO(datenow), 'yyyy-MM-dd');
            console.log(datenow);
            let newTransaction = { 
                date: datenow,
                category:   this.newTransactionForm.value["category"],
                amount:     this.newTransactionForm.value["amount"],
                notes:      this.newTransactionForm.value["notes"]
            }
            console.log(newTransaction);
            await this.dataService.addTransactions(newTransaction);
            this.newTransactionForm.reset();
        } else {
            console.log('Invalid input');
        }
    }
}
