import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { format, parseISO } from 'date-fns';
import { category } from '../services/transaction.interface';

@Component({
    selector: 'app-tab3',
    templateUrl: 'tab3.page.html',
    styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

    expenseCategoryList : category[] = [];
    incomeCategoryList : category[] = [];
    accountList : string[] = [];
    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        console.log('ngOnInit tab3');
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

    async onSubmit(isExpense : boolean): Promise<void> {
        if (this.newCategoryForm.status != 'VALID') {
            console.log('invalid input');
        }

        let newCategory : category = {
            name: this.newCategoryForm.value['categoryName'] as string,
            color: this.newCategoryForm.value['color'] as string
        }
        console.log(newCategory);
        if (isExpense) {
            await this.dataService.addExpenseCategory(newCategory);
        } else {
            await this.dataService.addIncomeCategory(newCategory);
        }
        this.newCategoryForm.reset();
    }

    async onSubmitAccount(): Promise<void> {
        if (this.newAccountForm.status == 'VALID') {
            console.log('invalid input');
        }

        let newAccount = this.newAccountForm.value["accountName"] || "";
        console.log(this.newAccountForm.value);
        await this.dataService.addAccount(newAccount);
        console.log(this.accountList);
        this.newAccountForm.reset();
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
