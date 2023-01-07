import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    categoryList : string[] = [];
    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) { }
    
    newTransactionForm = this.formBuilder.group({
        date: ['', Validators.required],
        category: ['', Validators.required],
        amount: [0, Validators.required],
        notes: ['']
    });

    async ngOnInit(){
        this.dataService.categoryList.subscribe(list => this.categoryList = list)
    }

    async onSubmit(): Promise<void> {
        if (this.newTransactionForm.status == 'VALID') {
            console.log(this.newTransactionForm.value);
            this.newTransactionForm.reset();
        } else {
            console.log('Invalid input');
        }
    }
}
