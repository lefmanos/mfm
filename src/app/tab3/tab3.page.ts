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

    categoryList : string[] = [];
    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.dataService.categoryList.subscribe(list => this.categoryList = list)
    }

    newCategoryForm = this.formBuilder.group({
        categoryName: ['', Validators.required]
    });

    async onSubmit(): Promise<void> {
        if (this.newCategoryForm.status == 'VALID') {
            let newCat = this.newCategoryForm.value["categoryName"];
            console.log(newCat);
            await this.dataService.addCategories(newCat);
            console.log(this.categoryList);
            this.newCategoryForm.reset();

        } else if (this.newCategoryForm.status == 'INVALID') {
            console.log('invalid input');
        }

    }

    async removeCategory(i : number): Promise<void> {
        await this.dataService.removeCategory(i);
    }

    async clearData() {
        await this.dataService.clearData();
    }

    printList() {
        var datenow = (new Date(Date.now())).toISOString();
        console.log(format(parseISO(datenow), 'yyyy-MM-dd-hh'));
    }
}
