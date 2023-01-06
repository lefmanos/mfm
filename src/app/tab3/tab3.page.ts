import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';

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
    ) {
        this.loadCategories();
    }

    newCategoryForm = this.formBuilder.group({
        categoryName: ['', Validators.required]
    });

    async onSubmit(): Promise<void> {
        if (this.newCategoryForm.status == 'VALID') {
            let newCat = this.newCategoryForm.value["categoryName"];
            console.log(newCat);
            await this.dataService.addCategories(newCat);
            await this.loadCategories();
            console.log(this.categoryList);

        } else if (this.newCategoryForm.status == 'INVALID') {
            console.log('invalid input');
        }

    }

    async removeCategory(i : number): Promise<void> {
        await this.dataService.removeCategory(i);
        await this.loadCategories();
    }

    async loadCategories() {
        this.dataService.getCategories().subscribe(res => {
            this.categoryList = res;
        });
    }

    async clearData() {
        await this.dataService.clearData();
        await this.loadCategories();
    }

    printList() {
        console.log(this.categoryList);
    }
    async updateCategories(index: number, item: string) {
        return item;
    }
}
