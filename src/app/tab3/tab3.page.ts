import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { format, parseISO } from 'date-fns';

@Component({
    selector: 'app-tab3',
    templateUrl: 'tab3.page.html',
    styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

    expenseCategoryList : string[] = [];
    incomeCategoryList : string[] = [];
    accountList : string[] = [];
    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.dataService.expenseCategoryList.subscribe(list => this.expenseCategoryList = list);
        this.dataService.incomeCategoryList.subscribe(list => this.incomeCategoryList = list);
        this.dataService.accountList.subscribe(list => this.accountList = list);
    }

    color ='';
    newCategoryForm = this.formBuilder.group({
        categoryName: ['', Validators.required],
        color: ['']
    });

    newAccountForm = this.formBuilder.group({
        accountName: ['', Validators.required]
    });

    eventOccur(event: any) {
    }

    async onSubmit(isExpense : boolean): Promise<void> {
        if (this.newCategoryForm.status == 'VALID') {
            let newCat = this.newCategoryForm.value["categoryName"] || "";
            console.log(newCat);
            if (isExpense) {
                await this.dataService.addExpenseCategory(newCat);
            } else {
                await this.dataService.addIncomeCategory(newCat);
            }
            this.newCategoryForm.reset();
        } else if (this.newCategoryForm.status == 'INVALID') {
            console.log('invalid input');
        }
    }

    async onSubmitAccount(): Promise<void> {
        if (this.newAccountForm.status == 'VALID') {
            let newAccount = this.newAccountForm.value["accountName"] || "";
            console.log(this.newAccountForm.value);
            await this.dataService.addAccount(newAccount);
            console.log(this.accountList);
            this.newAccountForm.reset();
        } else if (this.newAccountForm.status == 'INVALID') {
            console.log('invalid input');
        }
    }

    async removeExpenseCategory(i : number): Promise<void> {
        await this.dataService.removeExpenseCategory(i);
    }

    async removeIncomeCategory(i : number): Promise<void> {
        await this.dataService.removeIncomeCategory(i);
    }

    async removeAccount(i : number): Promise<void> {
        await this.dataService.removeAccount(i);
    }

    async clearData() {
        await this.dataService.clearData();
    }

    printList() {
        var datenow = (new Date(Date.now())).toISOString();
        console.log(format(parseISO(datenow), 'yyyy-MM-dd-hh'));
    }
}
