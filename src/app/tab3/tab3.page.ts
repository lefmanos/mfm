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
    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.dataService.expenseCategoryList.subscribe(list => this.expenseCategoryList = list)
        this.dataService.incomeCategoryList.subscribe(list => this.incomeCategoryList = list)
    }

    newCategoryForm = this.formBuilder.group({
        categoryName: ['', Validators.required]
    });

    async onSubmit(isExpense : boolean): Promise<void> {
        if (this.newCategoryForm.status == 'VALID') {
            let newCat = this.newCategoryForm.value["categoryName"];
            console.log(newCat);
            if (isExpense) {
                await this.dataService.addExpenseCategory(newCat);
            } else {
                await this.dataService.addIncomeCategory(newCat);
            }
            console.log(this.expenseCategoryList);
            this.newCategoryForm.reset();

        } else if (this.newCategoryForm.status == 'INVALID') {
            console.log('invalid input');
        }

    }

    async removeExpenseCategory(i : number): Promise<void> {
        await this.dataService.removeExpenseCategory(i);
    }

    async removeIncomeCategory(i : number): Promise<void> {
        await this.dataService.removeIncomeCategory(i);
    }

    async clearData() {
        await this.dataService.clearData();
    }

    printList() {
        var datenow = (new Date(Date.now())).toISOString();
        console.log(format(parseISO(datenow), 'yyyy-MM-dd-hh'));
    }
}
